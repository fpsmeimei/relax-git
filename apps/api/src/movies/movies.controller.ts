import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieFavoriteDto } from './dto/movie-favorite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/movies')
@UseGuards(JwtAuthGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  // 添加收藏
  @Post('favorites')
  async addFavorite(@Request() req: any, @Body() dto: CreateMovieFavoriteDto) {
    return this.moviesService.addFavorite(req.user.id, dto);
  }

  // 获取收藏列表
  @Get('favorites')
  async getFavorites(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const size = pageSize ? parseInt(pageSize, 10) : 10;
    return this.moviesService.getFavorites(req.user.id, pageNum, size);
  }

  // 删除收藏
  @Delete('favorites/:id')
  async removeFavorite(@Request() req: any, @Param('id') id: string) {
    return this.moviesService.removeFavorite(req.user.id, id);
  }

  // 检查是否已收藏
  @Get('favorites/check/:title')
  async checkFavorite(@Request() req: any, @Param('title') title: string) {
    const isFavorited = await this.moviesService.isFavorited(
      req.user.id,
      title
    );
    return { isFavorited };
  }
}
