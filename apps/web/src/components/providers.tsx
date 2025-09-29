'use client';

import { useAuth } from '@/stores/auth-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthProvider } from './auth-provider';
import { SocketProvider } from './socket-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
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

  // 全局登录策略：
  // - 允许公共页面无需登录（如首页 `/`）
  // - 仅在访问受保护页面时，未登录则跳转到登录页
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  // 暂停全局自动登录重定向；改由各受保护页面自行在 useEffect 中检查并跳转到 /auth/login。
  // 这样可避免首页或其它公开页出现误判导致的刷新/跳转循环。
  useEffect(() => {
    // no-op
  }, [pathname, isAuthenticated, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="quiet-light"
        themes={['quiet-light', 'nord']}
        enableSystem={false}
        disableTransitionOnChange
      >
        <AuthProvider>
          <SocketProvider>{children}</SocketProvider>
        </AuthProvider>
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
