'use client';

import { NavMessagesLink } from '@/components/nav-messages-link';
import { NavPersonalLink } from '@/components/nav-personal-link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

// 不需要显示导航栏的路径（认证页面有自己的布局）
const NO_NAV_PATHS = ['/auth'];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  // 认证页面不显示导航栏（它们有自己的 layout）
  const shouldShowNav = !NO_NAV_PATHS.some(path => pathname.startsWith(path));

  if (!shouldShowNav) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container-responsive flex h-14 items-center justify-between">
          <Link href="/" className="text-sm font-semibold">
            Relax-Git
          </Link>
          <nav className="flex items-center gap-5">
            <Link
              href="/community"
              className="text-sm text-muted-foreground hover:text-foreground rounded-full px-3 py-1 transition-colors duration-200 hover:bg-accent"
            >
              社区
            </Link>
            
            {/* 🔥 已登录用户显示完整功能 */}
            {isAuthenticated && (
              <>
                <Link
                  href="/repositories/import"
                  className="text-sm text-muted-foreground hover:text-foreground rounded-full px-3 py-1 transition-colors duration-200 hover:bg-accent"
                >
                  导入仓库
                </Link>
                <Link
                  href="/repositories"
                  className="text-sm text-muted-foreground hover:text-foreground rounded-full px-3 py-1 transition-colors duration-200 hover:bg-accent"
                >
                  我的仓库
                </Link>
                <NavMessagesLink />
                <NavPersonalLink />
              </>
            )}
            
            {/* 🔥 未登录用户显示登录/注册按钮 */}
            {!isAuthenticated && (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">登录</Link>
                </Button>
                <Button asChild variant="default" size="sm">
                  <Link href="/auth/register">注册</Link>
                </Button>
              </>
            )}
            
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
