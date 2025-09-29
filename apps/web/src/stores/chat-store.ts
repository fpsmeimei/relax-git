import { apiClient } from '@/services/apiClient';
import type { ChatMessage, ChatSummary } from '@/types/chat';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ChatState {
  chats: ChatSummary[];
  loadingChats: boolean;
  messages: Record<string, ChatMessage[]>; // chatId -> messages (升序)
  nextCursor: Record<string, string | null>;
  loadingMessages: Record<string, boolean>;
  currentChatId: string | null;

  loadChats: () => Promise<void>;
  loadMoreMessages: (chatId: string) => Promise<void>;
  prependMessages: (chatId: string, list: ChatMessage[]) => void;
  appendMessage: (chatId: string, msg: ChatMessage) => void;
  sendMessage: (chatId: string, content: string) => Promise<ChatMessage>;
  markRead: (chatId: string) => Promise<void>;
  setCurrentChat: (chatId: string | null) => void;
  updateOnNewMessage: (msg: ChatMessage, isSelf: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      chats: [],
      loadingChats: false,
      messages: {},
      nextCursor: {},
      loadingMessages: {},
      currentChatId: null,

      loadChats: async () => {
        set({ loadingChats: true });
        try {
          const res = await apiClient.get<ChatSummary[]>('/chats');
          set({ chats: res.data || [] });
        } catch (err) {
          // 静默处理聊天列表加载失败，避免在首页抛出未捕获异常
          console.debug('loadChats failed (silent):', err);
        } finally {
          set({ loadingChats: false });
        }
      },

      loadMoreMessages: async (chatId: string) => {
        const { nextCursor, loadingMessages } = get();
        if (loadingMessages[chatId]) return;
        const cursor = nextCursor[chatId] ?? undefined;
        set({ loadingMessages: { ...loadingMessages, [chatId]: true } });
        try {
          const res = await apiClient.get<{
            messages: ChatMessage[];
            nextCursor: string | null;
          }>(`/chats/${chatId}/messages`, { params: { cursor, limit: 20 } });
          const list = res.data?.messages || [];
          set(state => {
            const existed = state.messages[chatId] || [];
            // 服务器返回升序，这里前置拼接
            return {
              messages: { ...state.messages, [chatId]: [...list, ...existed] },
              nextCursor: {
                ...state.nextCursor,
                [chatId]: res.data?.nextCursor ?? null,
              },
            };
          });
        } finally {
          set(s => ({
            loadingMessages: { ...s.loadingMessages, [chatId]: false },
          }));
        }
      },

      prependMessages: (chatId, list) => {
        set(state => {
          const existed = state.messages[chatId] || [];
          return {
            messages: { ...state.messages, [chatId]: [...list, ...existed] },
          };
        });
      },

      appendMessage: (chatId, msg) => {
        set(state => {
          const existed = state.messages[chatId] || [];
          return {
            messages: { ...state.messages, [chatId]: [...existed, msg] },
          };
        });
      },

      sendMessage: async (chatId, content) => {
        const res = await apiClient.post<ChatMessage>(
          `/chats/${chatId}/messages`,
          { content }
        );
        // 不做本地追加，等待 WebSocket 的 chat:message:new 事件更新，避免重复
        return res.data as ChatMessage;
      },

      markRead: async (chatId: string) => {
        try {
          await apiClient.post(`/chats/${chatId}/read`);
          // 前端同步清零该会话未读
          set(state => ({
            chats: state.chats.map(c =>
              c.chatId === chatId ? { ...c, unreadCount: 0 } : c
            ),
          }));
        } catch {
          // ignore
        }
      },

      setCurrentChat: (chatId: string | null) => {
        set({ currentChatId: chatId });
      },

      updateOnNewMessage: (msg, isSelf) => {
        set(state => {
          const chatId = msg.chatId;
          const existsIdx = state.chats.findIndex(c => c.chatId === chatId);
          const nowLastMessage = {
            id: msg.id,
            content: msg.content,
            createdAt: msg.createdAt,
            senderId: msg.senderId,
          };
          const shouldIncUnread = !isSelf && state.currentChatId !== chatId;

          let nextChats: ChatSummary[];
          if (existsIdx >= 0) {
            const origin = state.chats[existsIdx]!;
            const updated: ChatSummary = {
              ...origin,
              lastMessage: nowLastMessage,
              updatedAt: msg.createdAt,
              unreadCount: shouldIncUnread
                ? (origin.unreadCount || 0) + 1
                : origin.unreadCount || 0,
            };
            // 置顶
            nextChats = [
              updated,
              ...state.chats.filter((_, i) => i !== existsIdx),
            ];
          } else {
            // 新会话占位（后续进入聊天页或刷新列表会补全成员/名称）
            const placeholder: ChatSummary = {
              chatId,
              type: 'DIRECT',
              name: null,
              members: [],
              lastMessage: nowLastMessage,
              unreadCount: shouldIncUnread ? 1 : 0,
              updatedAt: msg.createdAt,
            };
            nextChats = [placeholder, ...state.chats];
          }

          // 同步消息列表（若当前有缓存则追加）
          const existedMsgs = state.messages[chatId] || [];
          const appended =
            state.currentChatId === chatId
              ? [...existedMsgs, msg]
              : existedMsgs;

          return {
            chats: nextChats,
            messages: { ...state.messages, [chatId]: appended },
          };
        });
      },
    }),
    { name: 'chat-store' }
  )
);
