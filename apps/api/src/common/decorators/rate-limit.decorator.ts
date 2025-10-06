import { SetMetadata } from '@nestjs/common';
import { RateLimitOptions } from '../guards/rate-limit.guard';

export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * 速率限制装饰器
 * 设置路由的速率限制规则
 */
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);

/**
 * 预定义的速率限制配置
 */
export const RateLimitPresets = {
  // 认证相关 - 临时宽松限制（用于测试）
  AUTH: {
    windowMs: 1 * 60 * 1000, // 1分钟（临时调整）
    max: 50, // 最多50次尝试（临时调整）
    message: '登录尝试过于频繁，请1分钟后再试',
  },

  // 注册 - 临时宽松限制（用于测试）
  REGISTER: {
    windowMs: 5 * 1000, // 5秒（临时调整）
    max: 10, // 每5秒最多10次注册（临时调整）
    message: '注册请求过于频繁，请5秒后再试',
  },

  // API调用 - 宽松限制
  API: {
    windowMs: 60 * 1000, // 1分钟
    max: 100, // 最多100次请求
    message: 'API调用过于频繁，请稍后再试',
  },

  // 敏感操作 - 严格限制
  SENSITIVE: {
    windowMs: 60 * 60 * 1000, // 1小时
    max: 10, // 最多10次操作
    message: '敏感操作过于频繁，请1小时后再试',
  },
} as const;
