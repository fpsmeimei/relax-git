import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/**
 * 安全头中间件
 * 设置各种安全相关的HTTP头
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 仅保留 API 相关安全头
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 生产开启 HSTS
    if (process.env['NODE_ENV'] === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    // 隐藏服务器信息
    res.removeHeader('X-Powered-By');
    res.setHeader('Server', 'Relax-Git API');

    next();
  }
}
