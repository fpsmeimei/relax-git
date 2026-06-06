import {
  RepositoryVisibility,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';
import { RepositoriesService } from '../src/repositories/repositories.service';

describe('RepositoriesService import publishing', () => {
  function createService(
    overrides: {
      prisma?: any;
      gitValidationService?: any;
      baseSnapshotService?: any;
    } = {}
  ) {
    const prisma = overrides.prisma ?? {
      repository: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: 'repo_1',
            ownerId: data.ownerId,
            name: data.name,
            gitUrl: data.gitUrl,
            defaultBranch: data.defaultBranch,
            visibility: data.visibility,
            isPublished: data.isPublished,
            publishedAt: data.publishedAt,
          })
        ),
      },
      member: {
        upsert: jest.fn().mockResolvedValue({}),
      },
    };

    const gitValidationService = overrides.gitValidationService ?? {
      validateGitUrl: jest.fn().mockResolvedValue({
        isValid: true,
        defaultBranch: 'main',
        branches: ['main'],
      }),
      getCommitSha: jest
        .fn()
        .mockResolvedValue('1234567890abcdef1234567890abcdef12345678'),
    };

    const baseSnapshotService = overrides.baseSnapshotService ?? {
      createBaseSnapshotsForRepository: jest.fn().mockResolvedValue([]),
    };

    return {
      prisma,
      gitValidationService,
      baseSnapshotService,
      service: new RepositoriesService(
        prisma as any,
        gitValidationService as any,
        baseSnapshotService as any
      ),
    };
  }

  it('auto-publishes repositories imported with public visibility', async () => {
    const { prisma, service } = createService();

    await service.importRepository('user_1', UserRole.USER, {
      gitUrl: 'https://github.com/example/repo.git',
      name: 'repo',
      visibility: 'public_all',
    });

    expect(prisma.repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          visibility: RepositoryVisibility.PUBLIC,
          isPublished: true,
          publishedAt: expect.any(Date),
        }),
      })
    );
  });

  it('auto-publishes repositories imported with internal visibility', async () => {
    const { prisma, service } = createService();

    await service.importRepository('user_1', UserRole.USER, {
      gitUrl: 'https://github.com/example/repo.git',
      name: 'repo',
      visibility: 'public_readonly',
    });

    expect(prisma.repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          visibility: RepositoryVisibility.INTERNAL,
          isPublished: true,
          publishedAt: expect.any(Date),
        }),
      })
    );
  });

  it('auto-publishes when a repository is changed to internal visibility', async () => {
    const repository = {
      id: 'repo_1',
      ownerId: 'user_1',
      name: 'repo',
      gitUrl: 'https://github.com/example/repo.git',
      defaultBranch: 'main',
      visibility: RepositoryVisibility.PRIVATE,
      isActive: true,
      isPublished: false,
    };
    const prisma = {
      repository: {
        findUnique: jest.fn().mockResolvedValue(repository),
        update: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            ...repository,
            ...data,
          })
        ),
      },
    };
    const { service } = createService({
      prisma,
      gitValidationService: { checkBranchExists: jest.fn() },
    });

    await service.update('repo_1', 'user_1', UserRole.USER, {
      visibility: RepositoryVisibility.INTERNAL,
    });

    expect(prisma.repository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          visibility: RepositoryVisibility.INTERNAL,
          isPublished: true,
          publishedAt: expect.any(Date),
        }),
      })
    );
  });
});
