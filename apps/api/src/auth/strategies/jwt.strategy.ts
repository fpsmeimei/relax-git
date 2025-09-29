import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { TokenBlacklistService } from '../services/token-blacklist.service';

/**
 * JWT 认证策略
 * 用于验证和解析 JWT 令牌
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly tokenBlacklist: TokenBlacklistService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ?? 'your-super-secret-jwt-key',
    });
  }

  /**
   * 验证 JWT 载荷
   * 当令牌验证成功后，会调用此方法来获取用户信息
   */
  async validate(payload: any) {
    // 检查令牌是否在黑名单中（使用JTI）
    if (
      payload.jti &&
      (await this.tokenBlacklist.isTokenBlacklisted(`jti:${payload.jti}`))
    ) {
      throw new UnauthorizedException('令牌已被撤销');
    }

    const user = await this.authService.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('用户账户已被禁用');
    }

    // 返回的用户信息会被添加到 request.user 中
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
    };
  }
}
