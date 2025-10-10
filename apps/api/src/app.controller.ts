import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './auth/decorators/public.decorator';
/**
 * 应用根控制器
 * 处理根路径请求和基本信息
 */
@ApiTags('app')
@Controller()
@Public()
export class AppController {
  @Get('info')
  @ApiOperation({ summary: '应用基本信息' })
  @ApiResponse({ status: 200, description: '应用运行状态' })
  getInfo(): any {
    return {
      service: 'relax-git-api',
      version: '0.1.1', // 版本号更新，强制部署
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      deployTime: '2025-01-10T01:36:00Z', // 部署标识
    };
  }

  @Get('debug/filesystem')
  async debugFilesystem(): Promise<any> {
    const fs = require('fs-extra');

    const checks = [];

    // 检查基本目录
    const dirs = ['/tmp', '/tmp/relax-git-worktrees', '/tmp/relax-git-bundles'];

    for (const dir of dirs) {
      try {
        const exists = await fs.pathExists(dir);
        const stats = exists ? await fs.stat(dir) : null;
        checks.push({
          path: dir,
          exists,
          isDirectory: stats?.isDirectory() || false,
          permissions: stats
            ? `${(stats.mode & parseInt('777', 8)).toString(8)}`
            : null,
        });
      } catch (error: any) {
        checks.push({
          path: dir,
          exists: false,
          error: error.message,
        });
      }
    }

    // 检查具体的工作树路径
    const worktreePath =
      '/tmp/relax-git-worktrees/worktree-cmgfvv2bd005c2wii3b25t2pv';
    try {
      const exists = await fs.pathExists(worktreePath);
      checks.push({
        path: worktreePath,
        exists,
        note: 'specific worktree path',
      });
    } catch (error: any) {
      checks.push({
        path: worktreePath,
        exists: false,
        error: error.message,
        note: 'specific worktree path',
      });
    }

    return {
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
