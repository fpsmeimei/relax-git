import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * 角色权限守卫
 * 基于用户角色控制访问权限
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取路由所需的角色
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    // 如果没有设置角色要求，允许访问
    if (!requiredRoles) {
      return true;
    }

    // 获取用户信息
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('用户信息不存在');
    }

    // 检查用户角色是否满足要求
    const hasRole = requiredRoles.some(role => user.role === role.toString());

    if (!hasRole) {
      throw new ForbiddenException('权限不足，无法访问此资源');
    }

    return true;
  }
}
