'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { useAvatarSync } from '@/hooks/use-avatar-sync';
import { cn } from '@/lib/utils';
import { apiClient } from '@/services/apiClient';
import { AuthService } from '@/services/authService';
import { useAuthActions } from '@/stores/auth-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavPersonalLinkProps {
  className?: string;
}

export function NavPersonalLink({ className }: NavPersonalLinkProps) {
  const { unreadCount, setUnreadCount } = useNotificationsStore();
  const { isAuthenticated, isInitialized, user } = useAuth();
  const { logout } = useAuthActions();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // 使用头像同步 hook
  const { currentAvatar, fetchLatestAvatar } = useAvatarSync(user?.avatar);

  // 重置头像错误状态
  useEffect(() => {
    setAvatarError(false);
  }, [currentAvatar, user?.avatar]);

  // 初始加载最新头像
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      fetchLatestAvatar();
    }
  }, [isAuthenticated, isInitialized, fetchLatestAvatar]);

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
        {/* 未登录状态的占位头像 */}
        <div className="h-8 w-8 rounded-full overflow-hidden border border-border/20 shadow-md">
          <div className="h-full w-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-semibold">
            <span className="select-none">用</span>
          </div>
        </div>
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
        <Button variant="outline-subtle" size="sm" disabled aria-disabled>
          退出登录
        </Button>
      </div>
    );
  }

  const handleLogout = () => {
    setConfirmOpen(true);
  };

  const confirmLogout = async () => {
    try {
      setPending(true);
      // 通知后端清理认证（HttpOnly Cookie）
      await AuthService.logout();
      // 退出 NextAuth 会话，避免状态不同步导致的循环请求
      await signOut({ redirect: false });
    } catch {
      // ignore
    } finally {
      // 本地清理并返回首页
      logout();
      setPending(false);
      setConfirmOpen(false);
      router.push('/');
    }
  };

  return (
    <div className={cn('relative flex items-center gap-4', className)}>
      <Link
        href="/me"
        className="relative flex items-center justify-center transition-opacity duration-200 hover:opacity-80"
      >
        <div className="relative">
          {/* 圆形头像 - 比其他按钮稍大 */}
          <div className="h-8 w-8 rounded-full overflow-hidden border border-border/20 shadow-md">
            {(currentAvatar || user?.avatar) && !avatarError ? (
              <Image
                src={currentAvatar || user?.avatar || ''}
                alt={user?.username || '用户头像'}
                width={32}
                height={32}
                className="h-full w-full object-cover bg-gray-100 dark:bg-gray-800"
                onError={() => setAvatarError(true)}
                unoptimized={true}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                <span className="select-none">
                  {(user?.username || user?.displayName || '用户')
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {/* 未读通知角标 */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white ring-2 ring-background">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </Link>
      {/* 登录和退出登录按钮 */}
      <div className="flex items-center gap-2 ml-2">
        <Link
          href="/auth/login"
          className="rounded-full px-3 py-1 text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
        >
          登录
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full px-3 py-1 text-sm text-muted-foreground transition-colors duration-200 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        >
          退出登录
        </button>
      </div>

      {/* 退出登录二次确认弹窗 */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          onClose={() => setConfirmOpen(false)}
          className="max-w-sm"
        >
          <DialogHeader>
            <DialogTitle>确认退出登录？</DialogTitle>
            <DialogDescription>退出后将返回首页。</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              variant="outline-subtle"
              onClick={() => setConfirmOpen(false)}
              disabled={pending}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmLogout}
              loading={pending}
            >
              是，退出
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
