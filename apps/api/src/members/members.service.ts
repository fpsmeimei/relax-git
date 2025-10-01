import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { MemberRole } from '@relax-git/shared/generated/prisma-client';
import { PrismaService } from '../database/prisma.service';
import { AddMemberDto, QueryMembersDto } from './dto';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async add(
    repoId: string,
    dto: AddMemberDto,
    operatorId: string
  ): Promise<void> {
    const role = dto.role ?? MemberRole.MEMBER;
    await this.prisma.member.upsert({
      where: { repoId_userId: { repoId, userId: dto.userId } } as any,
      update: { role },
      create: { repoId, userId: dto.userId, role },
    });
  }

  async remove(
    repoId: string,
    userId: string,
    operatorId: string
  ): Promise<void> {
    const [target, operator] = await Promise.all([
      this.prisma.member.findUnique({
        where: { repoId_userId: { repoId, userId } } as any,
      }),
      this.prisma.member.findUnique({
        where: { repoId_userId: { repoId, userId: operatorId } } as any,
      }),
    ]);

    if (!target) {
      // 幂等：目标不存在直接返回
      return;
    }
    if (!operator) {
      // 正常情况下，能到这里说明通过了 RepoAccessGuard('admin') 或自删入口
      // 但为了安全，这里仍做保护
      throw new ForbiddenException({
        code: 'MEMBER_ONLY',
        message: '仅仓库成员可执行该操作',
      });
    }

    const isSelf = userId === operatorId;

    // 统计 OWNER 人数，用于保护最后一个 OWNER
    const ownerCount = await this.prisma.member.count({
      where: { repoId, role: MemberRole.OWNER },
    });

    // 角色矩阵：
    // - OWNER：除自删外，只有 OWNER 可移除 OWNER；自删需至少还有其他 OWNER
    // - ADMIN：OWNER 可移除；ADMIN 可自删；其他无权
    // - MEMBER：ADMIN/OWNER 可移除；成员可自删

    if (target.role === MemberRole.OWNER) {
      if (isSelf) {
        if (ownerCount <= 1) {
          throw new BadRequestException({
            code: 'LAST_OWNER_NOT_REMOVABLE',
            message: '最后一个 OWNER 不可移除或降级',
          });
        }
      } else {
        if (operator.role !== MemberRole.OWNER) {
          throw new ForbiddenException({
            code: 'ROLE_OPERATION_FORBIDDEN',
            message: '仅 OWNER 可执行该操作',
          });
        }
      }
    } else if (target.role === MemberRole.ADMIN) {
      if (!isSelf && operator.role !== MemberRole.OWNER) {
        throw new ForbiddenException({
          code: 'ROLE_OPERATION_FORBIDDEN',
          message: '仅 OWNER 可执行该操作',
        });
      }
    } else {
      // target is MEMBER
      if (!isSelf && operator.role === MemberRole.MEMBER) {
        throw new ForbiddenException({
          code: 'ROLE_OPERATION_FORBIDDEN',
          message: '仅 OWNER 可执行该操作',
        });
      }
    }

    await this.prisma.member.delete({
      where: { repoId_userId: { repoId, userId } } as any,
    });
  }

  async changeRole(
    repoId: string,
    userId: string,
    operatorId: string,
    newRole: MemberRole
  ): Promise<void> {
    const [target, operator] = await Promise.all([
      this.prisma.member.findUnique({
        where: { repoId_userId: { repoId, userId } } as any,
      }),
      this.prisma.member.findUnique({
        where: { repoId_userId: { repoId, userId: operatorId } } as any,
      }),
    ]);

    if (!operator) {
      throw new ForbiddenException({
        code: 'MEMBER_ONLY',
        message: '仅仓库成员可执行该操作',
      });
    }

    if (!target) {
      // 幂等：目标不存在则不做变更
      return;
    }

    if (target.role === newRole) {
      // 幂等：角色未变化
      return;
    }

    const isSelf = userId === operatorId;
    const ownerCount = await this.prisma.member.count({
      where: { repoId, role: MemberRole.OWNER },
    });

    if (isSelf) {
      // 自身调整：仅 OWNER 可以对自身做降级（且需保留至少一名 OWNER）
      if (operator.role !== MemberRole.OWNER) {
        throw new ForbiddenException({
          code: 'ROLE_OPERATION_FORBIDDEN',
          message: '仅 OWNER 可执行该操作',
        });
      }
      // OWNER 自降级需至少还有其他 OWNER
      if (
        operator.role === MemberRole.OWNER &&
        newRole !== MemberRole.OWNER &&
        ownerCount <= 1
      ) {
        throw new BadRequestException({
          code: 'LAST_OWNER_NOT_REMOVABLE',
          message: '最后一个 OWNER 不可移除或降级',
        });
      }
    } else {
      // 调整他人：仅 OWNER 可操作
      if (operator.role !== MemberRole.OWNER) {
        throw new ForbiddenException({
          code: 'ROLE_OPERATION_FORBIDDEN',
          message: '仅 OWNER 可执行该操作',
        });
      }
      // 将某个 OWNER 降级时，必须保证仍至少保留一名 OWNER
      if (
        target.role === MemberRole.OWNER &&
        newRole !== MemberRole.OWNER &&
        ownerCount <= 1
      ) {
        throw new BadRequestException({
          code: 'LAST_OWNER_NOT_REMOVABLE',
          message: '最后一个 OWNER 不可移除或降级',
        });
      }
    }

    await this.prisma.member.update({
      where: { repoId_userId: { repoId, userId } } as any,
      data: { role: newRole },
    });
  }

  async selfRemove(repoId: string, userId: string): Promise<void> {
    return this.remove(repoId, userId, userId);
  }

  async list(repoId: string, query: QueryMembersDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;

    const userFilter = query.search
      ? {
          user: {
            is: {
              username: { contains: query.search, mode: 'insensitive' },
            },
          },
        }
      : {};

    const where: any = {
      repoId,
      ...(query.role ? { role: query.role } : {}),
      ...userFilter,
    };

    const [items, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
        },
      }),
      this.prisma.member.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }
}
