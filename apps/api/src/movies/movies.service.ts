import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateMovieFavoriteDto } from './dto/movie-favorite.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly db: PrismaService) {}

  // 添加收藏
  async addFavorite(userId: string, dto: CreateMovieFavoriteDto) {
    return this.db.movieFavorite.create({
      data: {
        userId,
        title: dto.title,
        englishName: dto.englishName,
        year: dto.year,
        rating: dto.rating,
        director: dto.director,
        posterUrl: dto.posterUrl,
      },
    });
  }

  // 获取用户收藏列表（支持分页）
  async getFavorites(userId: string, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;

    const [favorites, total] = await Promise.all([
      this.db.movieFavorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.db.movieFavorite.count({ where: { userId } }),
    ]);

    return {
      favorites,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // 删除收藏
  async removeFavorite(userId: string, favoriteId: string) {
    // 确保只能删除自己的收藏
    return this.db.movieFavorite.deleteMany({
      where: {
        id: favoriteId,
        userId,
      },
    });
  }

  // 检查是否已收藏
  async isFavorited(userId: string, title: string) {
    const favorite = await this.db.movieFavorite.findFirst({
      where: {
        userId,
        title,
      },
    });
    return !!favorite;
  }
}
