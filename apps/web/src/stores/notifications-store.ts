import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type NotificationType =
  | 'COMMENT_REPLY'
  | 'MENTION'
  | 'JOIN_REQUEST_APPROVED'
  | 'JOIN_REQUEST_REJECTED';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  commentId?: string | null;
  parentId?: string | null;
  snapshotId?: string | null;
  repoId?: string | null;
  content?: string | null;
  actor?: { id: string; username: string; avatar?: string };
  createdAt?: string;
}

interface NotificationsState {
  unreadCount: number;
  items: NotificationItem[];
  setUnreadCount: (n: number) => void;
  incrementUnread: (delta?: number) => void;
  addNotification: (n: NotificationItem) => void;
  clear: () => void;
  // P1-2 多标签页同步
  syncUnreadCount: (n: number) => void;
  reset: () => void;
}

// P1-2 多标签页同步：使用 BroadcastChannel 跨标签页通信
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('rg-notifications-sync');
  } catch {
    // 在不支持的环境中忽略
  }
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      unreadCount: 0,
      items: [],
      setUnreadCount: n => {
        const newCount = Math.max(0, n | 0);
        set({ unreadCount: newCount });
        // P1-2 同步到其他标签页
        if (broadcastChannel) {
          try {
            broadcastChannel.postMessage({
              type: 'UNREAD_COUNT_CHANGED',
              count: newCount,
            });
          } catch {}
        }
      },
      incrementUnread: (delta = 1) => {
        const newCount = Math.max(0, get().unreadCount + delta);
        set({ unreadCount: newCount });
        // P1-2 同步到其他标签页
        if (broadcastChannel) {
          try {
            broadcastChannel.postMessage({
              type: 'UNREAD_COUNT_CHANGED',
              count: newCount,
            });
          } catch {}
        }
      },
      addNotification: n => set({ items: [n, ...get().items].slice(0, 100) }),
      clear: () => {
        set({ items: [], unreadCount: 0 });
        // P1-2 同步到其他标签页
        if (broadcastChannel) {
          try {
            broadcastChannel.postMessage({
              type: 'UNREAD_COUNT_CHANGED',
              count: 0,
            });
          } catch {}
        }
      },
      // P1-2 接收其他标签页的同步数据（不再广播，避免循环）
      syncUnreadCount: n => set({ unreadCount: Math.max(0, n | 0) }),

      // 重置通知状态（用于用户切换）
      reset: () => {
        set({ unreadCount: 0, items: [] });
        // 同步到其他标签页
        if (broadcastChannel) {
          try {
            broadcastChannel.postMessage({
              type: 'UNREAD_COUNT_CHANGED',
              count: 0,
            });
          } catch {}
        }
      },
    }),
    {
      name: 'notifications-store',
      storage: createJSONStorage(() => localStorage),
      partialize: s => ({ unreadCount: s.unreadCount }),
    }
  )
);

// P1-2 监听其他标签页的同步消息
if (broadcastChannel) {
  broadcastChannel.addEventListener('message', event => {
    try {
      const { type, count } = event.data;
      if (type === 'UNREAD_COUNT_CHANGED' && typeof count === 'number') {
        // 使用 syncUnreadCount 避免再次广播
        useNotificationsStore.getState().syncUnreadCount(count);
      }
    } catch {}
  });
}
