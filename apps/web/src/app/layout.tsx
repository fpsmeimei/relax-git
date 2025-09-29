import { ConnectionStatus } from '@/components/connection-status';
import { NavMessagesLink } from '@/components/nav-messages-link';
import { NavPersonalLink } from '@/components/nav-personal-link';
import { Providers } from '@/components/providers';
import { ThemeToggle } from '@/components/theme-toggle';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import 'prismjs/themes/prism.css';
import './globals.css';

// 字体配置
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// 元数据配置
export const metadata: Metadata = {
  title: {
    default: 'Relax-Git',
    template: '%s | Relax-Git',
  },
  description:
    '基于 Git worktree 的现代化协作平台，提供实时协作、快照管理和智能代码评论功能',
  keywords: ['Git', 'worktree', '协作', '代码评论', '快照', '版本控制'],
  authors: [{ name: 'Relax-Git Team' }],
  creator: 'Relax-Git Team',
  publisher: 'Relax-Git',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: '/',
    title: 'Relax-Git',
    description: '基于 Git worktree 的现代化协作平台',
    siteName: 'Relax-Git',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Relax-Git',
    description: '基于 Git worktree 的现代化协作平台',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// 视口配置
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable,
          jetbrainsMono.variable
        )}
      >
        <Providers>
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
                  <ThemeToggle />
                </nav>
              </div>
            </header>
            <div className="flex-1">{children}</div>
          </div>
          <ConnectionStatus />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
