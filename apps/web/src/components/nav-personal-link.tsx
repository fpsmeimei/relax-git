'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useNotificationsStore } from '@/stores/notifications-store';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/hooks/use-auth';
import { useAuthActions } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

interface NavPersonalLinkProps {
  className?: string;
}

export function NavPersonalLink({ className }: NavPersonalLinkProps) {
  const { unreadCount, setUnreadCount } = useNotificationsStore();
  const { isAuthenticated, isInitialized } = useAuth();
  const { logout } = useAuthActions();
  const router = useRouter();

  useEffect(() => {
    let stopped = false;
    const load = async () => {
      try {
        if (!isAuthenticated || !isInitialized) return;
        const res = await apiClient.get<{ count: number }>(
          '/notifications/unread-count'
        );
        if (!stopped) setUnreadCount(res.data?.count ?? 0);
      } catch {
        // ignore
      }
    };
    void load();
    const timer = setInterval(load, 30_000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [isAuthenticated, isInitialized, setUnreadCount]);

  if (!isAuthenticated) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <Link
          href="/auth/login"
          className="rounded-full px-3 py-1 text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
        >
          登录
        </Link>
        <Link
          href="/auth/register"
          className="rounded-full px-3 py-1 text-sm text-primary transition-colors duration-200 hover:bg-primary/10"
        >
          注册
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    try {
      logout();
      router.push('/auth/login');
    } catch {
      // ignore
    }
  };

  return (
    <div className={cn('relative flex items-center gap-3', className)}>
      <Link
        href="/me"
        className="relative rounded-full px-3 py-1 text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
      >
        个人
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-3 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-medium text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-full px-3 py-1 text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
      >
        退出登录
      </button>
    </div>
  );
}
