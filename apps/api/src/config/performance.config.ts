import { registerAs } from '@nestjs/config';

/**
 * 性能优化配置
 */
export default registerAs('performance', () => ({
  // Git 相关配置
  git: {
    // 裸仓存储路径
    bareReposPath:
      process.env.BARE_REPOS_PATH || '/var/lib/relax-git/bare-repos',

    // 是否启用裸仓复用
    enableBareRepoReuse: process.env.ENABLE_BARE_REPO_REUSE === 'true' || true,

    // 工作树缓存时间（秒）
    worktreeCacheTTL: parseInt(process.env.WORKTREE_CACHE_TTL || '3600', 10),
  },

  // 缓存配置
  cache: {
    // 是否启用缓存
    enabled: process.env.CACHE_ENABLED !== 'false',

    // 文件缓存 TTL（秒）
    fileCacheTTL: parseInt(process.env.FILE_CACHE_TTL || '3600', 10),

    // 语法高亮缓存 TTL（秒）
    syntaxHighlightTTL: parseInt(process.env.SYNTAX_CACHE_TTL || '86400', 10),

    // 热点文件数量
    hotFilesLimit: parseInt(process.env.HOT_FILES_LIMIT || '100', 10),

    // 预加载工件数量
    preloadArtifactsLimit: parseInt(
      process.env.PRELOAD_ARTIFACTS_LIMIT || '10',
      10
    ),

    // 缓存清理间隔（分钟）
    cleanupInterval: parseInt(process.env.CACHE_CLEANUP_INTERVAL || '60', 10),
  },

  // 压缩配置
  compression: {
    // 是否启用压缩
    enabled: process.env.COMPRESSION_ENABLED !== 'false',

    // 压缩级别 (1-9)
    level: parseInt(process.env.COMPRESSION_LEVEL || '6', 10),

    // 最小压缩文件大小（字节）
    minSize: parseInt(process.env.COMPRESSION_MIN_SIZE || '1024', 10),
  },

  // 流式传输配置
  streaming: {
    // 启用流式传输的最小文件大小（字节）
    minSize: parseInt(process.env.STREAMING_MIN_SIZE || '10485760', 10), // 10MB

    // 缓冲区大小（字节）
    bufferSize: parseInt(process.env.STREAMING_BUFFER_SIZE || '65536', 10), // 64KB
  },

  // 增量更新配置
  incremental: {
    // 是否启用增量更新
    enabled: process.env.INCREMENTAL_ENABLED === 'true' || true,

    // 最大差异文件数（超过此数量则完全重建）
    maxDiffFiles: parseInt(process.env.MAX_DIFF_FILES || '100', 10),

    // 差异计算超时（毫秒）
    diffTimeout: parseInt(process.env.DIFF_TIMEOUT || '30000', 10),
  },

  // 监控配置
  monitoring: {
    // 是否启用性能监控
    enabled: process.env.MONITORING_ENABLED === 'true' || true,

    // 报告生成间隔（分钟）
    reportInterval: parseInt(process.env.REPORT_INTERVAL || '15', 10),

    // 是否收集详细指标
    collectDetailedMetrics:
      process.env.COLLECT_DETAILED_METRICS === 'true' || false,
  },

  // 资源限制
  limits: {
    // 最大并发工作树数量
    maxConcurrentWorktrees: parseInt(
      process.env.MAX_CONCURRENT_WORKTREES || '10',
      10
    ),

    // 工作树最大存活时间（秒）
    worktreeMaxAge: parseInt(process.env.WORKTREE_MAX_AGE || '7200', 10), // 2小时

    // 最大缓存大小（MB）
    maxCacheSize: parseInt(process.env.MAX_CACHE_SIZE || '1024', 10),

    // 单个工件最大大小（MB）
    maxArtifactSize: parseInt(process.env.MAX_ARTIFACT_SIZE || '500', 10),
  },

  // 优化策略
  optimization: {
    // 自动优化
    autoOptimize: process.env.AUTO_OPTIMIZE === 'true' || true,

    // 优化阈值（缓存命中率低于此值触发优化）
    cacheHitRateThreshold: parseFloat(
      process.env.CACHE_HIT_RATE_THRESHOLD || '0.7'
    ),

    // 存储使用率阈值（高于此值触发清理）
    storageUsageThreshold: parseFloat(
      process.env.STORAGE_USAGE_THRESHOLD || '0.8'
    ),

    // 是否启用预编译
    enablePrecompilation: process.env.ENABLE_PRECOMPILATION === 'true' || true,
  },
}));
