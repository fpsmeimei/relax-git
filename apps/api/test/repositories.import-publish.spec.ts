import {
  RepositoryVisibility,
  UserRole,
} from '@relax-git/shared/generated/prisma-client';
import { RepositoriesService } from '../src/repositories/repositories.service';

describe('RepositoriesService import publishing', () => {
  it('auto-publishes repositories imported with public visibility', async () => {
    const prisma = {
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

    const gitValidationService = {
      validateGitUrl: jest.fn().mockResolvedValue({
        isValid: true,
        defaultBranch: 'main',
        branches: ['main'],
      }),
      getCommitSha: jest
        .fn()
        .mockResolvedValue('1234567890abcdef1234567890abcdef12345678'),
    };

    const baseSnapshotService = {
      createBaseSnapshotsForRepository: jest.fn().mockResolvedValue([]),
    };

    const service = new RepositoriesService(
      prisma as any,
      gitValidationService as any,
      baseSnapshotService as any
    );

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
});
