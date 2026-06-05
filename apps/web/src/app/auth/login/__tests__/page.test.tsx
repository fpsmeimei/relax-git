import { fireEvent, render, screen, waitFor } from '@/test/test-utils';
import { signIn } from 'next-auth/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from '../page';
import { apiClient } from '@/lib/api/client';

const replace = vi.fn();
const toast = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () =>
    new URLSearchParams('username=demo-user&callbackUrl=%2Frepositories'),
}));

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast }),
}));

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.post as any).mockResolvedValue({ data: { success: true } });
    (signIn as any).mockResolvedValue({});
  });

  it('stores API auth cookies in the browser before creating the NextAuth session', async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText('密码'), {
      target: { value: 'LocalDemo123' },
    });
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/_auth/login', {
        username: 'demo-user',
        password: 'LocalDemo123',
      });
      expect(signIn).toHaveBeenCalledWith('credentials', {
        username: 'demo-user',
        password: 'LocalDemo123',
        redirect: false,
      });
    });

    expect((apiClient.post as any).mock.invocationCallOrder[0]).toBeLessThan(
      (signIn as any).mock.invocationCallOrder[0]
    );
    expect(replace).toHaveBeenCalledWith('/repositories');
  });
});
