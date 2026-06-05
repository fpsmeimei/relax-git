import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'crypto';
import { RedisService } from '../../redis/redis.service';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
// 引入 fastify-cookie 类型增强（为 reply.setCookie/clearCookie 与 request.cookies 提供声明）
import '@fastify/cookie';

export interface JwtUserLike {
  id: string;
  uid: string;
  username: string;
  role: UserRole;
  isActive: boolean;
}

interface AccessPayload {
  sub: string; // userId
  uid: string;
  role: UserRole;
  type: 'access';
}

interface RefreshPayload {
  sub: string; // userId
  jti: string; // refresh token id
  type: 'refresh';
}

@Injectable()
export class TokenService {
  private readonly isProduction = process.env['NODE_ENV'] === 'production';
  private readonly accessTtlMinutes = parseInt(
    process.env['JWT_ACCESS_TTL_MINUTES'] ?? '15',
    10
  );
  private readonly refreshTtlDays = parseInt(
    process.env['JWT_REFRESH_TTL_DAYS'] ?? '7',
    10
  );

  constructor(
    private readonly jwt: JwtService,
    private readonly redis: RedisService
  ) {}

  async signAccessToken(user: JwtUserLike): Promise<string> {
    const payload: AccessPayload = {
      sub: user.id,
      uid: user.uid,
      role: user.role,
      type: 'access',
    };
    const expiresIn = this.accessTtlMinutes * 60;
    return await this.jwt.signAsync(payload, { expiresIn });
  }

  async signRefreshToken(
    userId: string
  ): Promise<{ token: string; jti: string }> {
    const jti = randomUUID();
    const payload: RefreshPayload = {
      sub: userId,
      jti,
      type: 'refresh',
    };
    const expiresIn = this.refreshTtlDays * 24 * 3600;
    const token = await this.jwt.signAsync(payload, { expiresIn });

    // 存入 Redis 作为有效刷新凭据（旋转时替换）
    const key = this.rtKey(jti);
    const ttlSeconds = this.refreshTtlDays * 24 * 3600;
    await this.redis.setex(key, ttlSeconds, userId);

    return { token, jti };
  }

  async rotateRefreshToken(
    oldJti: string | null,
    userId: string
  ): Promise<{ token: string; jti: string }> {
    if (oldJti) await this.revokeRefreshToken(oldJti).catch(() => void 0);
    return await this.signRefreshToken(userId);
  }

  async revokeRefreshToken(jti: string): Promise<void> {
    await this.redis.del(this.rtKey(jti));
  }

  async isRefreshValid(jti: string): Promise<boolean> {
    return await this.redis.exists(this.rtKey(jti));
  }

  // ===== Cookie helpers =====

  setAuthCookies(
    reply: FastifyReply,
    accessToken: string,
    refreshToken: string
  ) {
    const accessMaxAge = this.accessTtlMinutes * 60; // seconds
    const refreshMaxAge = this.refreshTtlDays * 24 * 3600; // seconds

    // Access Token
    reply.setCookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.isProduction,
      path: '/',
      maxAge: accessMaxAge,
    });

    // Refresh Token
    reply.setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.isProduction,
      path: '/',
      maxAge: refreshMaxAge,
    });
  }

  clearAuthCookies(reply: FastifyReply) {
    reply.clearCookie('access_token', { path: '/' });
    reply.clearCookie('refresh_token', { path: '/' });
  }

  // 解析请求中的刷新令牌（优先 Cookie，其次 Bearer）
  extractRefreshToken(req: FastifyRequest): string | null {
    const fromCookie = (req.cookies as any)?.['refresh_token'];
    if (typeof fromCookie === 'string' && fromCookie) return fromCookie;

    const auth = (req.headers['authorization'] || '').toString();
    const m = /^Bearer\s+(.+)$/i.exec(auth);
    return m ? m[1] : null;
  }

  async verifyRefreshToken(
    token: string
  ): Promise<{ sub: string; jti: string } | null> {
    try {
      const decoded = (await this.jwt.verifyAsync(token)) as any;
      if (decoded?.type !== 'refresh' || !decoded?.sub || !decoded?.jti) {
        return null;
      }
      const ok = await this.isRefreshValid(decoded.jti);
      if (!ok) return null;
      return { sub: decoded.sub as string, jti: decoded.jti as string };
    } catch {
      return null;
    }
  }

  /**
   * 验证 access token（公开方法，供 AuthController 使用）
   */
  async verifyAccessToken(token: string): Promise<any> {
    try {
      const decoded = await this.jwt.verifyAsync(token);
      return decoded;
    } catch (error) {
      return null;
    }
  }

  private rtKey(jti: string) {
    return `auth:refresh:${jti}`;
  }
}
