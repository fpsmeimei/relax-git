'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

/**
 * React Query 配置
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 数据保持新鲜的时间（5分钟）
        staleTime: 5 * 60 * 1000,
        // 缓存时间（10分钟）
        gcTime: 10 * 60 * 1000,
        // 失败后重试1次
        retry: 1,
        // 窗口重新获得焦点时不自动刷新
        refetchOnWindowFocus: false,
      },
      mutations: {
        // 错误重试
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: 每次创建新的
    return makeQueryClient();
  } else {
    // Browser: 复用实例
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  // 使用 useState 避免重复创建
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 开发工具（仅开发环境） */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
