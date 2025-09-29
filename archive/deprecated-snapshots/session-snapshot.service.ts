import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BaseSnapshot,
  SessionSnapshot,
  SessionSnapshotStatus,
} from '@relax-git/shared/generated/prisma-client';
import { spawn } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import { PrismaService } from '../database/prisma.service';
import { BaseSnapshotService } from './base-snapshot.service';
import { UnifiedSnapshotAccessService } from './services/unified-access.service';

/**
 * 会话快照服务
 * 负责管理用户查看代码时的临时快照（Session Snapshots）
 * 从基础快照派生，只读，TTL清理
 */
@Injectable()
export class SessionSnapshotService {
  private readonly logger = new Logger(SessionSnapshotService.name);
  private readonly defaultTtlMinutes: number;
  private readonly snapshotBasePath: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly baseSnapshotService: BaseSnapshotService,
    private readonly accessService: UnifiedSnapshotAccessService
  ) {
    this.defaultTtlMinutes = this.configService.get<number>(
      'sessionSnapshot.ttlMinutes',
      60
    );
    this.snapshotBasePath = this.configService.get<string>(
      'snapshot.basePath',
      '/tmp/relax-git-sessions'
    );
  }

  /**
   * 为用户创建会话快照
   * 从基础快照派生，用于代码浏览
   */
  async createSessionSnapshot(
    userId: string,
    repoId: string,
    branchId: string
  ): Promise<SessionSnapshot> {
    this.logger.log(
      `Creating session snapshot for user ${userId}, repo ${repoId}, branch ${branchId}`
    );

    // 1. 检查是否已有活跃的会话快照
    const existing = await this.prisma.sessionSnapshot.findFirst({
      where: {
        userId,
        baseSnapshot: {
          repoId,
          branchId,
        },
        status: SessionSnapshotStatus.READY,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        baseSnapshot: {
          include: {
            branch: true,
          },
        },
      },
    });

    if (existing) {
      // 更新最后访问时间
      const updated = await this.prisma.sessionSnapshot.update({
        where: { id: existing.id },
        data: { lastAccessedAt: new Date() },
        include: {
          baseSnapshot: {
            include: {
              branch: true,
            },
          },
        },
      });

      this.logger.log(`Reusing existing session snapshot ${existing.id}`);
      return updated;
    }

    // 2. 获取基础快照
    const baseSnapshot = await this.baseSnapshotService.getBaseSnapshot(
      repoId,
      branchId
    );
    if (!baseSnapshot) {
      throw new NotFoundException('基础快照不存在，请先导入仓库');
    }

    if (baseSnapshot.status !== 'READY') {
      throw new BadRequestException('基础快照尚未就绪，请稍候或刷新页面再试');
    }

    // 3. 创建会话快照记录
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.defaultTtlMinutes);

    const sessionSnapshot = await this.prisma.sessionSnapshot.create({
      data: {
        baseSnapshotId: baseSnapshot.id,
        userId,
        status: SessionSnapshotStatus.CREATING,
        expiresAt,
      },
      include: {
        baseSnapshot: {
          include: {
            branch: true,
          },
        },
      },
    });

    // 4. 异步创建工作树
    this.createWorktreeAsync(sessionSnapshot, baseSnapshot);

    this.logger.log(`Created session snapshot ${sessionSnapshot.id}`);
    return sessionSnapshot;
  }

  /**
   * 获取用户的会话快照
   * 使用统一权限验证服务
   */
  async getSessionSnapshot(
    id: string,
    userId: string,
    userRole?: UserRole
  ): Promise<SessionSnapshot> {
    const sessionSnapshot = await this.prisma.sessionSnapshot.findUnique({
      where: { id },
      include: {
        baseSnapshot: {
          include: {
            branch: true,
            repository: true,
          },
        },
      },
    });

    if (!sessionSnapshot) {
      throw new NotFoundException('会话快照不存在');
    }

    // 使用统一权限验证服务检查访问权限
    await this.accessService.validateSnapshotAccess(
      id,
      userId,
      userRole,
      'read'
    );

    // 额外检查：会话快照只能由创建者访问
    if (sessionSnapshot.userId !== userId) {
      throw new BadRequestException('会话快照只能由创建者访问');
    }

    // 检查是否过期
    if (sessionSnapshot.expiresAt < new Date()) {
      await this.expireSessionSnapshot(sessionSnapshot.id);
      throw new BadRequestException('会话快照已过期');
    }

    // 记录访问统计
    await this.accessService.recordSnapshotAccess(id, userId);

    return sessionSnapshot;
  }

  /**
   * 获取用户的活跃会话快照列表
   */
  async getUserActiveSessionSnapshots(
    userId: string
  ): Promise<SessionSnapshot[]> {
    return this.prisma.sessionSnapshot.findMany({
      where: {
        userId,
        status: SessionSnapshotStatus.READY,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        baseSnapshot: {
          include: {
            branch: true,
            repository: true,
          },
        },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    });
  }

  /**
   * 延长会话快照的TTL
   */
  async extendSessionSnapshot(
    id: string,
    userId: string,
    userRole?: UserRole
  ): Promise<SessionSnapshot> {
    const sessionSnapshot = await this.getSessionSnapshot(id, userId, userRole);

    const newExpiresAt = new Date();
    newExpiresAt.setMinutes(newExpiresAt.getMinutes() + this.defaultTtlMinutes);

    return this.prisma.sessionSnapshot.update({
      where: { id },
      data: {
        expiresAt: newExpiresAt,
        lastAccessedAt: new Date(),
      },
      include: {
        baseSnapshot: {
          include: {
            branch: true,
            repository: true,
          },
        },
      },
    });
  }

  /**
   * 手动删除会话快照
   */
  async deleteSessionSnapshot(
    id: string,
    userId: string,
    userRole?: UserRole
  ): Promise<void> {
    const sessionSnapshot = await this.getSessionSnapshot(id, userId, userRole);
    await this.cleanupSessionSnapshot(sessionSnapshot);
  }

  /**
   * 获取会话快照的文件树
   */
  async getSessionSnapshotTree(
    id: string,
    userId: string,
    dirPath = '',
    userRole?: UserRole
  ): Promise<Array<{ name: string; type: 'dir' | 'file'; size?: number }>> {
    const sessionSnapshot = await this.getSessionSnapshot(id, userId, userRole);

    if (!sessionSnapshot.worktreePath) {
      throw new NotFoundException('会话快照工作树尚未就绪');
    }

    const root = path.resolve(sessionSnapshot.worktreePath);
    const target = path.resolve(path.join(root, dirPath || '.'));
    if (!target.startsWith(root + path.sep) && target !== root) {
      throw new BadRequestException('非法的目录路径');
    }

    try {
      const entries = await fs.readdir(target, { withFileTypes: true });
      const result: Array<{
        name: string;
        type: 'dir' | 'file';
        size?: number;
      }> = [];

      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue; // 跳过隐藏文件

        const entryPath = path.join(target, entry.name);
        const stat = await fs.stat(entryPath);

        result.push({
          name: entry.name,
          type: entry.isDirectory() ? 'dir' : 'file',
          size: entry.isFile() ? stat.size : undefined,
        });
      }

      // 排序：目录在前，文件在后，同类型按名称排序
      result.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'dir' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      return result;
    } catch (e: any) {
      if (e?.code === 'ENOENT') {
        throw new NotFoundException('目录不存在');
      }
      this.logger.warn(`读取会话快照目录失败: ${dirPath} in session ${id}`, e);
      throw new BadRequestException('读取目录失败');
    }
  }

  /**
   * 获取会话快照的文件内容
   */
  async getSessionSnapshotFileContent(
    id: string,
    userId: string,
    filePath: string,
    userRole?: UserRole
  ): Promise<string> {
    if (!filePath || typeof filePath !== 'string') {
      throw new BadRequestException('文件路径无效');
    }

    const sessionSnapshot = await this.getSessionSnapshot(id, userId, userRole);

    if (!sessionSnapshot.worktreePath) {
      throw new NotFoundException('会话快照工作树尚未就绪');
    }

    // 安全拼接与校验，避免越权访问
    const root = path.resolve(sessionSnapshot.worktreePath);
    const target = path.resolve(path.join(root, filePath));
    if (!target.startsWith(root + path.sep) && target !== root) {
      throw new BadRequestException('非法的文件路径');
    }

    try {
      const buf = await fs.readFile(target);
      // 粗略判断二进制：包含大量非可打印字符则拒绝
      const text = buf.toString('utf-8');
      return text;
    } catch (e: any) {
      if (e?.code === 'ENOENT') {
        throw new NotFoundException('文件不存在');
      }
      this.logger.warn(`读取会话快照文件失败: ${filePath} in session ${id}`, e);
      throw new BadRequestException('读取文件失败');
    }
  }

  /**
   * 清理过期的会话快照
   * 由定时任务调用
   */
  async cleanupExpiredSessionSnapshots(): Promise<number> {
    const expiredSnapshots = await this.prisma.sessionSnapshot.findMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { status: SessionSnapshotStatus.EXPIRED },
        ],
      },
    });

    let cleanedCount = 0;
    for (const snapshot of expiredSnapshots) {
      try {
        await this.cleanupSessionSnapshot(snapshot);
        cleanedCount++;
      } catch (error) {
        this.logger.error(
          `Failed to cleanup session snapshot ${snapshot.id}:`,
          error
        );
      }
    }

    this.logger.log(`Cleaned up ${cleanedCount} expired session snapshots`);
    return cleanedCount;
  }

  /**
   * 异步创建工作树
   */
  private async createWorktreeAsync(
    sessionSnapshot: SessionSnapshot,
    baseSnapshot: BaseSnapshot
  ): Promise<void> {
    try {
      // 生成会话快照工作树路径
      const sessionPath = path.join(
        this.snapshotBasePath,
        `session-${sessionSnapshot.id}`
      );

      // 确保目录存在
      await fs.ensureDir(path.dirname(sessionPath));

      if (baseSnapshot.worktreePath) {
        // 有基础快照，快速硬链接/符号链接
        await this.createReadOnlyWorktree(
          baseSnapshot.worktreePath,
          sessionPath
        );
      } else {
        // 兜底路径：基础快照尚未就绪，直接从远端按提交创建只读工作树
        const repoGitUrl = (baseSnapshot as any)?.repository?.gitUrl;
        const commitSha = (baseSnapshot as any)?.commitSha;
        if (!repoGitUrl || !commitSha) {
          throw new Error('缺少仓库地址或提交号，无法创建工作树');
        }
        await this.createWorktreeFromRemote(repoGitUrl, commitSha, sessionPath);
      }

      // 更新会话快照状态
      await this.prisma.sessionSnapshot.update({
        where: { id: sessionSnapshot.id },
        data: {
          status: SessionSnapshotStatus.READY,
          worktreePath: sessionPath,
        },
      });

      this.logger.log(
        `Session snapshot ${sessionSnapshot.id} worktree created at ${sessionPath}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to create worktree for session snapshot ${sessionSnapshot.id}:`,
        error
      );

      await this.prisma.sessionSnapshot.update({
        where: { id: sessionSnapshot.id },
        data: {
          status: SessionSnapshotStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * 创建只读工作树
   */
  private async createReadOnlyWorktree(
    sourcePath: string,
    targetPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const isWindows = process.platform === 'win32';
      let command: string;
      let args: string[];

      if (isWindows) {
        command = 'robocopy';
        args = [sourcePath, targetPath, '/MIR', '/SL'];
      } else {
        command = 'cp';
        args = ['-al', sourcePath, targetPath];
      }

      const child = spawn(command, args);

      child.on('close', code => {
        if (code === 0 || (isWindows && code === 1)) {
          resolve();
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });

      child.on('error', error => {
        reject(error);
      });
    });
  }

  // 当基础快照尚未就绪时，直接从远端仓库按提交号创建只读工作树
  private async createWorktreeFromRemote(
    gitUrl: string,
    commitSha: string,
    targetPath: string
  ): Promise<void> {
    const tmpRoot = path.join(
      this.snapshotBasePath,
      `.tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    );
    const repoPath = path.join(tmpRoot, 'repo');

    try {
      await fs.ensureDir(tmpRoot);
      await this.execCmd(
        'git',
        ['clone', '--no-checkout', gitUrl, 'repo'],
        tmpRoot
      );
      // 确保可以检出特定提交
      await this.execCmd('git', ['fetch', 'origin', commitSha], repoPath);
      await this.execCmd(
        'git',
        ['worktree', 'add', targetPath, commitSha],
        repoPath
      );
    } finally {
      // 清理临时目录
      try {
        await fs.remove(tmpRoot);
      } catch {}
    }
  }

  // 执行外部命令的简易封装
  private execCmd(cmd: string, args: string[], cwd?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, { cwd, shell: false });
      let stderr = '';
      child.stderr?.on('data', d => (stderr += d.toString()));
      child.on('close', code => {
        if (code === 0) return resolve();
        reject(
          new Error(`${cmd} ${args.join(' ')} failed (${code}): ${stderr}`)
        );
      });
      child.on('error', err => reject(err));
    });
  }

  /**
   * 清理会话快照
   */
  private async cleanupSessionSnapshot(
    sessionSnapshot: SessionSnapshot
  ): Promise<void> {
    // 删除工作树
    if (
      sessionSnapshot.worktreePath &&
      (await fs.pathExists(sessionSnapshot.worktreePath))
    ) {
      await fs.remove(sessionSnapshot.worktreePath);
      this.logger.log(
        `Removed worktree for session snapshot ${sessionSnapshot.id}`
      );
    }

    // 删除数据库记录
    await this.prisma.sessionSnapshot.delete({
      where: { id: sessionSnapshot.id },
    });

    this.logger.log(`Cleaned up session snapshot ${sessionSnapshot.id}`);
  }

  /**
   * 标记会话快照为过期
   */
  private async expireSessionSnapshot(id: string): Promise<void> {
    await this.prisma.sessionSnapshot.update({
      where: { id },
      data: { status: SessionSnapshotStatus.EXPIRED },
    });
  }
}
