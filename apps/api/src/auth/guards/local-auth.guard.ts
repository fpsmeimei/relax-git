import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 本地认证守卫
 * 用于用户名密码登录验证
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
