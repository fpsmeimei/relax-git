import { ConnectionStatus } from '@/components/connection-status';
import { ErrorBoundary } from '@/components/error-boundary';
import { NetworkStatus } from '@/components/network-status';
import { PageLockButton } from '@/components/page-lock-button';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { AppLayout } from '@/components/app-layout';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
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
        <ErrorBoundary>
          <Providers>
            <NetworkStatus />
            <AppLayout>
              {children}
              <ConnectionStatus />
              <Toaster />
              <PageLockButton />
            </AppLayout>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
