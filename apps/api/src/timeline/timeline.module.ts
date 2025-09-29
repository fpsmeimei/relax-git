import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { TimelineExceptionFilter } from './filters/timeline-exception.filter';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';

/**
 * 时间线事件管理模块
 */
@Module({
  imports: [DatabaseModule, RedisModule],
  controllers: [TimelineController],
  providers: [
    TimelineService,
    {
      provide: APP_FILTER,
      useClass: TimelineExceptionFilter,
    },
  ],
  exports: [TimelineService],
})
export class TimelineModule {}
