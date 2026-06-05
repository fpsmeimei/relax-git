import { ForbiddenException } from '@nestjs/common';
import { MemberRole } from '@relax-git/shared/generated/prisma-client';
import { MembersService } from './members.service';

describe('MembersService', () => {
  let prisma: any;
  let service: MembersService;

  beforeEach(() => {
    prisma = {
      member: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
      },
    };
    service = new MembersService(prisma);
  });

  describe('add', () => {
    it('does not overwrite the role of an existing member', async () => {
      prisma.member.findUnique.mockResolvedValueOnce({
        id: 'member-1',
        role: MemberRole.OWNER,
      });

      await service.add(
        'repo-1',
        { userId: 'user-1', role: MemberRole.MEMBER },
        'owner-1'
      );

      expect(prisma.member.create).not.toHaveBeenCalled();
      expect(prisma.member.update).not.toHaveBeenCalled();
      expect(prisma.member.upsert).not.toHaveBeenCalled();
    });

    it('does not allow a repository admin to grant owner role directly', async () => {
      prisma.member.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'operator-1', role: MemberRole.ADMIN });

      await expect(
        service.add(
          'repo-1',
          { userId: 'user-1', role: MemberRole.OWNER },
          'operator-1'
        )
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(prisma.member.create).not.toHaveBeenCalled();
      expect(prisma.member.update).not.toHaveBeenCalled();
      expect(prisma.member.upsert).not.toHaveBeenCalled();
    });

    it('creates a regular member by default', async () => {
      prisma.member.findUnique.mockResolvedValueOnce(null);
      prisma.member.create.mockResolvedValueOnce({
        id: 'member-1',
        role: MemberRole.MEMBER,
      });

      await service.add('repo-1', { userId: 'user-1' }, 'admin-1');

      expect(prisma.member.create).toHaveBeenCalledWith({
        data: {
          repoId: 'repo-1',
          userId: 'user-1',
          role: MemberRole.MEMBER,
        },
      });
    });
  });
});
