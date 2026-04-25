'use client';

import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';
import { useNotificationsStore } from '@/stores/notifications-store';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  type ManagerOptions,
  type Socket as SocketIO,
  type SocketOptions,
  io,
} from 'socket.io-client';

interface SocketContextType {
  socket: SocketIO | null;
  isConnected: boolean;
  isConnecting: boolean;
  emit: (event: string, data?: unknown) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => () => void;
  once: (event: string, callback: (...args: unknown[]) => void) => void;
}

interface SocketProviderProps {
  children: React.ReactNode;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isConnecting: false,
  emit: () => {},
  on: () => () => {},
  once: () => {},
});

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<SocketIO | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { isAuthenticated, isInitialized } = useAuth();
  const { addNotification, incrementUnread } = useNotificationsStore();
  const { toast } = useToast();
  const pathname = usePathname();
  // 记录需要在重连后自动恢复的订阅频道
  const subscriptionsRef = useRef<
    Map<string, { event: string; payload?: any }>
  >(new Map());
  // 防抖防重入：刷新会话（WS 鉴权失败时仅尝试一次）
  const refreshingRef = useRef(false);

  // 根据事件与载荷生成去重Key
  const makeKey = (event: string, payload?: any) => {
    try {
      // 统一频道Key，便于 join/leave、subscribe/unsubscribe 成对清理
      if (event.includes('repository') && payload?.repositoryId) {
        return `repository|${String(payload.repositoryId)}`;
      }
      if (event.includes('timeline') && payload?.repositoryId) {
        return `timeline|${String(payload.repositoryId)}`;
      }
      if (event.includes('snapshot') && payload?.snapshotId) {
        return `snapshot|${String(payload.snapshotId)}`;
      }
      if (event.includes('chat') && (payload?.chatId || payload?.id)) {
        const cid = String(payload?.chatId ?? payload?.id);
        return `chat|${cid}`;
      }
      // 其他事件默认按完整JSON去重（尽量避免暴增）
      return `${event}|${JSON.stringify(payload ?? {})}`;
    } catch {
      return `${event}|_`;
    }
  };

  useEffect(() => {
    // 等待认证状态初始化完成
    if (!isInitialized) {
      return;
    }

    // 仅在用户已登录且不在 auth 页面时连接（避免登录页因重连导致的渲染抖动）
    const onAuthPage =
      typeof pathname === 'string' && pathname.startsWith('/auth');
    if (!isAuthenticated || onAuthPage) {
      if (socket) {
        try {
          socket.disconnect();
        } catch {}
        setSocket(null);
      }
      setIsConnected(false);
      setIsConnecting(false);
      // 清空订阅清单，避免跨账户重放订阅
      try {
        const subs = subscriptionsRef.current;
        if (subs && typeof subs.clear === 'function') subs.clear();
      } catch {}
      return;
    }

    setIsConnecting(true);

    // 创建 Socket.IO 连接（JWT 通过 HttpOnly Cookie 自动携带，无需明文 uid）
    const socketUrl = process.env['NEXT_PUBLIC_SOCKET_URL'];

    const opts: Partial<ManagerOptions & SocketOptions> = {
      withCredentials: true,
      transports: ['polling', 'websocket'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      path: socketUrl ? '/socket.io' : '/api/socket.io',
    };

    const socketInstance = socketUrl ? io(socketUrl, opts) : io('/', opts);

    // 刷新会话并重连
    const tryRefreshAndReconnect = async (reason?: unknown) => {
      if (refreshingRef.current) return;
      refreshingRef.current = true;
      try {
        // 使用认证专用代理（经 Next 重写到后端 /auth/refresh）
        await apiClient.post('/_auth/refresh');
        // 刷新成功后，触发重连
        setTimeout(() => {
          try {
            socketInstance.connect();
          } catch {}
        }, 200);
      } catch (e) {
        // 刷新失败：跳转登录
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login?reason=session_expired';
        }
      } finally {
        refreshingRef.current = false;
      }
    };

    // 连接事件监听
    const replaySubscriptions = () => {
      try {
        for (const { event, payload } of subscriptionsRef.current.values()) {
          socketInstance.emit(event, payload);
        }
      } catch {
        // ignore
      }
    };

    // 心跳检测定时器
    let heartbeatTimer: NodeJS.Timeout | null = null;

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
      // 重放订阅
      replaySubscriptions();

      // 启动心跳（每30秒ping一次）
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      heartbeatTimer = setInterval(() => {
        if (socketInstance.connected) {
          socketInstance.emit('ping');
        }
      }, 30000);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      setIsConnecting(false);

      // 清理心跳
      if (heartbeatTimer) clearInterval(heartbeatTimer);
    });

    socketInstance.on('connect_error', async error => {
      setIsConnecting(false);
      // 尝试静默刷新并重连（例如 access_token 过期）
      await tryRefreshAndReconnect(error);
    });

    socketInstance.on('reconnect', () => {
      setIsConnected(true);
      setIsConnecting(false);
      // 重放订阅
      replaySubscriptions();
      // 触发通知增量补拉事件
      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('RG_SOCKET_RECONNECTED', {
              detail: { timestamp: Date.now() },
            })
          );
        }
      } catch {}
    });

    // 通知：被回复等
    socketInstance.on('notification', (n: any) => {
      try {
        // 入库（本地 store）与未读 +1
        const normalized = {
          id: String(n?.id ?? ''),
          type: (n?.type ?? 'COMMENT_REPLY') as any,
          commentId: String(n?.commentId ?? ''),
          parentId: n?.parentId ?? undefined,
          snapshotId: n?.snapshotId ?? undefined,
          repoId: n?.repoId ?? undefined,
          content: String(n?.content ?? ''),
          // 便于前端深链定位
          filePath: n?.filePath ?? undefined,
          lineStart: n?.lineStart ?? undefined,
          lineEnd: n?.lineEnd ?? undefined,
          commitSha: n?.commitSha ?? undefined,
          ...(n?.actor
            ? {
                actor: {
                  id: String(n.actor.id ?? ''),
                  username: String(n.actor.username ?? ''),
                  ...(n.actor.avatar ? { avatar: String(n.actor.avatar) } : {}),
                },
              }
            : {}),
          createdAt: String(n?.createdAt ?? new Date().toISOString()),
        };
        addNotification(normalized as any);
        incrementUnread(1);

        // 广播给前端组件（如通知抽屉）用于实时插入而不打断阅读
        try {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('RG_NOTIFICATION_ARRIVED', {
                detail: { n: { ...normalized, isRead: false } },
              })
            );
          }
        } catch {}

        // toast 提醒：格式 "{actor}: {content}"
        const actorName = n?.actor?.username ?? '有人';
        const contentText = String(n?.content ?? '有新的回复');
        toast({ title: `${actorName}`, description: contentText } as any);
      } catch (e) {
        // ignore
      }
    });

    // 认证事件监听
    socketInstance.on('auth:success', () => {});

    socketInstance.on('auth:error', async error => {
      // 优先尝试刷新并重连，避免直接断开导致长期无实时能力
      await tryRefreshAndReconnect(error);
    });

    socketInstance.on('error', () => {});

    setSocket(socketInstance);

    // 清理函数
    const currentSubs = subscriptionsRef.current;
    return () => {
      try {
        socketInstance.disconnect();
      } catch {}
      // 清空订阅清单，避免下次登录重放
      try {
        if (currentSubs && typeof currentSubs.clear === 'function')
          currentSubs.clear();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, pathname]);

  // 监听全局登出事件：清空订阅并断开连接，防抖本地状态
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleLogout = () => {
      try {
        const subs = subscriptionsRef.current;
        if (subs && typeof subs.clear === 'function') subs.clear();
      } catch {}
      try {
        if (socket) {
          socket.disconnect();
        }
      } catch {}
      setSocket(null);
      setIsConnected(false);
      setIsConnecting(false);
    };
    window.addEventListener('RG_LOGOUT', handleLogout);
    return () => {
      window.removeEventListener('RG_LOGOUT', handleLogout);
    };
  }, [socket]);

  // 提供的方法
  const emit = (event: string, data?: unknown) => {
    // 追踪需要恢复的订阅类事件
    try {
      const key = makeKey(event, data);
      if (
        event === 'join:repository' ||
        event === 'subscribe:timeline' ||
        event === 'join:snapshot' ||
        event === 'join:chat'
      ) {
        subscriptionsRef.current.set(key, { event, payload: data });
      } else if (
        event === 'leave:repository' ||
        event === 'unsubscribe:timeline' ||
        event === 'leave:snapshot' ||
        event === 'leave:chat'
      ) {
        subscriptionsRef.current.delete(key);
      }
    } catch {
      // ignore
    }

    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  const on = (event: string, callback: (...args: unknown[]) => void) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
    return () => {};
  };

  const once = (event: string, callback: (...args: unknown[]) => void) => {
    if (socket) {
      socket.once(event, callback);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    isConnecting,
    emit,
    on,
    once,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
