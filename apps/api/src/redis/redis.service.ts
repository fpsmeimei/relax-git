import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { REDIS_KEYS, getRedisConfig } from '@relax-git/shared';
import { Redis } from 'ioredis';

/**
 * Redis 服务
 * 提供缓存、会话存储和队列功能
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private subscriber: Redis;
  private publisher: Redis;

  constructor() {
    const config = getRedisConfig();

    // 主客户端
    const redisConfig = { ...config };
    if (!redisConfig.password) {
      delete redisConfig.password;
    }

    this.client = new Redis(redisConfig as any);

    // 发布订阅客户端
    this.subscriber = new Redis(redisConfig as any);
    this.publisher = new Redis(redisConfig as any);
  }

  async onModuleInit() {
    // 监听连接事件
    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    this.client.on('error', error => {
      console.error('❌ Redis connection error:', error);
    });

    // 尝试连接，但不阻塞应用启动
    try {
      await this.client.ping();
      console.log('✅ Redis connection established');
    } catch (error) {
      console.warn(
        '⚠️ Redis connection failed, continuing without Redis:',
        error instanceof Error ? error.message : String(error)
      );
      // 不抛出错误，允许应用继续启动
    }
  }

  async onModuleDestroy() {
    await Promise.all([
      this.client.quit(),
      this.subscriber.quit(),
      this.publisher.quit(),
    ]);
    console.log('✅ Redis disconnected successfully');
  }

  /**
   * 获取主客户端
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * 获取发布客户端
   */
  getPublisher(): Redis {
    return this.publisher;
  }

  /**
   * 获取订阅客户端
   */
  getSubscriber(): Redis {
    return this.subscriber;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  /**
   * 设置缓存
   */
  async set(
    key: string,
    value: string | object,
    ttlSeconds?: number
  ): Promise<void> {
    const serializedValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, serializedValue);
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  /**
   * 获取缓存
   */
  async get<T = string>(key: string): Promise<T | null> {
    const value = await this.client.get(key);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  /**
   * 设置带过期时间的缓存（直接方法）
   */
  async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
    await this.client.setex(key, ttlSeconds, value);
  }

  /**
   * 获取多个键的值
   */
  async mget(...keys: string[]): Promise<(string | null)[]> {
    return await this.client.mget(...keys);
  }

  /**
   * 获取匹配模式的所有键
   */
  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  /**
   * 创建管道
   */
  pipeline() {
    return this.client.pipeline();
  }

  /**
   * 添加元素到集合
   */
  async sadd(key: string, ...members: string[]): Promise<number> {
    return await this.client.sadd(key, ...members);
  }

  /**
   * 获取集合所有成员
   */
  async smembers(key: string): Promise<string[]> {
    return await this.client.smembers(key);
  }

  /**
   * 删除缓存
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * 设置过期时间
   */
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  /**
   * 获取剩余过期时间
   */
  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  /**
   * 发布消息
   */
  async publish(channel: string, message: string | object): Promise<void> {
    const serializedMessage =
      typeof message === 'string' ? message : JSON.stringify(message);
    await this.publisher.publish(channel, serializedMessage);
  }

  /**
   * 订阅频道
   */
  async subscribe(
    channel: string,
    callback: (message: string) => void
  ): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(message);
      }
    });
  }

  /**
   * 模式订阅频道
   */
  async psubscribe(
    pattern: string,
    callback: (channel: string, message: string) => void
  ): Promise<void> {
    await this.subscriber.psubscribe(pattern);
    this.subscriber.on('pmessage', (receivedPattern, channel, message) => {
      if (receivedPattern === pattern) {
        callback(channel, message);
      }
    });
  }

  /**
   * 取消订阅
   */
  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
  }

  /**
   * 添加到队列
   */
  async enqueue(queueName: string, data: object): Promise<void> {
    await this.client.lpush(queueName, JSON.stringify(data));
  }

  /**
   * 从队列取出
   */
  async dequeue<T = object>(queueName: string): Promise<T | null> {
    const result = await this.client.brpop(queueName, 0);

    if (!result) {
      return null;
    }

    try {
      return JSON.parse(result[1]) as T;
    } catch {
      return result[1] as T;
    }
  }

  /**
   * 获取队列长度
   */
  async getQueueLength(queueName: string): Promise<number> {
    return await this.client.llen(queueName);
  }

  /**
   * 用户会话管理
   */
  async setUserSession(
    userId: string,
    sessionData: object,
    ttlSeconds = 86400
  ): Promise<void> {
    const key = `${REDIS_KEYS.USER_SESSION}:${userId}`;
    await this.set(key, sessionData, ttlSeconds);
  }

  async getUserSession<T = object>(userId: string): Promise<T | null> {
    const key = `${REDIS_KEYS.USER_SESSION}:${userId}`;
    return await this.get<T>(key);
  }

  async deleteUserSession(userId: string): Promise<void> {
    const key = `${REDIS_KEYS.USER_SESSION}:${userId}`;
    await this.del(key);
  }

  /**
   * 快照状态管理
   */
  async setSnapshotStatus(
    snapshotId: string,
    status: string,
    ttlSeconds = 3600
  ): Promise<void> {
    const key = `${REDIS_KEYS.SNAPSHOT_STATUS}:${snapshotId}`;
    await this.set(key, status, ttlSeconds);
  }

  async getSnapshotStatus(snapshotId: string): Promise<string | null> {
    const key = `${REDIS_KEYS.SNAPSHOT_STATUS}:${snapshotId}`;
    return await this.get<string>(key);
  }

  /**
   * 速率限制
   */
  async checkRateLimit(
    identifier: string,
    windowSeconds: number,
    maxRequests: number
  ): Promise<boolean> {
    const key = `${REDIS_KEYS.RATE_LIMIT}:${identifier}`;
    const current = await this.client.incr(key);

    if (current === 1) {
      await this.client.expire(key, windowSeconds);
    }

    return current <= maxRequests;
  }

  /**
   * 获取 Redis 统计信息
   */
  async getStats() {
    const info = await this.client.info();
    const memory = await this.client.info('memory');
    const keyspace = await this.client.info('keyspace');

    return {
      info,
      memory,
      keyspace,
      timestamp: new Date(),
    };
  }
}
