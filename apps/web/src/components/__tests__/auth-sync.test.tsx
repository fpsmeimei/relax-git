import { render, waitFor } from '@/test/test-utils';
import { apiClient } from '@/lib/api/client';
import { signOut, useSession } from 'next-auth/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthSync } from '../auth-sync';

const authActions = vi.hoisted(() => ({
  login: vi.fn(),
  logout: vi.fn(),
  setInitialized: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthActions: () => authActions,
}));

describe('AuthSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (signOut as any).mockResolvedValue(undefined);
  });

  it('clears stale NextAuth sessions when backend auth cookies are missing', async () => {
    (useSession as any).mockReturnValue({
      status: 'authenticated',
      data: {
        user: {
          id: 'user-1',
          name: 'demo',
          username: 'demo',
          uid: 'demo',
          role: 'USER',
        },
      },
    });
    (apiClient.get as any).mockRejectedValue({
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Unauthorized',
    });

    render(<AuthSync />);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith(
        '/_auth/profile',
        expect.objectContaining({ __noRetry: true })
      );
      expect(authActions.logout).toHaveBeenCalled();
      expect(signOut).toHaveBeenCalledWith({ redirect: false });
    });

    expect(authActions.login).not.toHaveBeenCalled();
  });
});
