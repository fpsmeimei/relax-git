import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
// UidAuthGuard 已废弃，统一采用全局 JwtAuthGuard
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  CreateUserDto,
  QueryUsersDto,
  UpdateUserDto,
  UserResponseDto,
  UsersListResponseDto,
} from './dto/users.dto';
import { UsersService } from './users.service';
import type { FastifyRequest } from 'fastify';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { extname, join } from 'path';
import { pipeline } from 'stream/promises';

/**
 * 用户管理控制器
 * 处理用户相关的 HTTP 请求
 */
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建用户（管理员）' })
  @ApiResponse({
    status: 201,
    description: '用户创建成功',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: '用户邮箱或用户名已存在',
  })
  @ApiResponse({
    status: 403,
    description: '权限不足',
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser('id') _currentUserId: string
  ) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({
    status: 200,
    description: '用户列表获取成功',
    type: UsersListResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: UserRole,
    description: '角色筛选',
  })
  @ApiQuery({ name: 'isActive', required: false, description: '状态筛选' })
  async findAll(@Query() queryDto: QueryUsersDto) {
    return await this.usersService.findAll(queryDto);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: '获取用户统计信息' })
  @ApiResponse({
    status: 200,
    description: '用户统计信息获取成功',
  })
  async getStats() {
    return await this.usersService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiParam({ name: 'id', description: '用户 ID' })
  @ApiResponse({
    status: 200,
    description: '用户详情获取成功',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '用户不存在',
  })
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiParam({ name: 'id', description: '用户 ID' })
  @ApiResponse({
    status: 200,
    description: '用户信息更新成功',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: '用户不存在',
  })
  @ApiResponse({
    status: 403,
    description: '权限不足',
  })
  @ApiResponse({
    status: 409,
    description: '邮箱或用户名冲突',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('role') currentUserRole: UserRole
  ) {
    return await this.usersService.update(
      id,
      updateUserDto,
      currentUserId,
      currentUserRole
    );
  }

  // ===== 个人设置：本人更新用户名 =====
  @Patch('me')
  @ApiOperation({ summary: '更新本人用户信息（用户名/头像）' })
  async updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id') currentUserId: string,
    @CurrentUser('role') currentUserRole: UserRole
  ) {
    // 防御：不允许更新 uid
    if ((updateUserDto as any).uid) delete (updateUserDto as any).uid;
    return await this.usersService.update(
      currentUserId,
      updateUserDto,
      currentUserId,
      currentUserRole
    );
  }

  // ===== 个人设置：上传头像 =====
  @Post('me/avatar')
  @ApiOperation({ summary: '上传头像（multipart/form-data）' })
  async uploadAvatar(
    @Req() req: FastifyRequest,
    @CurrentUser('id') currentUserId: string
  ) {
    try {
      const data = await req.file();
      if (!data) throw new BadRequestException('未接收到文件');

      const allowed = new Set(['image/png', 'image/jpeg', 'image/webp']);
      if (!allowed.has(data.mimetype)) {
        throw new BadRequestException('仅支持 PNG/JPEG/WEBP 图片');
      }

      // 获取 uid 以构建目录
      const me = await this.usersService.findOne(currentUserId);
      const uid = (me as any).uid || me.id;

      const dir = join(process.cwd(), 'uploads', 'avatars', uid);
      await mkdir(dir, { recursive: true });

      const ext = (extname(data.filename) || '.bin').toLowerCase();
      const name = `${Date.now()}${ext}`;
      const filepath = join(dir, name);

      await pipeline(data.file, createWriteStream(filepath));

      const publicUrl = `/uploads/avatars/${uid}/${name}`;
      const updated = await this.usersService.updateAvatar(
        currentUserId,
        publicUrl
      );
      return updated;
    } catch (error) {
      console.error('Avatar upload error:', error);
      const message = error instanceof Error ? error.message : '未知错误';
      throw new BadRequestException(`头像上传失败: ${message}`);
    }
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除用户（软删除）' })
  @ApiParam({ name: 'id', description: '用户 ID' })
  @ApiResponse({
    status: 200,
    description: '用户删除成功',
  })
  @ApiResponse({
    status: 404,
    description: '用户不存在',
  })
  @ApiResponse({
    status: 403,
    description: '权限不足',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser('role') currentUserRole: UserRole
  ) {
    return await this.usersService.remove(id, currentUserRole);
  }
}
