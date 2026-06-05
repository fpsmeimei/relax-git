import 'reflect-metadata';
import { RequestMethod } from '@nestjs/common';
import {
  GUARDS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { AppModule } from '../src/app.module';
import { AuthController } from '../src/auth/auth.controller';
import {
  RATE_LIMIT_KEY,
  RateLimitPresets,
} from '../src/common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../src/common/guards/rate-limit.guard';
import { getJwtConfig } from '../src/config/jwt.config';
import { PerformanceOptimizerController } from '../src/snapshots/performance-optimizer.controller';
import { ArtifactsController } from '../src/snapshots/artifacts.controller';

function getRoutePaths(controller: Function): string[] {
  return Object.getOwnPropertyNames(controller.prototype)
    .filter(name => name !== 'constructor')
    .map(name => {
      const handler = controller.prototype[name];
      const method = Reflect.getMetadata(METHOD_METADATA, handler);
      const path = Reflect.getMetadata(PATH_METADATA, handler);
      return typeof method === 'number' && typeof path === 'string'
        ? path
        : null;
    })
    .filter((path): path is string => path !== null);
}

function getPostRoutePaths(controller: Function): string[] {
  return Object.getOwnPropertyNames(controller.prototype)
    .filter(name => name !== 'constructor')
    .map(name => {
      const handler = controller.prototype[name];
      const method = Reflect.getMetadata(METHOD_METADATA, handler);
      const path = Reflect.getMetadata(PATH_METADATA, handler);
      return method === RequestMethod.POST && typeof path === 'string'
        ? path
        : null;
    })
    .filter((path): path is string => path !== null);
}

describe('local-run hardening', () => {
  it('does not expose the obsolete bearer-token-to-cookie auth route', () => {
    expect(getPostRoutePaths(AuthController)).not.toContain('set-cookie');
  });

  it('does not expose local filesystem S3 upload/download routes', () => {
    const routes = getPostRoutePaths(PerformanceOptimizerController);

    expect(routes).not.toContain('artifacts/:artifactId/upload-s3');
    expect(routes).not.toContain('artifacts/:artifactId/download-s3');
  });

  it('does not register Nest middleware on the Fastify stack', () => {
    expect(AppModule.prototype).not.toHaveProperty('configure');
  });

  it('rate limits public registration attempts', () => {
    const handler = AuthController.prototype.register;

    expect(Reflect.getMetadata(RATE_LIMIT_KEY, handler)).toBe(
      RateLimitPresets.REGISTER
    );
    expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toContain(
      RateLimitGuard
    );
  });

  it('requires an explicit JWT_SECRET in production', () => {
    const previousEnv = process.env['NODE_ENV'];
    const previousSecret = process.env['JWT_SECRET'];
    process.env['NODE_ENV'] = 'production';
    delete process.env['JWT_SECRET'];

    try {
      expect(() => getJwtConfig()).toThrow('JWT_SECRET');
    } finally {
      if (previousEnv === undefined) {
        delete process.env['NODE_ENV'];
      } else {
        process.env['NODE_ENV'] = previousEnv;
      }
      if (previousSecret === undefined) {
        delete process.env['JWT_SECRET'];
      } else {
        process.env['JWT_SECRET'] = previousSecret;
      }
    }
  });

  it('hides local worktree and bundle paths from artifact detail responses', async () => {
    const baseSnapshotService = {};
    const prisma = {
      baseSnapshot: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'artifact-1',
          repoId: 'repo-1',
          branchId: 'branch-1',
          commitSha: 'abc123',
          status: 'READY',
          worktreePath: '/tmp/relax-git-worktrees/repo',
          bundlePath: '/tmp/relax-git-bundles/repo.bundle',
          processedAt: new Date('2026-06-05T00:00:00Z'),
          errorMessage: null,
          createdAt: new Date('2026-06-05T00:00:00Z'),
          repository: {
            id: 'repo-1',
            name: 'demo',
          },
          branch: {
            id: 'branch-1',
            name: 'main',
          },
        }),
      },
      repository: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'repo-1', visibility: 'PUBLIC' }),
      },
    };
    const controller = new ArtifactsController(
      baseSnapshotService as any,
      prisma as any
    );

    const result = await controller.getArtifact('artifact-1', {
      user: { id: 'user-1' },
    });

    expect(result).not.toHaveProperty('worktreePath');
    expect(result).not.toHaveProperty('bundlePath');
  });
});
