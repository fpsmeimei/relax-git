import { Module } from '@nestjs/common';
import { HealthModule } from '../health/health.module';
import { AdminConsoleController } from './admin-console.controller';
import { AdminConsoleService } from './admin-console.service';

@Module({
  imports: [HealthModule],
  controllers: [AdminConsoleController],
  providers: [AdminConsoleService],
})
export class AdminModule {}
