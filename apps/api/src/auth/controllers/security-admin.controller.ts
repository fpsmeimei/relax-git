import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { AccountSecurityService } from '../services/account-security.service';
import { TokenBlacklistService } from '../services/token-blacklist.service';

/**
 * 安全管理控制器
 * 提供管理员安全管理功能
 */
@ApiTags('security-admin')
@Controller('admin/security')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class SecurityAdminController {
  constructor(
    private readonly tokenBlacklist: TokenBlacklistService,
    private readonly accountSecurity: AccountSecurityService
  ) {}

  @Get('stats')
  @ApiOperation({ summary: '获取安全统计信息' })
  @ApiResponse({
    status: 200,
    description: '安全统计信息获取成功',
  })
  async getSecurityStats() {
    const [blacklistStats, securityStats] = await Promise.all([
      this.tokenBlacklist.getBlacklistStats(),
      this.accountSecurity.getSecurityStats(),
    ]);

    return {
      tokenBlacklist: blacklistStats,
      accountSecurity: securityStats,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('unlock-account/:identifier')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '解锁用户账户' })
  @ApiParam({ name: 'identifier', description: '用户邮箱或ID' })
  @ApiResponse({
    status: 200,
    description: '账户解锁成功',
  })
  @ApiResponse({
    status: 404,
    description: '用户不存在',
  })
  async unlockAccount(
    @Param('identifier') identifier: string,
    @CurrentUser('id') adminUserId: string,
    @Body('reason') reason?: string
  ) {
    await this.accountSecurity.unlockAccount(identifier, adminUserId, reason);

    return {
      message: '账户解锁成功',
      identifier,
      unlockedBy: adminUserId,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('revoke-user-tokens/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '撤销用户所有令牌' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiResponse({
    status: 200,
    description: '令牌撤销成功',
  })
  async revokeUserTokens(
    @Param('userId') userId: string,
    @CurrentUser('id') adminUserId: string,
    @Body('reason') reason?: string
  ) {
    await this.tokenBlacklist.revokeAllUserTokens(
      userId,
      reason ?? `Revoked by admin ${adminUserId}`
    );

    return {
      message: '用户令牌撤销成功',
      userId,
      revokedBy: adminUserId,
      reason,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('cleanup-expired-tokens')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '清理过期令牌' })
  @ApiResponse({
    status: 200,
    description: '清理完成',
  })
  async cleanupExpiredTokens(@CurrentUser('id') adminUserId: string) {
    const cleanedCount = await this.tokenBlacklist.cleanupExpiredTokens();

    return {
      message: '过期令牌清理完成',
      cleanedCount,
      cleanedBy: adminUserId,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('account-locks')
  @ApiOperation({ summary: '获取被锁定的账户列表' })
  @ApiResponse({
    status: 200,
    description: '锁定账户列表获取成功',
  })
  async getLockedAccounts() {
    const stats = await this.accountSecurity.getSecurityStats();

    return {
      lockedAccountsCount: stats.lockedAccounts,
      accountsWithFailedAttempts: stats.accountsWithFailedAttempts,
      totalFailedAttempts: stats.totalFailedAttempts,
      timestamp: new Date().toISOString(),
    };
  }
}
