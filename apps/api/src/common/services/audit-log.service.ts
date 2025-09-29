import { Injectable } from '@nestjs/common';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import { PrismaService } from '../../database/prisma.service';

export enum AuditAction {
  // 认证相关
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_REVOKE = 'TOKEN_REVOKE',

  // 用户管理
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_ACTIVATE = 'USER_ACTIVATE',
  USER_DEACTIVATE = 'USER_DEACTIVATE',

  // 权限相关
  ROLE_CHANGE = 'ROLE_CHANGE',
  PERMISSION_GRANT = 'PERMISSION_GRANT',
  PERMISSION_REVOKE = 'PERMISSION_REVOKE',

  // 安全相关
  FAILED_LOGIN = 'FAILED_LOGIN',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',

  // 系统相关
  SYSTEM_CONFIG_CHANGE = 'SYSTEM_CONFIG_CHANGE',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_IMPORT = 'DATA_IMPORT',
}

export enum AuditResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PARTIAL = 'PARTIAL',
}

export interface AuditLogEntry {
  action: AuditAction;
  result: AuditResult;
  userId?: string;
  targetUserId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp?: Date;
}

/**
 * 审计日志服务
 * 记录系统中的重要操作和安全事件
 */
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 记录审计日志
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      // 这里使用简单的日志记录，实际项目中可能需要专门的审计表
      const logData = {
        timestamp: entry.timestamp ?? new Date(),
        action: entry.action,
        result: entry.result,
        userId: entry.userId,
        targetUserId: entry.targetUserId,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        details: entry.details ? JSON.stringify(entry.details) : null,
      };

      // 记录到控制台（生产环境应该使用专业的日志系统）
      console.log('[AUDIT]', JSON.stringify(logData));

      // 可以扩展为写入数据库、发送到日志聚合系统等
      // await this.prisma.auditLog.create({ data: logData });
    } catch (error) {
      // 审计日志记录失败不应该影响主要业务流程
      console.error('Failed to write audit log:', error);
    }
  }

  /**
   * 记录认证成功
   */
  async logLoginSuccess(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.LOGIN,
      result: AuditResult.SUCCESS,
      userId,
      ipAddress: ipAddress ?? 'unknown',
      userAgent: userAgent ?? 'unknown',
      details: {
        loginTime: new Date().toISOString(),
      },
    });
  }

  /**
   * 记录认证失败
   */
  async logLoginFailure(
    email: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.FAILED_LOGIN,
      result: AuditResult.FAILURE,
      ipAddress: ipAddress ?? 'unknown',
      userAgent: userAgent ?? 'unknown',
      details: {
        email,
        reason,
        attemptTime: new Date().toISOString(),
      },
    });
  }

  /**
   * 记录用户注册
   */
  async logUserRegistration(
    userId: string,
    email: string,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.REGISTER,
      result: AuditResult.SUCCESS,
      userId,
      ipAddress: ipAddress ?? 'unknown',
      details: {
        email,
        registrationTime: new Date().toISOString(),
      },
    });
  }

  /**
   * 记录用户登出
   */
  async logLogout(userId: string, ipAddress?: string): Promise<void> {
    await this.log({
      action: AuditAction.LOGOUT,
      result: AuditResult.SUCCESS,
      userId,
      ipAddress: ipAddress ?? 'unknown',
      details: {
        logoutTime: new Date().toISOString(),
      },
    });
  }

  /**
   * 记录令牌撤销
   */
  async logTokenRevocation(
    userId: string,
    reason: string,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.TOKEN_REVOKE,
      result: AuditResult.SUCCESS,
      userId,
      ipAddress: ipAddress ?? 'unknown',
      details: {
        reason,
        revokeTime: new Date().toISOString(),
      },
    });
  }

  /**
   * 记录角色变更
   */
  async logRoleChange(
    adminUserId: string,
    targetUserId: string,
    oldRole: UserRole,
    newRole: UserRole,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.ROLE_CHANGE,
      result: AuditResult.SUCCESS,
      userId: adminUserId,
      targetUserId,
      ipAddress: ipAddress ?? 'unknown',
      details: {
        oldRole,
        newRole,
        changeTime: new Date().toISOString(),
      },
    });
  }

  /**
   * 记录账户锁定
   */
  async logAccountLocked(
    userId: string,
    reason: string,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.ACCOUNT_LOCKED,
      result: AuditResult.SUCCESS,
      userId,
      ipAddress: ipAddress ?? 'unknown',
      details: {
        reason,
        lockTime: new Date().toISOString(),
      },
    });
  }

  /**
   * 记录可疑活动
   */
  async logSuspiciousActivity(
    description: string,
    userId?: string,
    ipAddress?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: AuditAction.SUSPICIOUS_ACTIVITY,
      result: AuditResult.FAILURE,
      userId: userId ?? 'unknown',
      ipAddress: ipAddress ?? 'unknown',
      details: {
        description,
        detectedTime: new Date().toISOString(),
        ...details,
      },
    });
  }
}
