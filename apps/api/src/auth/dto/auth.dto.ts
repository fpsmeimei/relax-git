import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * 用户注册 DTO
 */
export class RegisterDto {
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
    example: 'password123',
    minLength: 6,
  })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码至少需要6个字符' })
  @MaxLength(100, { message: '密码不能超过100个字符' })
  password: string;
}

/**
 * 用户登录 DTO
 */
export class LoginDto {
  @ApiProperty({
    description: '用户名',
    example: 'johndoe',
  })
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(1, { message: '用户名不能为空' })
  @MaxLength(50, { message: '用户名不能超过50个字符' })
  username: string;

  @ApiProperty({
    description: '密码',
    example: 'Password123',
  })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(1, { message: '密码不能为空' })
  @MaxLength(100, { message: '密码不能超过100个字符' })
  password: string;
}


/**
 * 认证响应 DTO（仅返回用户信息）
 */
export class AuthResponseDto {
  @ApiProperty({
    description: '用户信息',
  })
  user: {
    id: string;
    username: string;
    uid: string;
    role: string;
    avatar?: string;
    isActive: boolean;
    createdAt: Date;
  };
}
