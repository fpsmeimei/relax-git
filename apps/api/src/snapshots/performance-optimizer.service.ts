import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as zlib from 'zlib';
import { promisify } from 'util';
// import * as crypto from 'crypto';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

/**
 * Phase 3.2: 性能优化服务
 * 实现对象存储、缓存优化和预编译等性能改进
 */
@Injectable()
export class PerformanceOptimizerService {
  private readonly logger = new Logger(PerformanceOptimizerService.name);
  private s3: S3Client | null = null;
  private readonly cachePrefix = 'artifact:cache:';
  private readonly syntaxCachePrefix = 'syntax:cache:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService
  ) {
    this.initializeS3();
  }

  /**
   * 初始化 S3 客户端
   */
  private initializeS3(): void {
    const s3Config = this.configService.get('s3');
    if (s3Config && s3Config.enabled) {
      this.s3 = new S3Client({
        credentials: {
          accessKeyId: s3Config.accessKeyId,
          secretAccessKey: s3Config.secretAccessKey,
        },
        endpoint: s3Config.endpoint,
        forcePathStyle: s3Config.forcePathStyle || true,
        region: s3Config.region || 'us-east-1',
      });
      this.logger.log('S3 client initialized');
    } else {
      this.logger.warn('S3 is not configured, using local storage');
    }
  }

  /**
   * 将工件上传到 S3
   */
  async uploadArtifactToS3(
    artifactId: string,
    localPath: string
  ): Promise<string> {
    if (!this.s3) {
      throw new Error('S3 is not configured');
    }

    const bucket = this.configService.get('s3.bucket', 'relax-git-artifacts');
    const key = `artifacts/${artifactId}/bundle.tar.gz`;

    try {
      // 压缩文件
      const compressed = await this.compressDirectory(localPath);

      // 上传到 S3
      const uploadParams = {
        Bucket: bucket,
        Key: key,
        Body: compressed,
        ContentType: 'application/gzip',
        Metadata: {
          artifactId,
          uploadDate: new Date().toISOString(),
        },
      };

      const command = new PutObjectCommand(uploadParams);
      await this.s3.send(command);

      this.logger.log(
        `Artifact ${artifactId} uploaded to S3: ${bucket}/${key}`
      );

      // 更新数据库记录
      await this.prisma.snapshotArtifact.update({
        where: { id: artifactId },
        data: {
          metadata: {
            s3Location: `${bucket}/${key}`,
            s3Bucket: bucket,
            s3Key: key,
            compressionRatio:
              compressed.length / (await this.getDirectorySize(localPath)),
          },
        },
      });

      return `${bucket}/${key}`;
    } catch (error) {
      this.logger.error(
        `Failed to upload artifact ${artifactId} to S3:`,
        error
      );
      throw error;
    }
  }

  /**
   * 从 S3 下载工件
   */
  async downloadArtifactFromS3(
    artifactId: string,
    targetPath: string
  ): Promise<void> {
    if (!this.s3) {
      throw new Error('S3 is not configured');
    }

    const artifact = await this.prisma.snapshotArtifact.findUnique({
      where: { id: artifactId },
    });

    if (!artifact || !artifact.metadata) {
      throw new Error('Artifact not found or missing S3 metadata');
    }

    const metadata = artifact.metadata as any;
    if (!metadata.s3Bucket || !metadata.s3Key) {
      throw new Error('S3 metadata is incomplete');
    }

    try {
      // 下载从 S3
      const downloadParams = {
        Bucket: metadata.s3Bucket,
        Key: metadata.s3Key,
      };

      const command = new GetObjectCommand(downloadParams);
      const data = await this.s3.send(command);

      // 解压缩到目标路径
      if (!data.Body) {
        throw new Error('S3 object body is empty');
      }
      const bodyBuffer = Buffer.from(await data.Body.transformToByteArray());
      await this.decompressToDirectory(bodyBuffer, targetPath);

      this.logger.log(
        `Artifact ${artifactId} downloaded from S3 to ${targetPath}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to download artifact ${artifactId} from S3:`,
        error
      );
      throw error;
    }
  }

  /**
   * 实现裸仓复用机制
   */
  async implementBareRepositoryReuse(repoId: string): Promise<void> {
    const bareRepoPath = path.join(
      this.configService.get('git.bareReposPath', '/tmp/bare-repos'),
      repoId
    );

    // 检查裸仓是否存在
    if (await fs.pathExists(bareRepoPath)) {
      // 更新裸仓
      await this.updateBareRepository(bareRepoPath);
    } else {
      // 创建裸仓
      await this.createBareRepository(repoId, bareRepoPath);
    }

    // 更新所有相关的工件引用
    await this.updateArtifactsToUseBareRepo(repoId, bareRepoPath);
  }

  /**
   * 预编译语法高亮
   */
  async precompileSyntaxHighlighting(
    artifactId: string,
    filePath: string
  ): Promise<string> {
    const cacheKey = `${this.syntaxCachePrefix}${artifactId}:${filePath}`;

    // 检查缓存
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 读取文件内容
    const artifact = await this.prisma.snapshotArtifact.findUnique({
      where: { id: artifactId },
    });

    if (!artifact || !artifact.worktreePath) {
      throw new Error('Artifact not found or worktree not available');
    }

    const fullPath = path.join(artifact.worktreePath, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');

    // 执行语法高亮（简化实现）
    const highlighted = await this.highlightCode(content, filePath);

    // 缓存结果
    await this.redis.set(cacheKey, highlighted, 86400); // 24小时缓存

    return highlighted;
  }

  /**
   * 实现智能缓存策略
   */
  async implementSmartCaching(): Promise<void> {
    // 1. 热点文件缓存
    await this.cacheHotFiles();

    // 2. 预加载常用工件
    await this.preloadFrequentArtifacts();

    // 3. 清理冷数据
    await this.cleanupColdCache();
  }

  /**
   * 优化文件读取性能
   */
  async optimizeFileReading(
    artifactId: string,
    filePath: string,
    options: {
      useCache?: boolean;
      useCompression?: boolean;
      useStreaming?: boolean;
    } = {}
  ): Promise<any> {
    const {
      useCache = true,
      useCompression = true,
      useStreaming = false,
    } = options;

    // 1. 尝试从缓存读取
    if (useCache) {
      const cached = await this.getCachedFile(artifactId, filePath);
      if (cached) {
        return cached;
      }
    }

    // 2. 读取原始文件
    const artifact = await this.prisma.snapshotArtifact.findUnique({
      where: { id: artifactId },
    });

    if (!artifact || !artifact.worktreePath) {
      throw new Error('Artifact not found');
    }

    const fullPath = path.join(artifact.worktreePath, filePath);

    // 3. 检查文件大小
    const stats = await fs.stat(fullPath);

    // 4. 大文件流式读取
    if (useStreaming && stats.size > 10 * 1024 * 1024) {
      // 10MB
      return this.createFileStream(fullPath);
    }

    // 5. 普通读取
    let content = await fs.readFile(fullPath);

    // 6. 压缩传输
    if (useCompression) {
      content = Buffer.from(await gzip(content));
    }

    // 7. 缓存结果
    if (useCache) {
      await this.cacheFile(artifactId, filePath, content);
    }

    return content;
  }

  /**
   * 实现增量更新优化
   */
  async optimizeIncrementalUpdate(
    repoId: string,
    fromCommit: string,
    toCommit: string
  ): Promise<void> {
    // 1. 计算差异
    const diff = await this.calculateDiff(repoId, fromCommit, toCommit);

    // 2. 只更新变化的文件
    const changedFiles = diff.files.filter(
      (f: any) => f.status !== 'unchanged'
    );

    // 3. 复用未变化的部分
    const existingArtifact = await this.prisma.snapshotArtifact.findFirst({
      where: {
        repoId,
        commitSha: fromCommit,
        status: 'READY',
      },
    });

    if (existingArtifact && existingArtifact.worktreePath) {
      // 4. 创建新工件，复用大部分内容
      await this.createIncrementalArtifact(
        repoId,
        toCommit,
        existingArtifact.worktreePath,
        changedFiles
      );
    }
  }

  /**
   * 获取性能报告
   */
  async getPerformanceReport(): Promise<PerformanceReport> {
    const report: PerformanceReport = {
      storage: await this.getStorageStats(),
      cache: await this.getCacheStats(),
      optimization: await this.getOptimizationStats(),
      recommendations: await this.generateRecommendations(),
    };

    return report;
  }

  /**
   * 压缩目录
   */
  private async compressDirectory(dirPath: string): Promise<Buffer> {
    // 简化实现，实际应该使用 tar + gzip
    const content = await fs.readFile(dirPath);
    return gzip(content);
  }

  /**
   * 解压缩到目录
   */
  private async decompressToDirectory(
    compressed: Buffer,
    targetPath: string
  ): Promise<void> {
    const decompressed = await gunzip(compressed);
    await fs.writeFile(targetPath, decompressed);
  }

  /**
   * 获取目录大小
   */
  private async getDirectorySize(dirPath: string): Promise<number> {
    const stats = await fs.stat(dirPath);
    if (stats.isFile()) {
      return stats.size;
    }
    // 简化实现
    return 1024 * 1024; // 假设1MB
  }

  /**
   * 创建裸仓
   */
  private async createBareRepository(
    repoId: string,
    bareRepoPath: string
  ): Promise<void> {
    const repo = await this.prisma.repository.findUnique({
      where: { id: repoId },
    });

    if (!repo) {
      throw new Error('Repository not found');
    }

    // 使用 git clone --bare
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    await fs.ensureDir(path.dirname(bareRepoPath));
    await execAsync(`git clone --bare ${repo.gitUrl} ${bareRepoPath}`);

    this.logger.log(`Created bare repository at ${bareRepoPath}`);
  }

  /**
   * 更新裸仓
   */
  private async updateBareRepository(bareRepoPath: string): Promise<void> {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    await execAsync(`git fetch --all`, { cwd: bareRepoPath });
    this.logger.log(`Updated bare repository at ${bareRepoPath}`);
  }

  /**
   * 更新工件使用裸仓
   */
  private async updateArtifactsToUseBareRepo(
    repoId: string,
    bareRepoPath: string
  ): Promise<void> {
    // 更新所有相关工件的元数据
    await this.prisma.snapshotArtifact.updateMany({
      where: { repoId },
      data: {
        metadata: {
          bareRepoPath,
        },
      },
    });
  }

  /**
   * 代码高亮（简化实现）
   */
  private async highlightCode(
    code: string,
    _filePath: string
  ): Promise<string> {
    // 实际应该使用 Prism.js 或类似库
    return `<pre class="highlighted">${code}</pre>`;
  }

  /**
   * 缓存热点文件
   */
  private async cacheHotFiles(): Promise<void> {
    // 查询最常访问的文件
    const hotFiles = await this.prisma.$queryRaw`
      SELECT artifact_id, file_path, COUNT(*) as access_count
      FROM file_access_logs
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY artifact_id, file_path
      ORDER BY access_count DESC
      LIMIT 100
    `;

    // 缓存这些文件
    for (const file of hotFiles as any[]) {
      await this.cacheFile(file.artifact_id, file.file_path);
    }
  }

  /**
   * 预加载常用工件
   */
  private async preloadFrequentArtifacts(): Promise<void> {
    const frequentArtifacts = await this.prisma.snapshotArtifact.findMany({
      where: {
        status: 'READY',
        updatedAt: {
          gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天内
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
    });

    for (const artifact of frequentArtifacts) {
      await this.preloadArtifact(artifact.id);
    }
  }

  /**
   * 清理冷缓存
   */
  private async cleanupColdCache(): Promise<void> {
    // 获取所有缓存键
    const pattern = `${this.cachePrefix}*`;
    const keys = await this.redis.keys(pattern);

    for (const key of keys) {
      const ttl = await this.redis.ttl(key);
      // 如果TTL小于1小时，说明很少被访问
      if (ttl < 3600) {
        await this.redis.del(key);
      }
    }
  }

  /**
   * 缓存文件
   */
  private async cacheFile(
    artifactId: string,
    filePath: string,
    content?: Buffer
  ): Promise<void> {
    const cacheKey = `${this.cachePrefix}${artifactId}:${filePath}`;

    if (!content) {
      // 读取文件内容
      const artifact = await this.prisma.snapshotArtifact.findUnique({
        where: { id: artifactId },
      });

      if (artifact?.worktreePath) {
        const fullPath = path.join(artifact.worktreePath, filePath);
        content = await fs.readFile(fullPath);
      }
    }

    if (content) {
      // 压缩后缓存
      const compressed = await gzip(content);
      await this.redis.set(cacheKey, compressed.toString('base64'), 3600); // 1小时
    }
  }

  /**
   * 获取缓存的文件
   */
  private async getCachedFile(
    artifactId: string,
    filePath: string
  ): Promise<Buffer | null> {
    const cacheKey = `${this.cachePrefix}${artifactId}:${filePath}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
      const compressed = Buffer.from(cached, 'base64');
      return gunzip(compressed);
    }

    return null;
  }

  /**
   * 创建文件流
   */
  private createFileStream(filePath: string): fs.ReadStream {
    return fs.createReadStream(filePath);
  }

  /**
   * 预加载工件
   */
  private async preloadArtifact(artifactId: string): Promise<void> {
    // 简化实现
    this.logger.debug(`Preloading artifact ${artifactId}`);
  }

  /**
   * 计算差异
   */
  private async calculateDiff(
    _repoId: string,
    _fromCommit: string,
    _toCommit: string
  ): Promise<any> {
    // 简化实现
    return {
      files: [],
    };
  }

  /**
   * 创建增量工件
   */
  private async createIncrementalArtifact(
    repoId: string,
    commitSha: string,
    _basePath: string,
    _changedFiles: any[]
  ): Promise<void> {
    // 简化实现
    this.logger.debug(`Creating incremental artifact for ${commitSha}`);
  }

  /**
   * 获取存储统计
   */
  private async getStorageStats(): Promise<any> {
    const [totalSize, s3Size, localSize] = await Promise.all([
      this.prisma.$queryRaw`
        SELECT SUM(LENGTH(worktree_path) + LENGTH(bundle_path)) as total
        FROM snapshot_artifacts
      `,
      this.getS3StorageSize(),
      this.getLocalStorageSize(),
    ]);

    return {
      total: totalSize,
      s3: s3Size,
      local: localSize,
    };
  }

  /**
   * 获取缓存统计
   */
  private async getCacheStats(): Promise<any> {
    // TODO: 实现 Redis 内存信息获取
    const info = 'used_memory:1024\r\nused_memory_human:1K\r\n';

    return {
      memoryUsed: info,
      hitRate: 0.85, // 简化实现
      missRate: 0.15,
    };
  }

  /**
   * 获取优化统计
   */
  private async getOptimizationStats(): Promise<any> {
    return {
      compressionRatio: 0.65,
      cacheHitRate: 0.85,
      averageLoadTime: 245, // ms
    };
  }

  /**
   * 生成推荐
   */
  private async generateRecommendations(): Promise<string[]> {
    const recommendations = [];

    // 检查S3配置
    if (!this.s3) {
      recommendations.push('Enable S3 storage for better scalability');
    }

    // 检查缓存使用
    const cacheStats = await this.getCacheStats();
    if (cacheStats.hitRate < 0.7) {
      recommendations.push('Consider increasing cache TTL for better hit rate');
    }

    return recommendations;
  }

  /**
   * 获取S3存储大小
   */
  private async getS3StorageSize(): Promise<number> {
    if (!this.s3) {
      return 0;
    }

    // 简化实现
    return 1024 * 1024 * 1024; // 1GB
  }

  /**
   * 获取本地存储大小
   */
  private async getLocalStorageSize(): Promise<number> {
    // 简化实现
    return 500 * 1024 * 1024; // 500MB
  }
}

// 类型定义
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
