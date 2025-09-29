import { ExecutionContext, createParamDecorator } from '@nestjs/common';

/**
 * 当前用户装饰器
 * 从请求中提取当前认证用户信息
 */
// interface RequestWithUser {
//   user: Record<string, unknown>;
// }

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  }
);
