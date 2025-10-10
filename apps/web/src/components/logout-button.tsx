'use client';

import { Button } from '@/components/ui/button';
import { AuthService } from '@/services/authService';
import { useAuthActions } from '@/stores/auth-store';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface LogoutButtonProps {
  variant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'secondary'
    | 'outline-subtle'
    | 'soft';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function LogoutButton({
  variant = 'outline-subtle',
  size = 'sm',
  className,
}: LogoutButtonProps) {
  const { logout } = useAuthActions();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

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
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={handleLogout}
        className={className}
      >
        退出登录
      </Button>

      {/* 退出登录二次确认弹窗 - 相对定位 */}
      {confirmOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setConfirmOpen(false)}
          />
          {/* 弹窗内容 - 定位在按钮右下方 */}
          <div className="absolute top-full right-0 mt-2 z-50 w-80 bg-background border border-border rounded-lg shadow-lg p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">确认退出登录？</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  退出后将返回首页。
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline-subtle"
                  onClick={() => setConfirmOpen(false)}
                  disabled={pending}
                  size="sm"
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmLogout}
                  loading={pending}
                  size="sm"
                >
                  是，退出
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
