import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { join } from 'path';
import { Public } from './auth/decorators/public.decorator';
/**
 * 应用根控制器
 * 处理根路径请求和基本信息
 */
@ApiTags('app')
@Controller('api')
@Public()
export class AppController {
  @Get('info')
  @ApiOperation({ summary: '应用基本信息' })
  @ApiResponse({ status: 200, description: '应用运行状态' })
  getInfo(): any {
    return {
      service: 'relax-git-api',
      version: '0.1.1',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('debug/filesystem')
  async debugFilesystem(): Promise<any> {
    const fs = require('fs-extra');

    const checks = [];
    const workerRoot = join(process.cwd(), '../worker');
    const workerDataRoot = join(workerRoot, 'data');

    // 检查基本目录（Worker 实际使用的路径）
    const dirs = [
      workerDataRoot,
      join(workerDataRoot, 'git', 'worktrees'), // Worker 的 git.temp_dir（包含工作树）
      join(workerDataRoot, 'git', 'bundles'), // Worker 的 git.bundle_dir
      join(workerDataRoot, 'worker'), // Worker 的 work_dir
    ];

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
    const worktreePath = join(
      workerDataRoot,
      'git',
      'worktrees',
      'worktree-cmgfvv2bd005c2wii3b25t2pv'
    );
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

    // 列出实际存在的工作树（检查 Worker 实际使用的目录）
    const worktreeDirs = [join(workerDataRoot, 'git', 'worktrees')];

    for (const worktreeDir of worktreeDirs) {
      try {
        const worktreeExists = await fs.pathExists(worktreeDir);
        if (worktreeExists) {
          const files = await fs.readdir(worktreeDir);
          const worktreeFiles = files.filter((f: string) =>
            f.startsWith('worktree-')
          );
          checks.push({
            path: worktreeDir,
            exists: true,
            files: worktreeFiles,
            count: worktreeFiles.length,
            note: 'actual worktrees in directory',
          });
        }
      } catch (error: any) {
        checks.push({
          path: worktreeDir,
          error: error.message,
          note: 'failed to list worktrees',
        });
      }
    }

    return {
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
