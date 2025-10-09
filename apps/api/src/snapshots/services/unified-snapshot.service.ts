import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { BaseSnapshot } from '@relax-git/shared/generated/prisma-client';
import {
  SessionSnapshot,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';
import { PrismaService } from '../../database/prisma.service';
import { BaseSnapshotService } from '../base-snapshot.service';
import { UnifiedSnapshotAccessService } from './unified-access.service';
// SessionSnapshotService已废弃，功能已集成到统一服务中
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * 统一快照服务
 * 合并BaseSnapshot和SessionSnapshot的功能，提供统一的文件操作接口
 * 支持共享访问机制和访问跟踪统计
 */
@Injectable()
export class UnifiedSnapshotService {
  private readonly logger = new Logger(UnifiedSnapshotService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: UnifiedSnapshotAccessService,
    private readonly baseSnapshotService: BaseSnapshotService
  ) {}

  /**
   * 统一的快照获取逻辑
   * 支持BaseSnapshot、SessionSnapshot、传统Snapshot等所有类型
   *
   * @param id 快照ID
   * @param userId 用户ID
   * @param userRole 用户角色
   * @returns 快照信息
   */
  async getSnapshot(id: string, userId: string, userRole: UserRole) {
    // 验证权限
    await this.accessService.validateSnapshotAccess(
      id,
      userId,
      userRole,
      'read'
    );

    // 记录访问统计
    await this.accessService.recordSnapshotAccess(id, userId);

    // 1. 尝试BaseSnapshot
    const baseSnapshot = await this.prisma.baseSnapshot.findUnique({
      where: { id },
      include: {
        repository: true,
        branch: true,
      },
    });
    if (baseSnapshot) {
      return this.formatSnapshotResponse(baseSnapshot, 'base');
    }

    // 2. 尝试SessionSnapshot
    const sessionSnapshot = await this.prisma.sessionSnapshot.findUnique({
      where: { id },
      include: {
        baseSnapshot: {
          include: {
            repository: true,
            branch: true,
          },
        },
        user: {
          select: { id: true, username: true },
        },
      },
    });
    if (sessionSnapshot) {
      return this.formatSnapshotResponse(sessionSnapshot, 'session');
    }

    // 3. 传统Snapshot（向后兼容）已移除：不再查询 prisma.snapshot，避免运行时错误
    // 保持默认流程抛出 NotFound

    throw new NotFoundException('快照不存在');
  }

  /**
   * 统一的文件树获取，支持共享访问
   * 多用户可以共享同一个worktree，确保并发安全
   *
   * @param id 快照ID
   * @param userId 用户ID
   * @param userRole 用户角色
   * @param dirPath 目录路径
   * @returns 文件树结构
   */
  async getTree(
    id: string,
    userId: string,
    userRole: UserRole,
    dirPath = ''
  ): Promise<Array<{ name: string; type: 'dir' | 'file'; size?: number }>> {
    // 验证权限
    await this.accessService.validateSnapshotAccess(
      id,
      userId,
      userRole,
      'read'
    );

    // 记录访问统计
    await this.accessService.recordSnapshotAccess(id, userId);

    const worktreePath = await this.getWorktreePath(id);
    if (!worktreePath) {
      throw new NotFoundException('快照工作树尚未就绪');
    }

    const safeDirPath = this.sanitizeRelativeSnapshotPath(
      dirPath,
      true,
      '非法的目录路径'
    );

    return this.readDirectoryTree(worktreePath, safeDirPath);
  }

  /**
   * 统一的文件内容获取
   * 支持共享访问，多用户可以同时读取同一文件
   *
   * @param id 快照ID
   * @param userId 用户ID
   * @param userRole 用户角色
   * @param filePath 文件路径
   * @returns 文件内容
   */
  async getFile(
    id: string,
    userId: string,
    userRole: UserRole,
    filePath: string
  ): Promise<string> {
    if (!filePath || typeof filePath !== 'string') {
      throw new BadRequestException('文件路径无效');
    }

    // 验证权限
    await this.accessService.validateSnapshotAccess(
      id,
      userId,
      userRole,
      'read'
    );

    // 记录访问统计
    await this.accessService.recordSnapshotAccess(id, userId);

    const worktreePath = await this.getWorktreePath(id);
    if (!worktreePath) {
      throw new NotFoundException('快照工作树尚未就绪');
    }

    const safeFilePath = this.sanitizeRelativeSnapshotPath(
      filePath,
      false,
      '文件路径无效'
    );

    return this.readFileContent(worktreePath, safeFilePath);
  }

  /**
   * 创建或获取会话快照
   * 为用户浏览代码创建临时快照，支持共享访问
   *
   * @param userId 用户ID
   * @param repoId 仓库ID
   * @param branchId 分支ID
   * @param userRole 用户角色
   * @returns 会话快照
   */
  async createOrGetSessionSnapshot(
    userId: string,
    repoId: string,
    branchId: string,
    _userRole?: UserRole
  ): Promise<SessionSnapshot> {
    // 验证仓库访问权限
    const repository = await this.prisma.repository.findUnique({
      where: { id: repoId },
    });
    if (!repository) {
      throw new NotFoundException('仓库不存在');
    }

    // 直接实现会话快照创建逻辑（从废弃的SessionSnapshotService迁移）
    // 1. 检查是否已有活跃的会话快照
    const existing = await this.prisma.sessionSnapshot.findFirst({
      where: {
        userId,
        baseSnapshot: {
          repoId,
          branchId,
        },
        status: 'READY',
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
      return await this.prisma.sessionSnapshot.update({
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
    expiresAt.setMinutes(expiresAt.getMinutes() + 60); // 默认60分钟TTL

    const sessionSnapshot = await this.prisma.sessionSnapshot.create({
      data: {
        baseSnapshotId: baseSnapshot.id,
        userId,
        status: 'CREATING',
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

    // 4. 异步创建工作树（简化版本）
    this.createWorktreeAsync(sessionSnapshot, baseSnapshot);

    return sessionSnapshot;
  }

  /**
   * 获取快照的访问统计信息
   *
   * @param id 快照ID
   * @param userId 用户ID
   * @param userRole 用户角色
   * @returns 访问统计信息
   */
  async getSnapshotStats(id: string, userId: string, userRole: UserRole) {
    // 验证权限
    await this.accessService.validateSnapshotAccess(
      id,
      userId,
      userRole,
      'read'
    );

    return this.accessService.getSnapshotAccessStats(id);
  }

  /**
   * 获取快照的工作树路径
   * 统一处理不同类型快照的工作树路径获取，自动修复 Windows 路径
   *
   * @param id 快照ID
   * @returns 工作树路径或null
   */
  private async getWorktreePath(id: string): Promise<string | null> {
    // 1. 尝试BaseSnapshot
    const baseSnapshot = await this.prisma.baseSnapshot.findUnique({
      where: { id },
      select: { id: true, worktreePath: true },
    });
    if (baseSnapshot && baseSnapshot.worktreePath) {
      // 自动修复 Windows 路径
      const fixedPath = await this.autoFixWindowsPath(
        baseSnapshot.id,
        baseSnapshot.worktreePath,
        'worktree'
      );
      return fixedPath;
    }

    // 2. 尝试SessionSnapshot（若自身未写入 worktreePath，回退到其 baseSnapshot 的路径）
    const sessionSnapshot = await this.prisma.sessionSnapshot.findUnique({
      where: { id },
      select: { worktreePath: true, baseSnapshotId: true },
    });
    if (sessionSnapshot) {
      if (sessionSnapshot.worktreePath) return sessionSnapshot.worktreePath;
      if (sessionSnapshot.baseSnapshotId) {
        const base = await this.prisma.baseSnapshot.findUnique({
          where: { id: sessionSnapshot.baseSnapshotId },
          select: { id: true, worktreePath: true },
        });
        if (base?.worktreePath) {
          // 自动修复 Windows 路径
          const fixedPath = await this.autoFixWindowsPath(
            base.id,
            base.worktreePath,
            'worktree'
          );
          return fixedPath;
        }
      }
      return null;
    }

    // 3. 传统Snapshot已移除：不再查询 prisma.snapshot，避免运行时错误

    return null;
  }

  /**
   * 读取目录树结构
   * 支持并发访问，确保文件系统安全
   *
   * @param worktreePath 工作树路径
   * @param dirPath 目录路径
   * @returns 目录条目列表
   */
  private async readDirectoryTree(
    worktreePath: string,
    dirPath: string
  ): Promise<Array<{ name: string; type: 'dir' | 'file'; size?: number }>> {
    const root = path.resolve(worktreePath);
    const target = path.resolve(path.join(root, dirPath || '.'));

    // 安全检查：防止路径遍历攻击
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
        // 跳过隐藏文件和.git目录
        if (entry.name.startsWith('.')) continue;

        const entryPath = path.join(target, entry.name);

        try {
          const stat = await fs.stat(entryPath);
          result.push({
            name: entry.name,
            type: entry.isDirectory() ? 'dir' : 'file',
            size: entry.isFile() ? stat.size : undefined,
          });
        } catch (error) {
          // 如果无法获取文件状态，跳过该条目
          this.logger.warn(`Failed to stat file ${entryPath}:`, error);
          continue;
        }
      }

      // 目录优先排序
      result.sort((a, b) =>
        a.type === b.type
          ? a.name.localeCompare(b.name)
          : a.type === 'dir'
            ? -1
            : 1
      );

      return result;
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        throw new NotFoundException('目录不存在');
      }
      if (error?.code === 'EACCES') {
        throw new ForbiddenException('无权访问此目录');
      }
      this.logger.error(`Failed to read directory ${target}:`, error);
      throw new BadRequestException('读取目录失败');
    }
  }

  /**
   * 读取文件内容
   * 支持并发访问，确保文件系统安全
   *
   * @param worktreePath 工作树路径
   * @param filePath 文件路径
   * @returns 文件内容
   */
  private async readFileContent(
    worktreePath: string,
    filePath: string
  ): Promise<string> {
    const root = path.resolve(worktreePath);
    const target = path.resolve(path.join(root, filePath));

    // 安全检查：防止路径遍历攻击
    if (!target.startsWith(root + path.sep) && target !== root) {
      throw new BadRequestException('非法的文件路径');
    }

    try {
      const stat = await fs.stat(target);
      if (!stat.isFile()) {
        throw new BadRequestException('指定路径不是文件');
      }

      // 检查文件大小，避免读取过大的文件
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      if (stat.size > maxFileSize) {
        throw new BadRequestException('文件过大，无法显示');
      }

      const content = await fs.readFile(target, 'utf8');
      return content;
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        throw new NotFoundException('文件不存在');
      }
      if (error?.code === 'EACCES') {
        throw new ForbiddenException('无权访问此文件');
      }
      if (error?.code === 'EISDIR') {
        throw new BadRequestException('指定路径是目录，不是文件');
      }
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(`Failed to read file ${target}:`, error);
      throw new BadRequestException('读取文件失败');
    }
  }

  /** 会话快照续期（若是BaseSnapshot则为无操作） */
  async extendSessionSnapshot(id: string, userId: string, userRole?: UserRole) {
    // 仅允许本人或管理员续期
    const session = await this.prisma.sessionSnapshot.findUnique({
      where: { id },
      select: { id: true, userId: true, expiresAt: true },
    });

    if (!session) {
      // 不是会话快照或不存在
      throw new NotFoundException('会话快照不存在');
    }

    if (session.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('无权续期此会话');
    }

    const newExpiresAt = new Date();
    newExpiresAt.setMinutes(newExpiresAt.getMinutes() + 60);

    const updated = await this.prisma.sessionSnapshot.update({
      where: { id },
      data: { expiresAt: newExpiresAt, lastAccessedAt: new Date() },
      select: { id: true, expiresAt: true },
    });

    return updated;
  }
  /**
   * 释放会话快照：退出浏览立即删除
   * 仅允许本人或管理员操作
   */
  async releaseSessionSnapshot(
    id: string,
    userId: string,
    userRole?: UserRole
  ): Promise<void> {
    // 查找会话快照
    const session = await this.prisma.sessionSnapshot.findUnique({
      where: { id },
      select: { id: true, userId: true, worktreePath: true },
    });

    if (!session) {
      throw new NotFoundException('会话快照不存在');
    }

    if (session.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('无权释放此会话');
    }

    // 尝试删除工作树目录（忽略错误）
    try {
      if (session.worktreePath) {
        await fs.remove(session.worktreePath);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to remove worktree for session snapshot ${id}:`,
        error
      );
    }

    // 删除数据库记录
    await this.prisma.sessionSnapshot.delete({ where: { id } });
  }

  /**
   * 格式化快照响应
   * 统一不同类型快照的响应格式
   *
   * @param snapshot 快照数据
   * @param type 快照类型
   * @returns 格式化的快照响应
   */
  private formatSnapshotResponse(
    snapshot: any,
    type: 'base' | 'session' | 'traditional'
  ) {
    const baseInfo = {
      id: snapshot.id,
      type,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };

    switch (type) {
      case 'base':
        return {
          ...baseInfo,
          repoId: snapshot.repoId,
          branchId: snapshot.branchId,
          commitSha: snapshot.commitSha,
          status: snapshot.status,
          worktreePath: snapshot.worktreePath,
          bundlePath: snapshot.bundlePath,
          repository: snapshot.repository,
          branch: snapshot.branch,
          owner: snapshot.owner,
          title: snapshot.title,
          description: snapshot.description,
          expiresAt: snapshot.expiresAt,
          lastAccessedAt: snapshot.lastAccessedAt,
          accessCount: snapshot.accessCount,
        };
      case 'session':
        return {
          ...baseInfo,
          baseSnapshotId: snapshot.baseSnapshotId,
          userId: snapshot.userId,
          status: snapshot.status,
          worktreePath: snapshot.worktreePath,
          expiresAt: snapshot.expiresAt,
          lastAccessedAt: snapshot.lastAccessedAt,
          baseSnapshot: snapshot.baseSnapshot,
          user: snapshot.user,
        };
      case 'traditional':
        return {
          ...baseInfo,
          repoId: snapshot.repoId,
          ownerId: snapshot.ownerId,
          commitSha: snapshot.commitSha,
          branchName: snapshot.branchName,
          status: snapshot.status,
          worktreePath: snapshot.worktreePath,
          bundlePath: snapshot.bundlePath,
          title: snapshot.title,
          description: snapshot.description,
          expiresAt: snapshot.expiresAt,
          repository: snapshot.repository,
          owner: snapshot.owner,
        };
      default:
        return baseInfo;
    }
  }

  /**
   * 异步创建工作树
   * 从废弃的SessionSnapshotService迁移而来
   */
  private async createWorktreeAsync(
    sessionSnapshot: SessionSnapshot,
    baseSnapshot: BaseSnapshot
  ): Promise<void> {
    try {
      // 检查基础快照状态
      if (baseSnapshot.status !== 'READY') {
        this.logger.warn(
          `Base snapshot ${baseSnapshot.id} is not ready (status: ${baseSnapshot.status})`
        );

        await this.prisma.sessionSnapshot.update({
          where: { id: sessionSnapshot.id },
          data: {
            status: 'FAILED',
            errorMessage: `基础快照未就绪 (状态: ${baseSnapshot.status})`,
          },
        });
        return;
      }

      // 检查工作树路径
      const worktreePath = baseSnapshot.worktreePath;

      if (!worktreePath) {
        this.logger.error(
          `Base snapshot ${baseSnapshot.id} has no worktree path`
        );

        await this.prisma.sessionSnapshot.update({
          where: { id: sessionSnapshot.id },
          data: {
            status: 'FAILED',
            errorMessage: '基础快照缺少工作树路径',
          },
        });
        return;
      }

      // 自动修复 Windows 路径（如果需要）
      const finalWorktreePath = await this.autoFixWindowsPath(
        baseSnapshot.id,
        worktreePath,
        'worktree'
      );

      // 检查修复后的路径是否可访问
      const pathExists = await fs.pathExists(finalWorktreePath);
      if (!pathExists) {
        this.logger.error(`工作树路径不存在: ${finalWorktreePath}`);

        await this.prisma.sessionSnapshot.update({
          where: { id: sessionSnapshot.id },
          data: {
            status: 'FAILED',
            errorMessage: `工作树路径不存在: ${finalWorktreePath}`,
          },
        });
        return;
      }

      // 会话快照直接共享基础快照的工作树（只读访问）
      await this.prisma.sessionSnapshot.update({
        where: { id: sessionSnapshot.id },
        data: {
          status: 'READY',
          worktreePath: null, // 不复制路径，通过 getWorktreePath() 回退到 base
        },
      });

      this.logger.log(
        `Session snapshot ${sessionSnapshot.id} is ready, sharing worktree: ${worktreePath}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to create worktree for session snapshot ${sessionSnapshot.id}:`,
        error
      );

      try {
        await this.prisma.sessionSnapshot.update({
          where: { id: sessionSnapshot.id },
          data: {
            status: 'FAILED',
            errorMessage:
              error instanceof Error ? error.message : 'Unknown error',
          },
        });
      } catch (updateError) {
        this.logger.error(
          'Failed to update session snapshot status to FAILED:',
          updateError
        );
      }
    }
  }

  /**
   * 自动修复 Windows 路径为 Linux 路径
   */
  private async autoFixWindowsPath(
    baseSnapshotId: string,
    currentPath: string,
    pathType: 'worktree' | 'bundle'
  ): Promise<string> {
    if (!currentPath || !currentPath.includes('C:\\')) {
      return currentPath;
    }

    this.logger.warn(
      `检测到 Windows ${pathType} 路径，尝试自动修复: ${currentPath}`
    );

    let fixedPath: string;
    if (pathType === 'worktree') {
      fixedPath = currentPath
        .replace(/^C:\\temp\\relax-git-repos/, '/tmp/relax-git-worktrees')
        .replace(/\\/g, '/');
    } else {
      fixedPath = currentPath
        .replace(/^C:\\temp\\relax-git-bundles/, '/tmp/relax-git-bundles')
        .replace(/\\/g, '/');
    }

    this.logger.log(`修复后的 ${pathType} 路径: ${fixedPath}`);

    // 更新数据库中的路径
    try {
      const updateData: any = {};
      updateData[pathType === 'worktree' ? 'worktreePath' : 'bundlePath'] =
        fixedPath;

      await this.prisma.baseSnapshot.update({
        where: { id: baseSnapshotId },
        data: updateData,
      });

      this.logger.log(`基础快照 ${pathType} 路径已自动修复: ${baseSnapshotId}`);
      return fixedPath;
    } catch (updateError) {
      this.logger.error(`更新基础快照 ${pathType} 路径失败:`, updateError);
      return currentPath;
    }
  }

  private sanitizeRelativeSnapshotPath(
    input: string | undefined,
    allowEmpty: boolean,
    errorMessage: string
  ): string {
    if (input === undefined || input === null) {
      if (allowEmpty) {
        return '';
      }
      throw new BadRequestException(errorMessage);
    }

    const trimmed = input.trim();
    if (!trimmed) {
      if (allowEmpty) {
        return '';
      }
      throw new BadRequestException(errorMessage);
    }

    const normalized = path.normalize(trimmed);

    if (path.isAbsolute(normalized)) {
      throw new BadRequestException(errorMessage);
    }

    const parts = normalized
      .split(/[\\/]+/g)
      .filter(segment => segment && segment !== '.');

    if (parts.some(segment => segment === '..')) {
      throw new BadRequestException(errorMessage);
    }

    if (parts.length === 0) {
      if (allowEmpty) {
        return '';
      }
      throw new BadRequestException(errorMessage);
    }

    return parts.join(path.sep);
  }
}
