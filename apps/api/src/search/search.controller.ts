import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RepoAccess } from '../auth/decorators/repo-access.decorator';
import { RepoAccessGuard } from '../auth/guards/repo-access.guard';
import {
  CreateSearchDto,
  QuerySearchHistoryDto,
  SearchHistoryResponseDto,
  SearchResponseDto,
  SearchResultDto,
} from './dto';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  @ApiOperation({
    summary: '创建搜索任务',
    description: '在指定仓库或快照中搜索代码内容',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '搜索任务创建成功',
    type: SearchResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '请求参数错误',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '无权访问指定仓库',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '仓库或快照不存在',
  })
  @UseGuards(RepoAccessGuard)
  @RepoAccess('read')
  async createSearch(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body() createSearchDto: CreateSearchDto
  ): Promise<SearchResponseDto> {
    return this.searchService.createSearch(userId, createSearchDto, userRole);
  }

  @Get(':id')
  @ApiOperation({
    summary: '获取搜索结果',
    description: '根据搜索任务ID获取搜索结果',
  })
  @ApiParam({
    name: 'id',
    description: '搜索任务ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '搜索结果获取成功',
    type: SearchResultDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '搜索任务不存在',
  })
  async getSearchResult(
    @CurrentUser('id') userId: string,
    @Param('id') searchId: string
  ): Promise<SearchResultDto> {
    return this.searchService.getSearchResult(searchId, userId);
  }

  @Get()
  @ApiOperation({
    summary: '获取搜索历史',
    description: '获取当前用户的搜索历史记录',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '搜索历史获取成功',
    type: SearchHistoryResponseDto,
  })
  async getSearchHistory(
    @CurrentUser('id') userId: string,
    @Query() queryDto: QuerySearchHistoryDto
  ): Promise<SearchHistoryResponseDto> {
    return this.searchService.getSearchHistory(userId, queryDto);
  }

  @Delete('history/:id')
  @ApiOperation({
    summary: '删除搜索历史',
    description: '删除指定的搜索历史记录',
  })
  @ApiParam({
    name: 'id',
    description: '搜索历史ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: '搜索历史删除成功',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '搜索历史不存在',
  })
  async deleteSearchHistory(
    @CurrentUser('id') userId: string,
    @Param('id') historyId: string
  ): Promise<void> {
    return this.searchService.deleteSearchHistory(userId, historyId);
  }
}
