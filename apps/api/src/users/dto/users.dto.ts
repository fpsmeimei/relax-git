import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserRole } from '@relax-git/shared/generated/prisma-client';

/**
 * 创建用户 DTO
 */
export class CreateUserDto {
  @ApiProperty({
    description: '用户名',
    example: 'johndoe',
    minLength: 3,
    maxLength: 20,
  })
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名至少需要3个字符' })
  @MaxLength(20, { message: '用户名不能超过20个字符' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: '用户名只能包含字母、数字、下划线和连字符',
  })
  username: string;

  @ApiProperty({
    description: '密码',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(8, { message: '密码至少需要8个字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      '密码必须包含至少一个大写字母、一个小写字母、一个数字和一个特殊字符',
  })
  password: string;

  @ApiProperty({
    description: '用户角色',
    enum: UserRole,
    example: UserRole.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: '用户角色必须是有效的枚举值' })
  role?: UserRole;

  @ApiProperty({
    description: '头像 URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '头像 URL 必须是字符串' })
  avatar?: string;
}

/**
 * 更新用户 DTO
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: '用户是否活跃',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '用户状态必须是布尔值' })
  isActive?: boolean;
}

/**
 * 查询用户 DTO
 */
export class QueryUsersDto {
  @ApiProperty({
    description: '页码',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于0' })
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于0' })
  @Max(100, { message: '每页数量不能超过100' })
  limit?: number = 10;

  @ApiProperty({
    description: '搜索关键词（用户名）',
    example: 'john',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiProperty({
    description: '用户角色筛选',
    enum: UserRole,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: '用户角色必须是有效的枚举值' })
  role?: UserRole;

  @ApiProperty({
    description: '用户状态筛选',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: '用户状态必须是布尔值' })
  isActive?: boolean;
}

/**
 * 用户响应 DTO
 */
export class UserResponseDto {
  @ApiProperty({ description: '用户 ID' })
  id: string;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '用户角色', enum: UserRole })
  role: UserRole;

  @ApiProperty({ description: '头像 URL', required: false })
  avatar?: string;

  @ApiProperty({ description: '用户是否活跃' })
  isActive: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

/**
 * 用户列表响应 DTO
 */
export class UsersListResponseDto {
  @ApiProperty({ description: '用户列表', type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty({
    description: '分页信息',
    properties: {
      page: { type: 'number', description: '当前页码' },
      limit: { type: 'number', description: '每页数量' },
      total: { type: 'number', description: '总数量' },
      pages: { type: 'number', description: '总页数' },
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
