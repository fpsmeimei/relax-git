'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useAuthActions } from '@/stores/auth-store';

/**
 * NextAuth 会话同步到 Zustand Store
 * 
 * 确保 NextAuth 的认证状态与应用全局状态保持一致
 */
export function AuthSync() {
  const { data: session, status } = useSession();
  const { login, logout, setInitialized } = useAuthActions();

  useEffect(() => {
    // 标记初始化完成
    if (status !== 'loading') {
      setInitialized(true);
    }

    // 同步用户状态
    if (status === 'authenticated' && session?.user) {
      const user = session.user as any;
      
      // 同步用户信息到 Zustand
      login({
        id: user.id || user.sub || '',
        username: user.name || user.username || '',
        uid: user.uid || user.id || user.sub || '',
        displayName: user.name || user.username || '',
        avatar: user.image || user.avatar || undefined,
        role: user.role || 'USER',
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
      });
    } else if (status === 'unauthenticated') {
      logout();
    }
  }, [session, status, login, logout, setInitialized]);

  return null;
}
