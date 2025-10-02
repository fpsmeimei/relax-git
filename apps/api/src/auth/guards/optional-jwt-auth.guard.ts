import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * 可选 JWT 认证守卫
 * 允许匿名访问，但如果提供了有效 JWT 则注入用户信息
 * 用于需要"匿名可读、登录有状态"的接口
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否为公开路由
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    try {
      // 尝试进行 JWT 认证
      const result = await super.canActivate(context);
      return result as boolean;
    } catch (error) {
      // 认证失败时允许继续访问（匿名模式）
      // 但不会在 request.user 中注入用户信息
      return true;
    }
  }

  // 处理认证失败的情况
  handleRequest(err: any, user: any, _info: any, _context: ExecutionContext) {
    // 如果有错误或没有用户，返回 null（匿名访问）
    // 如果认证成功，返回用户信息
    return user || null;
  }

  getRequest(context: ExecutionContext) {
    const http = context.switchToHttp();
    return http.getRequest();
  }
}
