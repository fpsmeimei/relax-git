'use client';

import { useSession } from 'next-auth/react';

export interface User {
  id: string;
  uid: string;
  username: string;
  role: string;
  avatar?: string;
  displayName?: string;
}

/**
 * 简化的 useAuth hook - 基于 NextAuth session
 * 兼容旧代码，提供统一的用户信息访问接口
 */
export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user
      ? {
          id: session.user.id,
          uid: session.user.uid,
          username: session.user.name || '',
          role: 'USER',
          avatar: session.user.image,
          displayName: session.user.name,
        }
      : null,
    loading: status === 'loading',
    isAuthenticated: !!session?.user,
    isInitialized: status !== 'loading',
  };
}
