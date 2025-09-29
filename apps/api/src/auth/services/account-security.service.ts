import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';

export interface AccountLockInfo {
  isLocked: boolean;
  lockReason?: string;
  lockedAt?: Date;
  unlockAt?: Date;
  failedAttempts: number;
  lastFailedAt?: Date;
}

/**
 * 账户安全服务
 * 处理账户锁定、失败尝试跟踪等基本安全功能
 */
@Injectable()
export class AccountSecurityService {
  private readonly failedAttemptsPrefix = 'auth:failed:';
  private readonly accountLockPrefix = 'auth:locked:';

  // 配置参数
  private readonly maxFailedAttempts: number;
  private readonly lockDurationMinutes: number;
  private readonly attemptWindowMinutes: number;

  constructor(
    private readonly redis: RedisService,
    private readonly configService: ConfigService
  ) {
    // 从配置中读取安全参数
    this.maxFailedAttempts = this.configService.get<number>(
      'AUTH_MAX_FAILED_ATTEMPTS',
      5
    );
    this.lockDurationMinutes = this.configService.get<number>(
      'AUTH_LOCK_DURATION_MINUTES',
      30
    );
    this.attemptWindowMinutes = this.configService.get<number>(
      'AUTH_ATTEMPT_WINDOW_MINUTES',
      15
    );
  }

  /**
   * 记录登录失败
   */
  async recordFailedAttempt(
    identifier: string,
    ipAddress?: string
  ): Promise<AccountLockInfo> {
    const failedKey = `${this.failedAttemptsPrefix}${identifier}`;
    const lockKey = `${this.accountLockPrefix}${identifier}`;

    // 检查是否已被锁定
    const existingLock = await this.redis.get(lockKey);
    if (existingLock) {
      const lockInfo = JSON.parse(existingLock);
      return {
        isLocked: true,
        lockReason: lockInfo.reason,
        lockedAt: new Date(lockInfo.lockedAt),
        unlockAt: new Date(lockInfo.unlockAt),
        failedAttempts: lockInfo.failedAttempts,
        lastFailedAt: new Date(lockInfo.lastFailedAt),
      };
    }

    // 增加失败次数
    const pipeline = this.redis.pipeline();
    pipeline.incr(failedKey);
    pipeline.expire(failedKey, this.attemptWindowMinutes * 60);
    const results = await pipeline.exec();

    const failedAttempts = (results?.[0]?.[1] as number) || 0;
    const now = new Date();

    // 检查是否需要锁定账户
    if (failedAttempts >= this.maxFailedAttempts) {
      const unlockAt = new Date(
        now.getTime() + this.lockDurationMinutes * 60 * 1000
      );

      const lockInfo = {
        reason: `Too many failed login attempts (${failedAttempts})`,
        lockedAt: now.toISOString(),
        unlockAt: unlockAt.toISOString(),
        failedAttempts,
        lastFailedAt: now.toISOString(),
        ipAddress,
      };

      // 设置锁定
      await this.redis.setex(
        lockKey,
        this.lockDurationMinutes * 60,
        JSON.stringify(lockInfo)
      );

      // 清除失败计数
      await this.redis.del(failedKey);

      return {
        isLocked: true,
        lockReason: lockInfo.reason,
        lockedAt: now,
        unlockAt,
        failedAttempts,
        lastFailedAt: now,
      };
    }

    return {
      isLocked: false,
      failedAttempts,
      lastFailedAt: now,
    };
  }

  /**
   * 检查账户安全状态
   */
  async checkAccountSecurity(identifier: string): Promise<AccountLockInfo> {
    return this.checkAccountLock(identifier);
  }

  /**
   * 重置失败尝试次数
   */
  async resetFailedAttempts(identifier: string): Promise<void> {
    await this.clearFailedAttempts(identifier);
  }

  /**
   * 检查账户是否被锁定
   */
  async checkAccountLock(identifier: string): Promise<AccountLockInfo> {
    const lockKey = `${this.accountLockPrefix}${identifier}`;
    const failedKey = `${this.failedAttemptsPrefix}${identifier}`;

    const lockData = await this.redis.get(lockKey);

    if (lockData) {
      const lockInfo = JSON.parse(lockData);
      return {
        isLocked: true,
        lockReason: lockInfo.reason,
        lockedAt: new Date(lockInfo.lockedAt),
        unlockAt: new Date(lockInfo.unlockAt),
        failedAttempts: lockInfo.failedAttempts,
        lastFailedAt: new Date(lockInfo.lastFailedAt),
      };
    }

    // 获取当前失败次数
    const failedAttempts = await this.redis.get(failedKey);

    return {
      isLocked: false,
      failedAttempts: failedAttempts ? parseInt(failedAttempts, 10) : 0,
    };
  }

  /**
   * 清除失败尝试记录（登录成功时调用）
   */
  async clearFailedAttempts(identifier: string): Promise<void> {
    const failedKey = `${this.failedAttemptsPrefix}${identifier}`;
    await this.redis.del(failedKey);
  }

  /**
   * 手动解锁账户（管理员操作）
   */
  async unlockAccount(
    identifier: string,
    _adminUserId: string,
    _reason?: string
  ): Promise<void> {
    const lockKey = `${this.accountLockPrefix}${identifier}`;
    const failedKey = `${this.failedAttemptsPrefix}${identifier}`;

    // 删除锁定和失败记录
    await Promise.all([this.redis.del(lockKey), this.redis.del(failedKey)]);
  }

  /**
   * 获取安全统计信息
   */
  async getSecurityStats(): Promise<{
    lockedAccounts: number;
    accountsWithFailedAttempts: number;
    totalFailedAttempts: number;
  }> {
    const lockPattern = `${this.accountLockPrefix}*`;
    const failedPattern = `${this.failedAttemptsPrefix}*`;

    const [lockKeys, failedKeys] = await Promise.all([
      this.redis.keys(lockPattern),
      this.redis.keys(failedPattern),
    ]);

    let totalFailedAttempts = 0;

    if (failedKeys.length > 0) {
      const failedCounts = await this.redis.mget(...failedKeys);
      totalFailedAttempts = failedCounts
        .filter(count => count !== null)
        .reduce((sum, count) => sum + parseInt(count, 10), 0);
    }

    return {
      lockedAccounts: lockKeys.length,
      accountsWithFailedAttempts: failedKeys.length,
      totalFailedAttempts,
    };
  }
}
