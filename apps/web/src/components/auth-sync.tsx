'use client';

import type { AxiosRequestConfig } from 'axios';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { useAuthActions } from '@/stores/auth-store';
import type { User } from '@/stores/auth-store';

type UserLike = Record<string, unknown>;

const getString = (source: UserLike, key: string) => {
  const value = source[key];
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
};

const toStoreUser = (primary: UserLike, fallback: UserLike = {}): User => {
  const read = (key: string) =>
    getString(primary, key) ?? getString(fallback, key);
  const now = new Date().toISOString();
  const id = read('id') ?? read('sub') ?? '';
  const username =
    read('username') ?? read('name') ?? read('displayName') ?? '';
  const uid = read('uid') ?? id;
  const role = read('role') === 'ADMIN' ? 'ADMIN' : 'USER';
  const avatar = read('avatar') ?? read('image');

  const user: User = {
    id,
    username,
    uid,
    displayName: read('displayName') ?? read('name') ?? username,
    role,
    createdAt: read('createdAt') ?? now,
    updatedAt: read('updatedAt') ?? now,
  };

  if (avatar) {
    user.avatar = avatar;
  }

  return user;
};

const isUnauthorized = (error: unknown) => {
  const apiError = error as { status?: number; code?: string };
  return apiError.status === 401 || apiError.code === 'UNAUTHORIZED';
};

const noRetryConfig: AxiosRequestConfig & { __noRetry: boolean } = {
  __noRetry: true,
};

/**
 * NextAuth 会话同步到 Zustand Store
 *
 * 确保 NextAuth 的认证状态与应用全局状态保持一致
 */
export function AuthSync() {
  const { data: session, status } = useSession();
  const { login, logout, setInitialized } = useAuthActions();

  useEffect(() => {
    let cancelled = false;

    // 标记初始化完成
    if (status !== 'loading') {
      setInitialized(true);
    }

    // 同步用户状态
    if (status === 'authenticated' && session?.user) {
      const sessionUser = session.user as unknown as UserLike;

      const syncAuthenticatedUser = async () => {
        try {
          const response = await apiClient.get('/_auth/profile', noRetryConfig);
          if (cancelled) return;

          // 以后端 profile 为准，避免 NextAuth 仍在但后端 Cookie 已丢失时误判已登录。
          login(
            toStoreUser(
              (response.data ?? {}) as unknown as UserLike,
              sessionUser
            )
          );
        } catch (error) {
          if (cancelled) return;

          if (isUnauthorized(error)) {
            logout();
            await signOut({ redirect: false }).catch(() => void 0);
            return;
          }

          login(toStoreUser(sessionUser));
        }
      };

      void syncAuthenticatedUser();
    } else if (status === 'unauthenticated') {
      logout();
    }

    return () => {
      cancelled = true;
    };
  }, [session, status, login, logout, setInitialized]);

  return null;
}
