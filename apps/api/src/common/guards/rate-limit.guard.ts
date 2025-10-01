import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../redis/redis.service';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';

export interface RateLimitOptions {
  windowMs: number; // 时间窗口（毫秒）
  max: number; // 最大请求次数
  message?: string; // 自定义错误消息
  skipSuccessfulRequests?: boolean; // 是否跳过成功请求
  skipFailedRequests?: boolean; // 是否跳过失败请求
}

/**
 * 速率限制守卫
 * 基于 Redis 实现分布式速率限制
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly redis: RedisService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 获取速率限制配置
    const rateLimitOptions = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()]
    );

    // 如果没有配置速率限制，允许通过
    if (!rateLimitOptions) {
      return true;
    }

    // 生成限制键（基于IP和路由）
    const clientIp = this.getClientIp(request);
    const route = request.route?.path || request.url;
    const key = `rate_limit:${clientIp}:${route}`;

    // 使用原子 INCR 计数，避免 GET+INCR 带来的竞态
    const newCount = await this.redis.getClient().incr(key);
    // 首次请求设置过期时间（ms）
    if (newCount === 1) {
      await this.redis.getClient().pexpire(key, rateLimitOptions.windowMs);
    }

    // 超过阈值则拒绝（注意：newCount > max）
    if (newCount > rateLimitOptions.max) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: rateLimitOptions.message ?? '请求过于频繁，请稍后再试',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    return true;
  }

  /**
   * 获取客户端IP地址
   */
  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }
}
