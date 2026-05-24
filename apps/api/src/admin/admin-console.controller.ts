import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@relax-git/shared/generated/prisma-client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminConsoleService } from './admin-console.service';

@ApiTags('admin-console')
@Controller('api/admin/console')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminConsoleController {
  constructor(private readonly adminConsoleService: AdminConsoleService) {}

  @Get('overview')
  @ApiOperation({ summary: '获取运营管理控制台概览数据' })
  @ApiResponse({ status: 200, description: '控制台概览数据获取成功' })
  async getOverview() {
    return this.adminConsoleService.getOverview();
  }
}
