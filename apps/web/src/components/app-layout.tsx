'use client';

import { NavChatLink } from '@/components/layout/nav-chat-link';
import { NavPersonalLink } from '@/components/nav-personal-link';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
      <header className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container-responsive flex h-20 items-center justify-between">
          <Link
            href={
              isAuthenticated
                ? '/community'
                : '/auth/login?callbackUrl=%2Fcommunity'
            }
            className="inline-flex items-center px-6 py-3 text-lg font-bold text-foreground bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl shadow-sm hover:shadow-md hover:from-primary/15 hover:to-primary/10 hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
          >
            社区
          </Link>
          {/* 导航容器 - 支持水平滚动 */}
          <nav className="flex items-center overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-max px-2 sm:px-0">
              {/* 导航：未登录点击跳登录 */}
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-foreground rounded-full px-3 lg:px-5 py-2 transition-colors duration-200 hover:bg-accent font-medium whitespace-nowrap"
              >
                Relax-Git
              </Link>
              <Link
                href={
                  isAuthenticated
                    ? '/repositories/import'
                    : '/auth/login?callbackUrl=%2Frepositories%2Fimport'
                }
                className="text-sm text-muted-foreground hover:text-foreground rounded-full px-3 lg:px-5 py-2 transition-colors duration-200 hover:bg-accent font-medium whitespace-nowrap"
              >
                导入仓库
              </Link>
              <Link
                href={
                  isAuthenticated
                    ? '/repositories'
                    : '/auth/login?callbackUrl=%2Frepositories'
                }
                className="text-sm lg:text-base text-muted-foreground hover:text-foreground rounded-full px-3 lg:px-5 py-2 transition-colors duration-200 hover:bg-accent font-medium whitespace-nowrap"
              >
                我的仓库
              </Link>
              {isAuthenticated && <NavChatLink />}
              <Link
                href={
                  isAuthenticated
                    ? '/chatroom'
                    : '/auth/login?callbackUrl=%2Fchatroom'
                }
                className="text-sm lg:text-base text-muted-foreground hover:text-foreground rounded-full px-3 lg:px-5 py-2 transition-colors duration-200 hover:bg-accent font-medium whitespace-nowrap"
              >
                🎬 电影
              </Link>
              <ThemeToggle />
              {/* 个人/登录/退出登录 统一由 NavPersonalLink 处理 */}
              <NavPersonalLink />
            </div>
          </nav>
        </div>
      </header>
      <div className="flex-1 bg-background">{children}</div>
    </div>
  );
}
