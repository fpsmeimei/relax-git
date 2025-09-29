import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  RateLimit,
  RateLimitPresets,
} from '../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import {
  AuthResponseDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// 定义请求类型接口
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

/**
 * 认证控制器
 * 处理用户认证相关的 HTTP 请求
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({
    status: 201,
    description: '注册成功',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: '用户邮箱或用户名已存在',
  })
  @ApiResponse({
    status: 400,
    description: '请求参数验证失败',
  })
  @ApiResponse({
    status: 429,
    description: '注册请求过于频繁',
  })
  async register(@Body() registerDto: RegisterDto, @Ip() ipAddress: string) {
    return await this.authService.register(registerDto, ipAddress);
  }

  @Post('login')
  @Public()
  @UseGuards(RateLimitGuard)
  @RateLimit(RateLimitPresets.AUTH)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '邮箱或密码错误',
  })
  @ApiResponse({
    status: 403,
    description: '账户已被锁定',
  })
  @ApiResponse({
    status: 400,
    description: '请求参数验证失败',
  })
  @ApiResponse({
    status: 429,
    description: '登录尝试过于频繁',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') _userAgent: string | undefined
  ) {
    return await this.authService.login(loginDto, ipAddress);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({
    status: 200,
    description: '令牌刷新成功',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '刷新令牌无效或已过期',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户登出' })
  @ApiResponse({
    status: 200,
    description: '登出成功',
  })
  @ApiResponse({
    status: 401,
    description: '未授权访问',
  })
  async logout(@Request() req: AuthenticatedRequest, @Ip() ipAddress: string) {
    return await this.authService.logout(req.user.id, ipAddress);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({
    status: 200,
    description: '用户信息获取成功',
  })
  @ApiResponse({
    status: 401,
    description: '未授权访问',
  })
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user;
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '验证令牌有效性' })
  @ApiResponse({
    status: 200,
    description: '令牌有效',
  })
  @ApiResponse({
    status: 401,
    description: '令牌无效或已过期',
  })
  verifyToken(@Request() req: AuthenticatedRequest) {
    return {
      valid: true,
      user: req.user,
      timestamp: new Date().toISOString(),
    };
  }
}
