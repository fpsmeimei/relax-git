'use client';

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
  const { isAuthenticated, user } = useAuth();

  // 认证页面不显示导航栏（它们有自己的 layout）
  const shouldShowNav = !NO_NAV_PATHS.some(path => pathname.startsWith(path));

  if (!shouldShowNav) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container-responsive flex h-16 items-center justify-between gap-4">
          <Link
            href={
              isAuthenticated ? '/community' : '/auth/login?callbackUrl=%2F'
            }
            className="inline-flex items-center px-4 py-2 text-base font-bold text-foreground bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl shadow-sm hover:shadow-md hover:from-primary/15 hover:to-primary/10 hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
          >
            Relax-Git
          </Link>
          {/* 导航容器 - 支持水平滚动 */}
          <nav className="flex items-center overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-max px-1 sm:px-0">
              <Link
                href={isAuthenticated ? '/community' : '/'}
                className="text-sm text-muted-foreground hover:text-foreground rounded-full px-2.5 lg:px-4 py-1.5 transition-colors duration-200 hover:bg-accent font-medium whitespace-nowrap"
              >
                社区
              </Link>
              <Link
                href={
                  isAuthenticated
                    ? '/repositories/import'
                    : '/auth/login?callbackUrl=%2Frepositories%2Fimport'
                }
                className="text-sm text-muted-foreground hover:text-foreground rounded-full px-2.5 lg:px-4 py-1.5 transition-colors duration-200 hover:bg-accent font-medium whitespace-nowrap"
              >
                导入仓库
              </Link>
              <Link
                href={
                  isAuthenticated
                    ? '/repositories'
                    : '/auth/login?callbackUrl=%2Frepositories'
                }
                className="text-sm text-muted-foreground hover:text-foreground rounded-full px-2.5 lg:px-4 py-1.5 transition-colors duration-200 hover:bg-accent font-medium whitespace-nowrap"
              >
                我的仓库
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  href="/console"
                  className="text-sm rounded-full px-2.5 lg:px-4 py-1.5 transition-colors duration-200 font-medium whitespace-nowrap border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/30"
                >
                  控制台
                </Link>
              )}
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
