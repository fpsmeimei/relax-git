import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import { PrismaService } from '../../database/prisma.service';
import {
  REPO_ACCESS_KEY,
  RepoAccessMode,
} from '../decorators/repo-access.decorator';

interface RequestLike {
  params?: Record<string, any>;
  query?: Record<string, any>;
  body?: Record<string, any>;
  user?: { id: string; role: UserRole };
}

@Injectable()
export class RepoAccessGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestLike>();
    const mode =
      this.reflector.getAllAndOverride<RepoAccessMode>(REPO_ACCESS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || 'read';

    const userId = req.user?.id as string;
    const userRole = (req.user?.role as UserRole) ?? UserRole.USER;

    const repo = await this.resolveRepository(req);
    if (!repo) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: '仓库不可访问或不存在',
      });
    }

    // 统一接入权限判断工具
    const { canReadRepo, canCommentRepo, canAdminRepo } = await import(
      '../utils/access'
    );

    let ok = false;
    switch (mode) {
      case 'read':
        ok = await canReadRepo(
          this.prisma as any,
          repo as any,
          userId,
          userRole
        );
        break;
      case 'comment':
        ok = await canCommentRepo(
          this.prisma as any,
          repo as any,
          userId,
          userRole
        );
        break;
      case 'admin':
        ok = await canAdminRepo(
          this.prisma as any,
          repo as any,
          userId,
          userRole
        );
        break;
      default:
        ok = await canReadRepo(
          this.prisma as any,
          repo as any,
          userId,
          userRole
        );
        break;
    }

    if (!ok) {
      throw new ForbiddenException({
        code: 'MEMBER_ONLY',
        message: '仅仓库成员或更高权限可执行此操作',
      });
    }

    return true;
  }

  private async resolveRepository(req: RequestLike) {
    const p = req.params ?? {};
    const q = req.query ?? {};
    const b = req.body ?? {};

    // 1) 优先使用显式 repoId 参数
    const explicitRepoId =
      p['repoId'] ||
      p['repositoryId'] ||
      q['repoId'] ||
      q['repositoryId'] ||
      b['repoId'] ||
      b['repositoryId'];
    if (explicitRepoId) {
      return await this.prisma.repository.findUnique({
        where: { id: String(explicitRepoId) },
      });
    }

    // 2) 通用 id 可能是 repositoryId / snapshotId / commentId
    const id = p['id'] || q['id'] || b['id'];
    if (id) {
      const idStr = String(id);
      // 2.1 尝试按仓库ID解析
      const repo = await this.prisma.repository.findUnique({
        where: { id: idStr },
      });
      if (repo) return repo;
      // 2.2 若非仓库，则尝试作为快照ID（BaseSnapshot / SessionSnapshot）反解仓库
      const base = await this.prisma.baseSnapshot.findUnique({
        where: { id: idStr },
        include: { repository: true },
      });
      if (base?.repository) return base.repository;
      const session = await this.prisma.sessionSnapshot.findUnique({
        where: { id: idStr },
        include: { baseSnapshot: { include: { repository: true } } },
      });
      if (session?.baseSnapshot?.repository) {
        return session.baseSnapshot.repository;
      }
      // 2.3 若仍失败，尝试作为评论ID反解仓库（评论关联 BaseSnapshot）
      const comment = await this.prisma.comment.findUnique({
        where: { id: idStr },
        include: { snapshot: { include: { repository: true } } },
      });
      if (comment?.snapshot?.repository) return comment.snapshot.repository;
    }

    // 3) 显式 snapshotId 参数（支持 BaseSnapshot / SessionSnapshot）
    const snapshotId = p['snapshotId'] || q['snapshotId'] || b['snapshotId'];
    if (snapshotId) {
      const sid = String(snapshotId);
      const base = await this.prisma.baseSnapshot.findUnique({
        where: { id: sid },
        include: { repository: true },
      });
      if (base?.repository) return base.repository;
      const session = await this.prisma.sessionSnapshot.findUnique({
        where: { id: sid },
        include: { baseSnapshot: { include: { repository: true } } },
      });
      return session?.baseSnapshot?.repository ?? null;
    }

    // 4) 显式 commentId 参数
    const commentId = p['commentId'] || b['commentId'];
    if (commentId) {
      const comment = await this.prisma.comment.findUnique({
        where: { id: String(commentId) },
        include: { snapshot: { include: { repository: true } } },
      });
      return comment?.snapshot?.repository ?? null;
    }

    return null;
  }

  private async isRepoMember(
    repoId: string,
    userId?: string
  ): Promise<boolean> {
    if (!userId) return false;
    const member = await this.prisma.member.findUnique({
      where: { repoId_userId: { repoId, userId } } as any,
    });
    return !!member;
  }

  private async getMemberRole(
    repoId: string,
    userId?: string
  ): Promise<'OWNER' | 'ADMIN' | 'MEMBER' | null> {
    if (!userId) return null;
    const member = await this.prisma.member.findUnique({
      where: { repoId_userId: { repoId, userId } } as any,
      select: { role: true },
    });
    return (member?.role as any) ?? null;
  }
}
