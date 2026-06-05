import { SnapshotMetricsService } from '../src/snapshots/snapshot-metrics.service';

describe('SnapshotMetricsService', () => {
  it('loads metrics when RedisService.get already returns parsed JSON', async () => {
    const cachedMetrics = {
      artifactCreateCount: 1,
      artifactReuseCount: 0,
      successCount: 1,
      failureCount: 0,
      avgProcessingTime: 0,
      totalProcessingTime: 0,
      currentQueueLength: 0,
      maxQueueLength: 0,
      totalArtifacts: 0,
      readyArtifacts: 0,
      failedArtifacts: 0,
      processingArtifacts: 0,
      queuedTasks: 0,
      recentArtifacts: [],
      processingTimes: [],
      queueLengthHistory: [],
      failureReasons: {},
    };
    const redis = { get: jest.fn().mockResolvedValue(cachedMetrics) } as any;
    const prisma = {} as any;
    const eventEmitter = { emit: jest.fn() } as any;
    const service = new SnapshotMetricsService(prisma, redis, eventEmitter);

    await (service as any).loadMetricsFromCache();

    expect((service as any).metrics).toBe(cachedMetrics);
  });
});
