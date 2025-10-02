import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@relax-git/shared/generated/prisma-client';
import { PrismaService } from '../database/prisma.service';
import {
  RepositoryCollectionResponseDto,
  RepositoryLikeResponseDto,
} from './dto/repository-interaction.dto';

/**
 * 仓库互动服务
 * 处理点赞、收藏、评论等社区互动功能
 */
@Injectable()
export class RepositoryInteractionService {
  private readonly logger = new Logger(RepositoryInteractionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 切换仓库点赞状态
   */
  async toggleRepositoryLike(
    repoId: string,
    userId: string
  ): Promise<RepositoryLikeResponseDto> {
    // 检查仓库是否存在且可访问
    const repository = await this.prisma.repository.findFirst({
      where: {
        id: repoId,
        isActive: true,
        OR: [{ visibility: 'PUBLIC' }, { visibility: 'INTERNAL' }],
      },
    });

    if (!repository) {
      throw new NotFoundException('仓库不存在或不可访问');
    }

    const { isLiked, likesCount } = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const existingLike = await tx.repositoryLike.findUnique({
          where: { repoId_userId: { repoId, userId } },
        });

        let liked = false;
        if (existingLike) {
          await tx.repositoryLike.delete({ where: { id: existingLike.id } });
          liked = false;
        } else {
          await tx.repositoryLike.create({ data: { repoId, userId } });
          liked = true;
        }

        const count = await tx.repositoryLike.count({ where: { repoId } });
        await tx.repository.update({
          where: { id: repoId },
          data: { stars: count },
        });
        return { isLiked: liked, likesCount: count };
      }
    );

    return { isLiked, likesCount };
  }

  /**
   * 切换仓库收藏状态
   */
  async toggleRepositoryCollection(
    repoId: string,
    userId: string
  ): Promise<RepositoryCollectionResponseDto> {
    // 检查仓库是否存在且可访问
    const repository = await this.prisma.repository.findFirst({
      where: {
        id: repoId,
        isActive: true,
        OR: [{ visibility: 'PUBLIC' }, { visibility: 'INTERNAL' }],
      },
    });

    if (!repository) {
      throw new NotFoundException('仓库不存在或不可访问');
    }

    const { isCollected, collectionsCount } = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const existingCollection = await tx.repositoryCollection.findUnique({
          where: { repoId_userId: { repoId, userId } },
        });

        let collected = false;
        if (existingCollection) {
          await tx.repositoryCollection.delete({
            where: { id: existingCollection.id },
          });
          collected = false;
        } else {
          await tx.repositoryCollection.create({ data: { repoId, userId } });
          collected = true;
        }

        const count = await tx.repositoryCollection.count({
          where: { repoId },
        });
        return { isCollected: collected, collectionsCount: count };
      }
    );

    return { isCollected, collectionsCount };
  }
}
