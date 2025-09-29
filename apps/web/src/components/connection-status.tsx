'use client';

import { cn } from '@/lib/utils';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from './socket-provider';

export function ConnectionStatus() {
  const { isConnected, isConnecting } = useSocket();

  // 如果已连接且不在连接中，不显示状态指示器
  if (isConnected && !isConnecting) {
    return null;
  }

  return (
    <div className="connection-status">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shadow-lg border',
          'bg-background/95 backdrop-blur-sm',
          {
            'text-success border-success/30': isConnected,
            'text-warning border-warning/30': isConnecting,
            'text-destructive border-destructive/30':
              !isConnected && !isConnecting,
          }
        )}
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>连接中...</span>
          </>
        ) : isConnected ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>已连接</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>连接断开</span>
          </>
        )}
      </div>
    </div>
  );
}
