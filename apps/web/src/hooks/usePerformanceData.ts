import { apiClient } from '@/lib/api/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// 环境开关：禁用性能接口，默认关闭
const ENABLE_PERF = process.env['NEXT_PUBLIC_ENABLE_PERFORMANCE'] === 'true';

/**
 * 性能报告接口
 */
interface PerformanceReport {
  storage: {
    total: number;
    s3: number;
    local: number;
  };
  cache: {
    memoryUsed: string;
    hitRate: number;
    missRate: number;
  };
  optimization: {
    compressionRatio: number;
    cacheHitRate: number;
    averageLoadTime: number;
  };
  recommendations: string[];
}

/**
 * 性能数据响应
 */
interface PerformanceResponse {
  success: boolean;
  report?: PerformanceReport;
  cache?: PerformanceReport['cache'];
  storage?: PerformanceReport['storage'];
  optimization?: PerformanceReport['optimization'];
  recommendations?: string[];
  timestamp?: string;
  generatedAt?: string;
}

/**
 * 获取性能报告
 */
const fetchPerformanceReport = async (): Promise<PerformanceReport> => {
  if (!ENABLE_PERF) throw new Error('Performance API is disabled');
  const response = await apiClient.get<PerformanceResponse>(
    '/performance/report'
  );
  if (!response.data.success || !response.data.report) {
    throw new Error('Failed to fetch performance report');
  }
  return response.data.report;
};

/**
 * 获取缓存统计
 */
const fetchCacheStats = async (): Promise<PerformanceReport['cache']> => {
  if (!ENABLE_PERF) throw new Error('Performance API is disabled');
  const response = await apiClient.get<PerformanceResponse>(
    '/performance/cache/stats'
  );
  if (!response.data.success || !response.data.cache) {
    throw new Error('Failed to fetch cache stats');
  }
  return response.data.cache;
};

/**
 * 获取存储统计
 */
const fetchStorageStats = async (): Promise<PerformanceReport['storage']> => {
  if (!ENABLE_PERF) throw new Error('Performance API is disabled');
  const response = await apiClient.get<PerformanceResponse>(
    '/performance/storage/stats'
  );
  if (!response.data.success || !response.data.storage) {
    throw new Error('Failed to fetch storage stats');
  }
  return response.data.storage;
};

/**
 * 获取优化建议
 */
const fetchRecommendations = async (): Promise<string[]> => {
  if (!ENABLE_PERF) throw new Error('Performance API is disabled');
  const response = await apiClient.get<PerformanceResponse>(
    '/performance/recommendations'
  );
  if (!response.data.success) {
    throw new Error('Failed to fetch recommendations');
  }
  return response.data.recommendations || [];
};

/**
 * 执行缓存优化
 */
const optimizeCache = async (): Promise<void> => {
  if (!ENABLE_PERF) throw new Error('Performance API is disabled');
  const response = await apiClient.post('/performance/cache/optimize');
  if (!response.data.success) {
    throw new Error('Failed to optimize cache');
  }
};

/**
 * 为仓库启用裸仓优化
 */
const optimizeBareRepository = async (repoId: string): Promise<void> => {
  if (!ENABLE_PERF) throw new Error('Performance API is disabled');
  const response = await apiClient.post(
    `/performance/repositories/${repoId}/optimize-bare`
  );
  if (!response.data.success) {
    throw new Error('Failed to optimize bare repository');
  }
};

/**
 * 执行增量更新优化
 */
const performIncrementalUpdate = async (params: {
  repoId: string;
  fromCommit: string;
  toCommit: string;
}): Promise<void> => {
  if (!ENABLE_PERF) throw new Error('Performance API is disabled');
  const response = await apiClient.post(
    `/performance/repositories/${params.repoId}/incremental-update`,
    {
      fromCommit: params.fromCommit,
      toCommit: params.toCommit,
    }
  );
  if (!response.data.success) {
    throw new Error('Failed to perform incremental update');
  }
};

/**
 * 性能数据 Hook
 */
export const usePerformanceData = () => {
  const queryClient = useQueryClient();

  // 查询性能报告
  const {
    data: performanceReport,
    isLoading: isLoadingReport,
    error: reportError,
    refetch: refetchReport,
  } = useQuery({
    queryKey: ['performance', 'report'],
    queryFn: fetchPerformanceReport,
    refetchInterval: 60000, // 每分钟自动刷新
    staleTime: 30000, // 30秒后数据视为过期
    enabled: ENABLE_PERF,
  });

  // 查询缓存统计
  const {
    data: cacheStats,
    isLoading: isLoadingCache,
    error: cacheError,
    refetch: refetchCache,
  } = useQuery({
    queryKey: ['performance', 'cache'],
    queryFn: fetchCacheStats,
    refetchInterval: 30000, // 每30秒自动刷新
    staleTime: 15000, // 15秒后数据视为过期
    enabled: ENABLE_PERF,
  });

  // 查询存储统计
  const {
    data: storageStats,
    isLoading: isLoadingStorage,
    error: storageError,
    refetch: refetchStorage,
  } = useQuery({
    queryKey: ['performance', 'storage'],
    queryFn: fetchStorageStats,
    refetchInterval: 120000, // 每2分钟自动刷新
    staleTime: 60000, // 60秒后数据视为过期
    enabled: ENABLE_PERF,
  });

  // 查询优化建议
  const {
    data: recommendations,
    isLoading: isLoadingRecommendations,
    error: recommendationsError,
    refetch: refetchRecommendations,
  } = useQuery({
    queryKey: ['performance', 'recommendations'],
    queryFn: fetchRecommendations,
    refetchInterval: 300000, // 每5分钟自动刷新
    staleTime: 240000, // 4分钟后数据视为过期
    enabled: ENABLE_PERF,
  });

  // 缓存优化 mutation
  const optimizeCacheMutation = useMutation({
    mutationFn: optimizeCache,
    onSuccess: () => {
      // 优化成功后刷新缓存统计
      queryClient.invalidateQueries({ queryKey: ['performance', 'cache'] });
      queryClient.invalidateQueries({ queryKey: ['performance', 'report'] });
    },
  });

  // 裸仓优化 mutation
  const optimizeBareRepoMutation = useMutation({
    mutationFn: optimizeBareRepository,
    onSuccess: () => {
      // 优化成功后刷新存储统计
      queryClient.invalidateQueries({ queryKey: ['performance', 'storage'] });
      queryClient.invalidateQueries({ queryKey: ['performance', 'report'] });
    },
  });

  // 增量更新 mutation
  const incrementalUpdateMutation = useMutation({
    mutationFn: performIncrementalUpdate,
    onSuccess: () => {
      // 更新成功后刷新所有性能数据
      queryClient.invalidateQueries({ queryKey: ['performance'] });
    },
  });

  // 刷新所有数据
  const refetch = () => {
    refetchReport();
    refetchCache();
    refetchStorage();
    refetchRecommendations();
  };

  // 判断是否正在加载
  const isLoading =
    isLoadingReport ||
    isLoadingCache ||
    isLoadingStorage ||
    isLoadingRecommendations;

  // 合并错误
  const error =
    reportError || cacheError || storageError || recommendationsError;

  return {
    // 数据
    performanceReport,
    cacheStats,
    storageStats,
    recommendations,

    // 状态
    isLoading,
    error,

    // 刷新函数
    refetch,
    refetchReport,
    refetchCache,
    refetchStorage,
    refetchRecommendations,

    // 优化操作
    optimizeCache: optimizeCacheMutation.mutate,
    optimizeBareRepo: optimizeBareRepoMutation.mutate,
    performIncrementalUpdate: incrementalUpdateMutation.mutate,

    // 操作状态
    isOptimizingCache: optimizeCacheMutation.isPending,
    isOptimizingBareRepo: optimizeBareRepoMutation.isPending,
    isPerformingIncrementalUpdate: incrementalUpdateMutation.isPending,
  };
};

/**
 * 获取单个工件的性能数据
 */
export const useArtifactPerformance = (artifactId: string) => {
  const queryClient = useQueryClient();

  // 获取语法高亮
  const getSyntaxHighlighting = async (filePath: string): Promise<string> => {
    if (!ENABLE_PERF) throw new Error('Performance API is disabled');
    const response = await apiClient.get(
      `/performance/artifacts/${artifactId}/highlight`,
      {
        params: { filePath },
      }
    );
    if (!response.data.success) {
      throw new Error('Failed to get syntax highlighting');
    }
    return response.data.content;
  };

  // 获取优化的文件内容
  const getOptimizedFile = async (
    filePath: string,
    options?: {
      useCache?: boolean;
      useCompression?: boolean;
      useStreaming?: boolean;
    }
  ): Promise<string> => {
    if (!ENABLE_PERF) throw new Error('Performance API is disabled');
    const response = await apiClient.get(
      `/performance/artifacts/${artifactId}/files/optimized`,
      {
        params: {
          filePath,
          ...options,
        },
      }
    );
    if (!response.data.success) {
      throw new Error('Failed to get optimized file');
    }
    // Base64 解码
    return atob(response.data.content);
  };

  // 上传到 S3
  const uploadToS3 = async (localPath: string): Promise<string> => {
    if (!ENABLE_PERF) throw new Error('Performance API is disabled');
    const response = await apiClient.post(
      `/performance/artifacts/${artifactId}/upload-s3`,
      { localPath }
    );
    if (!response.data.success) {
      throw new Error('Failed to upload to S3');
    }
    return response.data.s3Location;
  };

  // 从 S3 下载
  const downloadFromS3 = async (targetPath: string): Promise<void> => {
    if (!ENABLE_PERF) throw new Error('Performance API is disabled');
    const response = await apiClient.post(
      `/performance/artifacts/${artifactId}/download-s3`,
      { targetPath }
    );
    if (!response.data.success) {
      throw new Error('Failed to download from S3');
    }
  };

  return {
    getSyntaxHighlighting,
    getOptimizedFile,
    uploadToS3,
    downloadFromS3,
  };
};

/**
 * 性能指标格式化工具
 */
export const performanceUtils = {
  /**
   * 格式化字节大小
   */
  formatBytes: (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  /**
   * 格式化百分比
   */
  formatPercentage: (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  },

  /**
   * 获取性能状态颜色
   */
  getPerformanceColor: (
    value: number,
    thresholds: { good: number; warning: number }
  ): string => {
    if (value >= thresholds.good) return 'green';
    if (value >= thresholds.warning) return 'yellow';
    return 'red';
  },

  /**
   * 计算性能得分
   */
  calculatePerformanceScore: (report: PerformanceReport): number => {
    const weights = {
      cacheHitRate: 0.3,
      compressionRatio: 0.2,
      loadTime: 0.3,
      storageEfficiency: 0.2,
    };

    const scores = {
      cacheHitRate: report.cache.hitRate,
      compressionRatio: report.optimization.compressionRatio,
      loadTime: Math.min(1, 500 / report.optimization.averageLoadTime), // 500ms 为满分
      storageEfficiency: report.storage.s3 / (report.storage.total || 1), // S3 使用比例
    };

    return Object.entries(weights).reduce((total, [key, weight]) => {
      return total + scores[key as keyof typeof scores] * weight;
    }, 0);
  },
};
