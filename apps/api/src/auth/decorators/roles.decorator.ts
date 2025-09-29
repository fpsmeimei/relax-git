import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@relax-git/shared/generated/prisma-client';

/**
 * 角色权限装饰器
 * 设置访问路由所需的用户角色
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
