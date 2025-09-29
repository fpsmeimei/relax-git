'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useNotificationsStore } from '@/stores/notifications-store';
import { apiClient } from '@/services/apiClient';
import { useAuth, useAuthActions } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';

interface NavMeLinkProps {
  className?: string;
}

export function NavMeLink({ className }: NavMeLinkProps) {
  const { unreadCount, setUnreadCount } = useNotificationsStore();
  const { isAuthenticated } = useAuth();
  const { logout } = useAuthActions();
  const router = useRouter();

  useEffect(() => {
    let stopped = false;
    const load = async () => {
      try {
        if (!isAuthenticated) return;
        const res = await apiClient.get<{ count: number }>(
          `/notifications/unread-count`
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
  }, [isAuthenticated, setUnreadCount]);

  // 未登录：显示 登录 / 注册
  if (!isAuthenticated) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <Link
          href="/auth/login"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          登录
        </Link>
        <Link
          href="/auth/register"
          className="text-sm text-primary hover:underline"
        >
          注册
        </Link>
      </div>
    );
  }

  // 已登录（或免登录演示模式）：显示 我的（角标）/ 退出登录（演示模式隐藏退出）
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
        className={cn(
          'relative text-sm text-muted-foreground hover:text-foreground hover:underline'
        )}
      >
        我的
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-3 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-medium text-destructive-foreground">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
      >
        退出登录
      </button>
    </div>
  );
}
