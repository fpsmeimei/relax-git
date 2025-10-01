'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useNotificationsStore } from '@/stores/notifications-store';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/hooks/use-auth';
import { useAuthActions } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { AuthService } from '@/services/authService';
import { signOut } from 'next-auth/react';

interface NavPersonalLinkProps {
  className?: string;
}

export function NavPersonalLink({ className }: NavPersonalLinkProps) {
  const { unreadCount, setUnreadCount } = useNotificationsStore();
  const { isAuthenticated, isInitialized } = useAuth();
  const { logout } = useAuthActions();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

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
      {/* 需求：在“退出登录”左侧增加“登录”按钮 */}
      <Link
        href="/auth/login"
        className="rounded-full px-3 py-1 text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
      >
        登录
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-full px-3 py-1 text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
      >
        退出登录
      </button>

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
