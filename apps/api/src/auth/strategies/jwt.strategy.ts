import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../database/prisma.service';

// 自 Cookie 或 Authorization Bearer 提取 JWT
const cookieExtractor = (req: any): string | null => {
  try {
    const token = req?.cookies?.['access_token'];
    return typeof token === 'string' && token.length > 0 ? token : null;
  } catch {
    return null;
  }
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev_jwt_secret_change_me',
    });
  }

  // payload 形如 { sub, uid, role }
  async validate(payload: any) {
    // 允许无 DB 回查的轻量模式，但为安全起见，仍回源确认用户状态
    const userId = payload?.sub as string | undefined;
    if (!userId) return null;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        uid: true,
        role: true,
        avatar: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) return null;

    // 注入 request.user（与 UidAuthGuard 对齐字段）
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      uid: user.uid,
    };
  }
}
