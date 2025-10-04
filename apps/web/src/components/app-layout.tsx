'use client';

import { NavChatLink } from '@/components/layout/nav-chat-link';
import { NavPersonalLink } from '@/components/nav-personal-link';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

interface AppLayoutProps {
  children: React.ReactNode;
}

// 不需要显示导航栏的路径（认证页面有自己的布局）
const NO_NAV_PATHS = ['/auth'];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

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
            {/* 导航：未登录点击跳登录 */}
            <Link
              href={
                isAuthenticated
                  ? '/community'
                  : '/auth/login?callbackUrl=%2Fcommunity'
              }
              className="text-sm text-muted-foreground hover:text-foreground rounded-full px-3 py-1 transition-colors duration-200 hover:bg-accent"
            >
              社区
            </Link>
            <Link
              href={
                isAuthenticated
                  ? '/repositories/import'
                  : '/auth/login?callbackUrl=%2Frepositories%2Fimport'
              }
              className="text-sm text-muted-foreground hover:text-foreground rounded-full px-3 py-1 transition-colors duration-200 hover:bg-accent"
            >
              导入仓库
            </Link>
            <Link
              href={
                isAuthenticated
                  ? '/repositories'
                  : '/auth/login?callbackUrl=%2Frepositories'
              }
              className="text-sm text-muted-foreground hover:text-foreground rounded-full px-3 py-1 transition-colors duration-200 hover:bg-accent"
            >
              我的仓库
            </Link>
            {isAuthenticated && <NavChatLink />}
            <ThemeToggle />
            {/* 个人/登录/退出登录 统一由 NavPersonalLink 处理 */}
            <NavPersonalLink />
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
