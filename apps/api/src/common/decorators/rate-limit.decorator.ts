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
  // 认证相关 - 严格限制
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 5, // 最多5次尝试
    message: '登录尝试过于频繁，请15分钟后再试',
  },

  // 注册 - 中等限制
  REGISTER: {
    windowMs: 10 * 1000, // 10秒
    max: 1, // 每10秒最多1次注册
    message: '注册请求过于频繁，请10秒后再试',
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
