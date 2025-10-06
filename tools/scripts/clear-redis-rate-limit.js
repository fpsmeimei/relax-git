/**
 * 清除 Redis 速率限制记录
 */

const Redis = require('ioredis');

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  db: 0,
});

async function clearRateLimits() {
  try {
    console.log('连接到 Redis...');

    // 清除所有 rate-limit 相关的 key
    const patterns = ['rate-limit:*', 'login:attempts:*', 'auth:*'];

    for (const pattern of patterns) {
      console.log(`\n查找并删除: ${pattern}`);
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        console.log(`  找到 ${keys.length} 个 key`);
        await redis.del(...keys);
        console.log(`  ✓ 已删除`);
      } else {
        console.log(`  未找到任何 key`);
      }
    }

    console.log('\n✓ Redis 速率限制已清除');

    redis.disconnect();
  } catch (error) {
    console.error('✗ 清除失败:', error.message);
    redis.disconnect();
    process.exit(1);
  }
}

clearRateLimits();
