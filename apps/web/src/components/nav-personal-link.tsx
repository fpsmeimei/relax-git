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
      <div className={cn('flex items-center gap-4', className)}>
        {/* 未登录状态的优雅头像 */}
        <div className="h-10 w-10 rounded-full overflow-hidden border border-border/30 shadow-sm bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center">
          <svg
            className="h-5 w-5 text-muted-foreground/70"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <Link
          href="/auth/login"
          className="rounded-full px-5 py-2 text-base font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
        >
          登录
        </Link>
        <Link
          href="/auth/register"
          className="rounded-full px-5 py-2 text-base font-medium text-primary transition-colors duration-200 hover:bg-primary/10"
        >
          注册
        </Link>
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
    <div className={cn('relative flex items-center gap-5', className)}>
      <Link
        href="/me"
        className="relative flex items-center justify-center transition-opacity duration-200 hover:opacity-80"
      >
        <div className="relative">
          {/* 圆形头像 - 比其他按钮稍大 */}
          <div className="h-10 w-10 rounded-full overflow-hidden border border-border/20 shadow-md">
            {(currentAvatar || user?.avatar) && !avatarError ? (
              <Image
                src={currentAvatar || user?.avatar || ''}
                alt={user?.username || '用户头像'}
                width={40}
                height={40}
                className="h-full w-full object-cover bg-gray-100 dark:bg-gray-800"
                onError={() => setAvatarError(true)}
                unoptimized={true}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-base font-semibold">
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
            <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-medium text-white ring-2 ring-background">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </Link>
      {/* 登录和退出登录按钮 */}
      <div className="flex items-center gap-3 ml-2">
        <Link
          href="/auth/login"
          className="rounded-full px-5 py-2 text-base font-medium text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
        >
          登录
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full px-5 py-2 text-base font-medium text-muted-foreground transition-colors duration-200 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
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
