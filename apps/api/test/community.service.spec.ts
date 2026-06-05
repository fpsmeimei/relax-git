import { RepositoryVisibility } from '@relax-git/shared/generated/prisma-client';
import { CommunityService } from '../src/community/community.service';

describe('CommunityService feed visibility', () => {
  const createService = () => {
    const prisma = {
      repository: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const service = new CommunityService(prisma as any, {} as any, {} as any);

    return { service, prisma };
  };

  it('shows only active published public and internal repositories', async () => {
    const { service, prisma } = createService();

    await service.getCommunityFeed({ sort: 'latest', limit: 12 });

    expect(prisma.repository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isPublished: true,
          isActive: true,
          visibility: {
            in: [RepositoryVisibility.PUBLIC, RepositoryVisibility.INTERNAL],
          },
        },
      })
    );
  });
});
