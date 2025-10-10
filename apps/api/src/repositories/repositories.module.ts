import { Module } from '@nestjs/common';
import { RepoAccessGuard } from '../auth/guards/repo-access.guard';
import { DatabaseModule } from '../database/database.module';

import { SnapshotsModule } from '../snapshots/snapshots.module';
import { UploadModule } from '../upload/upload.module';
import { RepositoriesController } from './repositories.controller';
import { RepositoriesService } from './repositories.service';
import { GitValidationService } from './services/git-validation.service';

/**
 * 仓库管理模块
 */
@Module({
  imports: [DatabaseModule, SnapshotsModule, UploadModule],
  controllers: [RepositoriesController],
  providers: [RepositoriesService, GitValidationService, RepoAccessGuard],
  exports: [RepositoriesService, GitValidationService],
})
export class RepositoriesModule {}
