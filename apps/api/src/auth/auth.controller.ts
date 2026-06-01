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
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  RateLimit,
  RateLimitPresets,
} from '../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthResponseDto, LoginDto, RegisterDto } from './dto/auth.dto';
import { TokenService } from './services/token.service';
import type { FastifyReply } from 'fastify';
import type { FastifyRequest } from 'fastify';
import { PrismaService } from '../database/prisma.service';

// 定义请求类型接口（预留用于类型标注）
interface _AuthenticatedRequest extends Request {
  user: {
    id: string;
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
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly prisma: PrismaService
  ) {}

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
    description: '用户名已存在',
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
    description: '用户名或密码错误',
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
    @Headers('user-agent') _userAgent: string | undefined,
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    const { user } = await this.authService.login(loginDto, ipAddress);

    // 签发并下发 Cookie（HttpOnly）
    const access = await this.tokenService.signAccessToken(user as any);
    const { token: refresh, jti } = await this.tokenService.signRefreshToken(
      user.id
    );
    this.tokenService.setAuthCookies(reply, access, refresh);

    return {
      user,
      jti,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登出' })
  @ApiResponse({
    status: 200,
    description: '登出成功',
  })
  async logout(
    @Request() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    // 尝试撤销刷新令牌（如存在）
    const rt = this.tokenService.extractRefreshToken(req);
    if (rt) {
      const parsed = await this.tokenService.verifyRefreshToken(rt);
      if (parsed?.jti) {
        await this.tokenService
          .revokeRefreshToken(parsed.jti)
          .catch(() => void 0);
      }
    }
    this.tokenService.clearAuthCookies(reply);
    return { message: '登出成功' };
  }

  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({
    status: 200,
    description: '用户信息获取成功',
  })
  @ApiResponse({
    status: 401,
    description: '未授权访问',
  })
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Get('verify')
  @ApiOperation({ summary: '验证 UID 有效性' })
  @ApiResponse({
    status: 200,
    description: 'UID 有效',
  })
  @ApiResponse({
    status: 401,
    description: 'UID 无效或用户不可用',
  })
  verifyToken(@Request() req: any) {
    return {
      valid: true,
      user: req.user,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 设置认证 Cookie（使用 Bearer Token）
   * 用于 NextAuth 登录后设置浏览器 Cookie
   */
  @Post('set-cookie')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '设置认证 Cookie' })
  @ApiResponse({ status: 200, description: 'Cookie 设置成功' })
  async setCookie(
    @Request() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    // 从 Authorization Bearer 头提取 token
    const auth = (req.headers['authorization'] || '').toString();
    const match = /^Bearer\s+(.+)$/i.exec(auth);
    if (!match) {
      throw new UnauthorizedException('缺少 Bearer Token');
    }

    const accessToken = match[1];

    // 验证 access token
    try {
      const decoded = await this.tokenService.verifyAccessToken(accessToken);
      if (!decoded || decoded?.type !== 'access' || !decoded?.sub) {
        throw new UnauthorizedException('无效的 Token 类型');
      }

      // 回源确认用户
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true, isActive: true },
      });

      if (!user?.isActive) {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      // 从 NextAuth session 中应该也包含了 refreshToken
      // 这里我们需要重新生成 refreshToken 或者接收前端传递的
      const { token: refreshToken } = await this.tokenService.signRefreshToken(
        user.id
      );

      // 设置 Cookie
      this.tokenService.setAuthCookies(reply, accessToken, refreshToken);

      return {
        success: true,
        message: 'Cookie 设置成功',
      };
    } catch (error) {
      throw new UnauthorizedException('Token 验证失败');
    }
  }

  /** 刷新 accessToken 并轮换 refreshToken */
  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新会话令牌' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  async refresh(
    @Request() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    const rt = this.tokenService.extractRefreshToken(req);
    if (!rt) throw new UnauthorizedException('缺少刷新令牌');

    const parsed = await this.tokenService.verifyRefreshToken(rt);
    if (!parsed) throw new UnauthorizedException('刷新令牌无效或已过期');

    // 轮换刷新令牌
    const rotated = await this.tokenService.rotateRefreshToken(
      parsed.jti,
      parsed.sub
    );

    // 回源获取用户，签发新的 accessToken
    const user = await this.prisma.user.findUnique({
      where: { id: parsed.sub },
      select: {
        id: true,
        username: true,
        uid: true,
        role: true,
        isActive: true,
        avatar: true,
      },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('用户不存在或不可用');
    }
    const access = await this.tokenService.signAccessToken(user as any);
    this.tokenService.setAuthCookies(reply, access, rotated.token);

    return { user };
  }
}
