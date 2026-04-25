import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* 简化的顶部栏 - 只显示 Logo 和主题切换 */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container-responsive flex h-14 items-center justify-between">
          <Link href="/" className="text-sm font-semibold">
            Relax-Git
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* 认证页面内容 */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
