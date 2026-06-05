import { Injectable, Logger } from '@nestjs/common';
import { execFile } from 'child_process';
import { existsSync } from 'fs';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// 远程命令超时（调用时读取环境变量，避免模块加载顺序问题）
const getRemoteTimeout = () =>
  Number(process.env['GIT_REMOTE_TIMEOUT_MS'] ?? '120000');
const getHeadTimeout = () =>
  Number(process.env['GIT_REMOTE_HEAD_TIMEOUT_MS'] ?? '60000');

interface GitEnvOptions {
  isContainer?: boolean;
}

const isContainerRuntime = () =>
  process.env['RELAX_GIT_CONTAINER'] === 'true' || existsSync('/.dockerenv');

const isLoopbackProxy = (proxyUrl: string) => {
  try {
    const parsed = new URL(proxyUrl);
    return ['127.0.0.1', 'localhost', '::1'].includes(parsed.hostname);
  } catch {
    return false;
  }
};

const selectProxy = (
  candidates: Array<string | undefined>,
  isContainer: boolean
) => {
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (isContainer && isLoopbackProxy(candidate)) continue;
    return candidate;
  }
  return undefined;
};

export function buildGitCommandEnv(
  baseEnv: NodeJS.ProcessEnv = process.env,
  options: GitEnvOptions = {}
): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...baseEnv };
  const isContainer = options.isContainer ?? isContainerRuntime();

  const httpProxy = selectProxy(
    [baseEnv['GIT_HTTP_PROXY'], baseEnv['HTTP_PROXY'], baseEnv['http_proxy']],
    isContainer
  );
  const httpsProxy = selectProxy(
    [
      baseEnv['GIT_HTTPS_PROXY'],
      baseEnv['HTTPS_PROXY'],
      baseEnv['https_proxy'],
    ],
    isContainer
  );

  delete env['HTTP_PROXY'];
  delete env['http_proxy'];
  delete env['HTTPS_PROXY'];
  delete env['https_proxy'];

  if (httpProxy) {
    env['HTTP_PROXY'] = httpProxy;
    env['http_proxy'] = httpProxy;
  }
  if (httpsProxy) {
    env['HTTPS_PROXY'] = httpsProxy;
    env['https_proxy'] = httpsProxy;
  }

  return env;
}

/**
 * Git验证服务
 * 负责验证Git仓库连接和获取仓库信息
 */
@Injectable()
export class GitValidationService {
  private readonly logger = new Logger(GitValidationService.name);

  private async runGit(args: string[], timeout: number) {
    return execFileAsync('git', args, {
      timeout,
      env: buildGitCommandEnv(),
      maxBuffer: 1024 * 1024,
    });
  }

  /**
   * 验证Git仓库URL是否可访问
   */
  async validateGitUrl(gitUrl: string): Promise<{
    isValid: boolean;
    error?: string;
    branches?: string[];
    defaultBranch?: string;
  }> {
    try {
      this.logger.log(`开始验证Git仓库: ${gitUrl}`);

      // 清理和验证URL
      const sanitizedUrl = this.sanitizeGitUrl(gitUrl);

      // 验证URL格式
      if (!this.isValidGitUrl(sanitizedUrl)) {
        return {
          isValid: false,
          error: '无效的Git仓库URL格式',
        };
      }

      // 尝试获取远程仓库信息
      const result = await this.getRemoteInfo(sanitizedUrl);

      this.logger.log(`Git仓库验证成功: ${gitUrl}`);
      return {
        isValid: true,
        branches: result.branches,
        defaultBranch: result.defaultBranch,
      };
    } catch (error) {
      this.logger.error(`Git仓库验证失败: ${gitUrl}`, error);
      return {
        isValid: false,
        error: this.parseGitError(error),
      };
    }
  }

  /**
   * 清理和验证Git URL，防止命令注入
   */
  private sanitizeGitUrl(url: string): string {
    const sanitized = url.trim();

    // execFile 不经过 shell，但仍拒绝常见命令分隔符和控制字符。
    if (/[\0\r\n;&|`]/.test(sanitized)) {
      throw new Error('Git URL包含非法字符');
    }

    return sanitized;
  }

  /**
   * 检查Git URL格式是否有效
   */
  private isValidGitUrl(url: string): boolean {
    if (this.isLocalGitUrl(url)) {
      return true;
    }

    const gitUrlPatterns = [
      /^https?:\/\/.+\.git$/, // HTTPS
      /^git@.+:.+\.git$/, // SSH
      /^ssh:\/\/git@.+\/.+\.git$/, // SSH with protocol
      /^https?:\/\/github\.com\/.+\/.+$/, // GitHub HTTPS (without .git)
      /^https?:\/\/gitlab\.com\/.+\/.+$/, // GitLab HTTPS (without .git)
      /^https?:\/\/bitbucket\.org\/.+\/.+$/, // Bitbucket HTTPS (without .git)
    ];

    return gitUrlPatterns.some(pattern => pattern.test(url));
  }

  private isLocalGitUrl(url: string): boolean {
    if (url.startsWith('file://')) {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'file:' && parsed.pathname.length > 1;
      } catch {
        return false;
      }
    }

    return url.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(url);
  }

  /**
   * 获取远程仓库信息
   */
  private async getRemoteInfo(gitUrl: string): Promise<{
    branches: string[];
    defaultBranch: string;
  }> {
    try {
      // 使用 git ls-remote 获取远程分支信息
      const { stdout } = await this.runGit(
        ['ls-remote', '--heads', gitUrl],
        getRemoteTimeout()
      );

      const branches = this.parseBranches(stdout);
      const defaultBranch = await this.getDefaultBranch(gitUrl);

      return {
        branches,
        defaultBranch: defaultBranch ?? 'main',
      };
    } catch (error) {
      throw new Error(
        `无法获取远程仓库信息: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 获取仓库的所有分支
   */
  async getBranches(
    gitUrl: string
  ): Promise<Array<{ name: string; isDefault: boolean }>> {
    try {
      const remoteInfo = await this.getRemoteInfo(gitUrl);
      return remoteInfo.branches.map(branchName => ({
        name: branchName,
        isDefault: branchName === remoteInfo.defaultBranch,
      }));
    } catch (error) {
      this.logger.error(`获取分支列表失败: ${gitUrl}`, error);
      throw new Error(
        `无法获取仓库分支信息: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 解析分支列表
   */
  private parseBranches(lsRemoteOutput: string): string[] {
    const lines = lsRemoteOutput.trim().split('\n');
    const branches: string[] = [];

    for (const line of lines) {
      const match = line.match(/refs\/heads\/(.+)$/);
      if (match) {
        if (match[1]) branches.push(match[1]);
      }
    }

    return branches.sort();
  }

  /**
   * 获取默认分支
   */
  private async getDefaultBranch(gitUrl: string): Promise<string | null> {
    try {
      const { stdout } = await this.runGit(
        ['ls-remote', '--symref', gitUrl, 'HEAD'],
        getHeadTimeout()
      );

      const match = stdout.match(/ref: refs\/heads\/(.+)\s+HEAD/);
      return match?.[1] ? match[1] : null;
    } catch (error) {
      this.logger.warn(
        `无法获取默认分支: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * 解析Git错误信息
   */
  private parseGitError(error: any): string {
    const message = error.message || error.toString();

    if (message.includes('not found') || message.includes('does not exist')) {
      return '仓库不存在或无法访问';
    }

    if (
      message.includes('Permission denied') ||
      message.includes('authentication failed')
    ) {
      return '权限不足，请检查访问凭据';
    }

    if (message.includes('timeout') || message.includes('timed out')) {
      return '连接超时，请检查网络连接';
    }

    if (
      message.includes('Name or service not known') ||
      message.includes('nodename nor servname provided')
    ) {
      return '无法解析主机名，请检查URL是否正确';
    }

    return 'Git仓库连接失败，请检查URL和网络连接';
  }

  /**
   * 检查分支是否存在
   */
  async checkBranchExists(
    gitUrl: string,
    branchName: string
  ): Promise<boolean> {
    try {
      const sanitizedUrl = this.sanitizeGitUrl(gitUrl);
      const sanitizedBranch = branchName.replace(/[;&|`$(){}[\]\\]/g, '');

      if (sanitizedBranch !== branchName) {
        throw new Error('分支名称包含非法字符');
      }

      const { stdout } = await this.runGit(
        ['ls-remote', '--heads', sanitizedUrl, sanitizedBranch],
        getHeadTimeout()
      );

      return stdout.trim().length > 0;
    } catch (error) {
      this.logger.error(`检查分支失败: ${branchName}`, error);
      return false;
    }
  }

  /**
   * 获取指定远程分支的 HEAD 提交 SHA
   */
  async getCommitSha(
    gitUrl: string,
    branchName: string
  ): Promise<string | null> {
    try {
      const sanitizedUrl = this.sanitizeGitUrl(gitUrl);
      const sanitizedBranch = branchName.replace(/[;&|`$(){}[\]\\]/g, '');

      if (sanitizedBranch !== branchName) {
        throw new Error('分支名称包含非法字符');
      }

      const { stdout } = await this.runGit(
        ['ls-remote', '--heads', sanitizedUrl, sanitizedBranch],
        getHeadTimeout()
      );

      const out = stdout.trim();
      if (!out) return null;

      // 取第一行：<sha>\trefs/heads/<branch>
      const firstLine = out.split('\n')[0] ?? '';
      const parts = firstLine.split('\t');
      const sha = (parts[0] ?? '').trim();
      if (/^[0-9a-f]{40}$/.test(sha)) {
        return sha;
      }
      return null;
    } catch (error) {
      this.logger.warn(
        `获取分支 HEAD 失败: ${branchName} @ ${gitUrl}: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }
}
