import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return (await super.canActivate(context)) as boolean;
  }

  // 允许在 GraphQL/WebSocket 等场景自定义请求提取逻辑时扩展
  getRequest(context: ExecutionContext) {
    // 默认从 HTTP 上下文读取
    const http = context.switchToHttp();
    const req = http.getRequest();
    return req;
  }
}
