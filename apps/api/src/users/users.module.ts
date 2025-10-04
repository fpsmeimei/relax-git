import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { OnlineStatusService } from './online-status.service';
import { OnlineStatusController } from './online-status.controller';
import { DatabaseModule } from '../database/database.module';

/**
 * 用户管理模块
 * 提供用户信息管理、用户查询等功能
 */
@Module({
  imports: [DatabaseModule],
  providers: [UsersService, OnlineStatusService],
  controllers: [UsersController, OnlineStatusController],
  exports: [UsersService, OnlineStatusService],
})
export class UsersModule {}
