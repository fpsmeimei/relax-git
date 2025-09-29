import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * 可选JWT认证守卫
 * 允许请求在没有JWT token的情况下通过，但如果有token则会验证
 * 用于支持匿名访问但同时为登录用户提供个性化功能的接口
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 调用父类的canActivate方法，但捕获异常，确保匿名访问不被阻断
    try {
      return super.canActivate(context) as any;
    } catch {
      // 出现任何认证错误时，依然放行请求
      return true;
    }
  }

  handleRequest(err: any, user: any, _info: any, _context: ExecutionContext) {
    // 忽略错误与无效token，匿名访问时返回 null 即可
    // 这样控制器中的 @CurrentUser 将得到 undefined，不影响公开接口
    return user || null;
  }
}
