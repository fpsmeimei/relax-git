import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../redis/redis.service';

/**
 * 令牌黑名单服务
 * 管理被撤销的JWT令牌
 */
@Injectable()
export class TokenBlacklistService {
  private readonly blacklistPrefix = 'token:blacklist:';
  private readonly userTokensPrefix = 'user:tokens:';

  constructor(
    private readonly redis: RedisService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  /**
   * 将令牌加入黑名单
   */
  async blacklistToken(token: string, reason?: string): Promise<void> {
    try {
      // 解析令牌获取信息
      const payload = this.jwtService.decode(token);
      if (!payload?.jti || !payload.exp) {
        return; // 无效令牌，忽略
      }

      const tokenId = payload.jti;
      const expiresAt = payload.exp * 1000; // 转换为毫秒
      const now = Date.now();

      // 如果令牌已过期，无需加入黑名单
      if (expiresAt <= now) {
        return;
      }

      // 计算TTL（到令牌过期的时间）
      const ttl = Math.ceil((expiresAt - now) / 1000);

      // 加入黑名单
      const blacklistKey = `${this.blacklistPrefix}${tokenId}`;
      await this.redis.setex(
        blacklistKey,
        ttl,
        JSON.stringify({
          tokenId,
          userId: payload.sub,
          blacklistedAt: now,
          reason: reason ?? 'Token revoked',
          expiresAt,
        })
      );
    } catch (error) {
      // 令牌解析失败，可能是无效令牌
      console.error('Failed to blacklist token:', error);
    }
  }

  /**
   * 检查令牌是否在黑名单中
   */
  async isTokenBlacklisted(tokenOrJti: string): Promise<boolean> {
    try {
      let jti: string;

      // 如果传入的是JTI格式（jti:xxx），直接使用
      if (tokenOrJti.startsWith('jti:')) {
        jti = tokenOrJti.substring(4);
      } else {
        // 否则尝试解析为JWT令牌
        const payload = this.jwtService.decode(tokenOrJti);
        if (!payload?.jti) {
          return false;
        }
        jti = payload.jti;
      }

      const blacklistKey = `${this.blacklistPrefix}${jti}`;
      const exists = await this.redis.exists(blacklistKey);
      return Boolean(exists);
    } catch (error) {
      // 令牌解析失败，认为是无效令牌
      return true;
    }
  }

  /**
   * 撤销用户的所有令牌
   */
  async revokeAllUserTokens(userId: string, reason?: string): Promise<void> {
    // 获取用户的所有活跃令牌
    const userTokensKey = `${this.userTokensPrefix}${userId}`;
    const tokens = await this.redis.smembers(userTokensKey);

    // 将所有令牌加入黑名单
    const promises = tokens.map(token =>
      this.blacklistToken(token, reason ?? 'All user tokens revoked')
    );

    await Promise.all(promises);

    // 清空用户令牌集合
    await this.redis.del(userTokensKey);
  }

  /**
   * 记录用户令牌（用于批量撤销）
   */
  async trackUserToken(userId: string, token: string): Promise<void> {
    try {
      const payload = this.jwtService.decode(token);
      if (!payload?.exp) {
        return;
      }

      const userTokensKey = `${this.userTokensPrefix}${userId}`;
      const expiresAt = payload.exp * 1000;
      const ttl = Math.ceil((expiresAt - Date.now()) / 1000);

      if (ttl > 0) {
        // 添加到用户令牌集合
        await this.redis.sadd(userTokensKey, token);
        // 设置集合过期时间
        await this.redis.expire(userTokensKey, ttl);
      }
    } catch (error) {
      console.error('Failed to track user token:', error);
    }
  }

  /**
   * 清理过期的黑名单条目（定时任务调用）
   */
  async cleanupExpiredTokens(): Promise<number> {
    const pattern = `${this.blacklistPrefix}*`;
    const keys = await this.redis.keys(pattern);

    let cleanedCount = 0;
    const now = Date.now();

    for (const key of keys) {
      try {
        const data = await this.redis.get(key);
        if (data) {
          const tokenInfo = JSON.parse(data);
          if (tokenInfo.expiresAt <= now) {
            await this.redis.del(key);
            cleanedCount++;
          }
        }
      } catch (error) {
        // 数据格式错误，删除该条目
        await this.redis.del(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * 获取黑名单统计信息
   */
  async getBlacklistStats(): Promise<{
    totalBlacklisted: number;
    activeBlacklisted: number;
  }> {
    const pattern = `${this.blacklistPrefix}*`;
    const keys = await this.redis.keys(pattern);
    const now = Date.now();

    let activeCount = 0;

    for (const key of keys) {
      try {
        const data = await this.redis.get(key);
        if (data) {
          const tokenInfo = JSON.parse(data);
          if (tokenInfo.expiresAt > now) {
            activeCount++;
          }
        }
      } catch (error) {
        // 忽略解析错误
      }
    }

    return {
      totalBlacklisted: keys.length,
      activeBlacklisted: activeCount,
    };
  }
}
