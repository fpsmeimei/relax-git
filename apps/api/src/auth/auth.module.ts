import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { AuditLogService } from '../common/services/audit-log.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SecurityAdminController } from './controllers/security-admin.controller';
import { getJwtConfig } from '../config/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AccountSecurityService } from './services/account-security.service';
import { TokenService } from './services/token.service';

/**
 * 认证模块
 * 提供基于 UID 的认证、权限管理、用户登录注册功能
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({ useFactory: getJwtConfig }),
  ],
  controllers: [AuthController, SecurityAdminController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    AccountSecurityService,
    AuditLogService,
    RateLimitGuard,
    TokenService,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    AccountSecurityService,
    AuditLogService,
    RateLimitGuard,
    TokenService,
  ],
})
export class AuthModule {}
