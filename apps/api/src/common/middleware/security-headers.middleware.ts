import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/**
 * 安全头中间件
 * 设置各种安全相关的HTTP头
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 防止点击劫持攻击
    res.setHeader('X-Frame-Options', 'DENY');

    // 防止MIME类型嗅探
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // XSS保护
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // 强制HTTPS（生产环境）
    if (process.env['NODE_ENV'] === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    // 内容安全策略
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
    );

    // 权限策略
    res.setHeader(
      'Permissions-Policy',
      [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
        'magnetometer=()',
        'accelerometer=()',
        'gyroscope=()',
      ].join(', ')
    );

    // 引用策略
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 隐藏服务器信息
    res.removeHeader('X-Powered-By');
    res.setHeader('Server', 'Relax-Git API');

    next();
  }
}
