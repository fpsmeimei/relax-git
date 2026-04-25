'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    // 初始化状态
    setIsOnline(navigator.onLine);

    // 监听网络状态变化
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!wasOffline) {
      return;
    }

    const timer = window.setTimeout(() => setWasOffline(false), 3000);
    return () => window.clearTimeout(timer);
  }, [wasOffline]);

  // 不在线时显示警告横幅
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground">
        <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <WifiOff className="h-4 w-4" />
          <span>网络连接已断开，请检查您的网络设置</span>
        </div>
      </div>
    );
  }

  // 刚恢复网络时显示提示（3秒后消失）
  if (wasOffline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white">
        <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <Wifi className="h-4 w-4" />
          <span>网络已恢复</span>
        </div>
      </div>
    );
  }

  return null;
}
