import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PerformanceOptimizerService } from './performance-optimizer.service';

/**
 * 性能优化控制器
 * 提供性能优化相关的 REST API 接口
 */
@ApiTags('Performance')
@Controller('api/performance')
export class PerformanceOptimizerController {
  private readonly logger = new Logger(PerformanceOptimizerController.name);

  constructor(
    private readonly performanceService: PerformanceOptimizerService
  ) {}

  /**
   * 上传工件到 S3
   */
  @Post('artifacts/:artifactId/upload-s3')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '上传工件到 S3 存储' })
  @ApiResponse({ status: 200, description: '上传成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 404, description: '工件不存在' })
  async uploadToS3(
    @Param('artifactId') artifactId: string,
    @Body('localPath') localPath: string
  ) {
    try {
      if (!localPath) {
        throw new BadRequestException('Local path is required');
      }

      const s3Location = await this.performanceService.uploadArtifactToS3(
        artifactId,
        localPath
      );

      return {
        success: true,
        artifactId,
        s3Location,
        message: 'Artifact uploaded to S3 successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to upload artifact ${artifactId} to S3:`,
        error
      );
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * 从 S3 下载工件
   */
  @Post('artifacts/:artifactId/download-s3')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '从 S3 下载工件' })
  @ApiResponse({ status: 200, description: '下载成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 404, description: '工件不存在' })
  async downloadFromS3(
    @Param('artifactId') artifactId: string,
    @Body('targetPath') targetPath: string
  ) {
    try {
      if (!targetPath) {
        throw new BadRequestException('Target path is required');
      }

      await this.performanceService.downloadArtifactFromS3(
        artifactId,
        targetPath
      );

      return {
        success: true,
        artifactId,
        targetPath,
        message: 'Artifact downloaded from S3 successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to download artifact ${artifactId} from S3:`,
        error
      );
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * 压缩工件
   */
  @Post('artifacts/:artifactId/compress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '压缩工件以节省存储空间' })
  @ApiResponse({ status: 200, description: '压缩成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async compressArtifact(@Param('artifactId') artifactId: string) {
    try {
      // TODO: 实现压缩功能
      const report = { storage: { before: 0, after: 0, saved: 0 } };

      return {
        success: true,
        storage: report.storage,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to compress artifact ${artifactId}:`, error);
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * 获取优化建议
   */
  @Get('recommendations')
  @ApiOperation({ summary: '获取性能优化建议' })
  @ApiResponse({ status: 200, description: '返回优化建议列表' })
  async getOptimizationRecommendations() {
    try {
      const report = await this.performanceService.getPerformanceReport();

      return {
        success: true,
        recommendations: report.recommendations,
        totalRecommendations: report.recommendations.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to get optimization recommendations:', error);
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}
