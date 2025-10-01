'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import { SocketProvider } from './socket-provider';
import { AuthSync } from './auth-sync';
import { usePathname } from 'next/navigation';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const pathname = usePathname();
  const onAuthPage = typeof pathname === 'string' && pathname.startsWith('/auth');
  // 创建 QueryClient 实例
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5 分钟缓存时间
            staleTime: 5 * 60 * 1000,
            // 10 分钟垃圾回收时间
            gcTime: 10 * 60 * 1000,
            // 重试配置
            retry: (failureCount, error: unknown) => {
              // 4xx 错误不重试
              const errorStatus = (error as { status?: number })?.status;
              if (errorStatus && errorStatus >= 400 && errorStatus < 500) {
                return false;
              }
              // 最多重试 3 次
              return failureCount < 3;
            },
            // 重试延迟
            retryDelay: attemptIndex =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
            // 窗口聚焦时重新获取
            refetchOnWindowFocus: false,
            // 网络重连时重新获取
            refetchOnReconnect: true,
          },
          mutations: {
            // 变更重试配置
            retry: (failureCount, error: unknown) => {
              // 4xx 错误不重试
              const errorStatus = (error as { status?: number })?.status;
              if (errorStatus && errorStatus >= 400 && errorStatus < 500) {
                return false;
              }
              // 最多重试 2 次
              return failureCount < 2;
            },
          },
        },
      })
  );

  return (
    <SessionProvider>
      <AuthSync />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="quiet-light"
          themes={['quiet-light', 'nord']}
          enableSystem={false}
          disableTransitionOnChange
        >
          {onAuthPage ? children : <SocketProvider>{children}</SocketProvider>}
        </ThemeProvider>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools
            initialIsOpen={false}
            buttonPosition="bottom-right"
          />
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}
