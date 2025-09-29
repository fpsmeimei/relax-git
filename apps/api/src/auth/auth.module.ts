import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { AuditLogService } from '../common/services/audit-log.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SecurityAdminController } from './controllers/security-admin.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AccountSecurityService } from './services/account-security.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

/**
 * 认证模块
 * 提供 JWT 认证、权限管理、用户登录注册功能
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ??
          'your-super-secret-jwt-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') ?? '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, SecurityAdminController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    LocalAuthGuard,
    RolesGuard,
    TokenBlacklistService,
    AccountSecurityService,
    AuditLogService,
    RateLimitGuard,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    LocalAuthGuard,
    RolesGuard,
    TokenBlacklistService,
    AccountSecurityService,
    AuditLogService,
    RateLimitGuard,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}
