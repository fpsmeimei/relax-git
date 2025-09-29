import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePerformanceData } from '@/hooks/usePerformanceData';
import { formatBytes, formatPercentage } from '@/lib/utils';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Cloud,
  Cpu,
  Database,
  HardDrive,
  RefreshCw,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

/**
 * 性能监控仪表板组件
 * 展示系统性能指标和优化建议
 */
export const PerformanceDashboard: React.FC = () => {
  const {
    performanceReport,
    cacheStats,
    storageStats,
    recommendations,
    isLoading,
    error,
    refetch,
  } = usePerformanceData();

  const [autoRefresh, setAutoRefresh] = useState(false);

  // 自动刷新
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
      }, 15000); // 每15秒刷新一次

      return () => clearInterval(interval);
    }
    return undefined;
  }, [autoRefresh, refetch]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>加载性能数据失败: {error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">性能监控</h1>
          <p className="text-muted-foreground">系统性能指标和优化建议</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="mr-2 h-4 w-4" />
            {autoRefresh ? '自动刷新' : '手动刷新'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            刷新
          </Button>
        </div>
      </div>

      {/* 优化建议 */}
      {recommendations && recommendations.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">优化建议</div>
            <ul className="list-disc list-inside space-y-1">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-sm">
                  {rec}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="cache">缓存</TabsTrigger>
          <TabsTrigger value="storage">存储</TabsTrigger>
          <TabsTrigger value="optimization">优化</TabsTrigger>
        </TabsList>

        {/* 概览标签页 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* 缓存命中率 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  缓存命中率
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cacheStats?.hitRate
                    ? formatPercentage(cacheStats.hitRate)
                    : '0%'}
                </div>
                <Progress
                  value={cacheStats?.hitRate ? cacheStats.hitRate * 100 : 0}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">目标: 70%+</p>
              </CardContent>
            </Card>

            {/* 存储使用 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">存储使用</CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {storageStats?.total
                    ? formatBytes(storageStats.total)
                    : '0 MB'}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>本地: {formatBytes(storageStats?.local || 0)}</span>
                    <span>S3: {formatBytes(storageStats?.s3 || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 压缩率 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">压缩率</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceReport?.optimization?.compressionRatio
                    ? formatPercentage(
                        performanceReport.optimization.compressionRatio
                      )
                    : '0%'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  节省空间比例
                </p>
              </CardContent>
            </Card>

            {/* 平均加载时间 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  平均加载时间
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceReport?.optimization?.averageLoadTime || 0} ms
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  目标: &lt;500ms
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 缓存标签页 */}
        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>缓存性能</CardTitle>
              <CardDescription>Redis 缓存使用情况和效率分析</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    命中率
                  </div>
                  <div className="text-2xl font-bold">
                    {formatPercentage(cacheStats?.hitRate || 0)}
                  </div>
                  <Progress
                    value={(cacheStats?.hitRate || 0) * 100}
                    className="mt-2"
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    未命中率
                  </div>
                  <div className="text-2xl font-bold">
                    {formatPercentage(cacheStats?.missRate || 0)}
                  </div>
                  <Progress
                    value={(cacheStats?.missRate || 0) * 100}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="pt-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  内存使用
                </div>
                <div className="text-sm space-y-1">
                  <div className="font-mono">
                    {cacheStats?.memoryUsed || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Badge
                  variant={
                    (cacheStats?.hitRate ?? 0) >= 0.7
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {(cacheStats?.hitRate ?? 0) >= 0.7 ? '性能良好' : '需要优化'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 存储标签页 */}
        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>存储分析</CardTitle>
              <CardDescription>本地存储和对象存储使用情况</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {/* 总存储 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span className="font-medium">总存储</span>
                  </div>
                  <span className="font-bold">
                    {formatBytes(storageStats?.total || 0)}
                  </span>
                </div>

                {/* 本地存储 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    <span className="text-sm">本地存储</span>
                  </div>
                  <span className="text-sm">
                    {formatBytes(storageStats?.local || 0)}
                  </span>
                </div>

                {/* S3 存储 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4" />
                    <span className="text-sm">S3 存储</span>
                  </div>
                  <span className="text-sm">
                    {formatBytes(storageStats?.s3 || 0)}
                  </span>
                </div>
              </div>

              {/* 存储分布 */}
              <div className="pt-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  存储分布
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>本地</span>
                      <span>
                        {storageStats?.total
                          ? formatPercentage(
                              storageStats.local / storageStats.total
                            )
                          : '0%'}
                      </span>
                    </div>
                    <Progress
                      value={
                        storageStats?.total
                          ? (storageStats.local / storageStats.total) * 100
                          : 0
                      }
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>S3</span>
                      <span>
                        {storageStats?.total
                          ? formatPercentage(
                              storageStats.s3 / storageStats.total
                            )
                          : '0%'}
                      </span>
                    </div>
                    <Progress
                      value={
                        storageStats?.total
                          ? (storageStats.s3 / storageStats.total) * 100
                          : 0
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 优化标签页 */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>优化指标</CardTitle>
              <CardDescription>系统优化效果和改进空间</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* 压缩率 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    <span className="text-sm font-medium">压缩率</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatPercentage(
                      performanceReport?.optimization?.compressionRatio || 0
                    )}
                  </div>
                  <Progress
                    value={
                      (performanceReport?.optimization?.compressionRatio || 0) *
                      100
                    }
                  />
                </div>

                {/* 缓存优化 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-medium">缓存效率</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {formatPercentage(
                      performanceReport?.optimization?.cacheHitRate || 0
                    )}
                  </div>
                  <Progress
                    value={
                      (performanceReport?.optimization?.cacheHitRate || 0) * 100
                    }
                  />
                </div>
              </div>

              {/* 性能指标 */}
              <div className="pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">平均加载时间</span>
                  <Badge
                    variant={
                      (performanceReport?.optimization?.averageLoadTime || 0) <
                      500
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {performanceReport?.optimization?.averageLoadTime || 0} ms
                  </Badge>
                </div>
              </div>

              {/* 优化操作 */}
              <div className="pt-4 flex gap-2">
                <Button size="sm" variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  执行缓存优化
                </Button>
                <Button size="sm" variant="outline">
                  <Database className="mr-2 h-4 w-4" />
                  清理冷数据
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
