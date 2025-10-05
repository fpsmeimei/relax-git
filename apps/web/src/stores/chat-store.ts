import { apiClient } from '@/services/apiClient';
import type { ChatMessage, ChatSummary } from '@/types/chat';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 辅助函数：确保消息数组唯一性
const deduplicateMessages = (messages: ChatMessage[]): ChatMessage[] => {
  const seen = new Set<string>();
  return messages.filter(msg => {
    if (seen.has(msg.id)) {
      return false;
    }
    seen.add(msg.id);
    return true;
  });
};

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
  clearMessages: (chatId: string) => Promise<void>;
  reset: () => void;
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
          const data = res.data || [];
          const list = Array.isArray(data) ? data : [];
          set({ chats: list, loadingChats: false });
        } catch (error) {
          console.error('[chat-store] 加载聊天列表失败:', error);
          set({ chats: [], loadingChats: false });
        }
      },

      loadMoreMessages: async (chatId: string) => {
        const { nextCursor, loadingMessages } = get();
        if (loadingMessages[chatId]) return;
        const cursor = nextCursor[chatId] ?? undefined;
        console.log('[chat-store] 加载历史消息:', { chatId, cursor });
        set({ loadingMessages: { ...loadingMessages, [chatId]: true } });
        try {
          const res = await apiClient.get<{
            messages: ChatMessage[];
            nextCursor: string | null;
          }>(`/chats/${chatId}/messages`, { params: { cursor, limit: 20 } });
          const list = res.data?.messages || [];
          console.log('[chat-store] 加载到历史消息:', list.length, '条');
          set(state => {
            const existed = state.messages[chatId] || [];
            // 过滤重复消息，避免历史消息重复加载
            const filteredList = list.filter(
              newMsg => !existed.some(existMsg => existMsg.id === newMsg.id)
            );
            // 服务器返回升序，这里前置拼接并去重
            const combined = [...filteredList, ...existed];
            return {
              messages: {
                ...state.messages,
                [chatId]: deduplicateMessages(combined),
              },
              nextCursor: {
                ...state.nextCursor,
                [chatId]: res.data?.nextCursor ?? null,
              },
            };
          });
        } catch (error) {
          console.error('[chat-store] 加载历史消息失败:', error);
        } finally {
          set(s => ({
            loadingMessages: { ...s.loadingMessages, [chatId]: false },
          }));
        }
      },

      prependMessages: (chatId, list) => {
        set(state => {
          const existed = state.messages[chatId] || [];
          // 过滤重复消息
          const filteredList = list.filter(
            newMsg => !existed.some(existMsg => existMsg.id === newMsg.id)
          );
          const combined = [...filteredList, ...existed];
          return {
            messages: {
              ...state.messages,
              [chatId]: deduplicateMessages(combined),
            },
          };
        });
      },

      appendMessage: (chatId, msg) => {
        set(state => {
          const existed = state.messages[chatId] || [];
          // 检查消息是否已存在，避免重复添加
          if (existed.some(existMsg => existMsg.id === msg.id)) {
            return state; // 消息已存在，不做任何改变
          }
          return {
            messages: { ...state.messages, [chatId]: [...existed, msg] },
          };
        });
      },

      sendMessage: async (chatId, content) => {
        console.log('[chat-store] 发送消息:', { chatId, content });
        try {
          const res = await apiClient.post<ChatMessage>(
            `/chats/${chatId}/messages`,
            { content }
          );
          console.log('[chat-store] 消息发送成功:', res.data);
          // 不做本地追加，等待 WebSocket 的 chat:message:new 事件更新，避免重复
          return res.data as ChatMessage;
        } catch (error) {
          console.error('[chat-store] 消息发送失败:', error);
          throw error;
        }
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
          // 简化逻辑：只要不是自己发送的消息就增加未读数，依赖用户主动标记已读来清除
          const shouldIncUnread = !isSelf;

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

          // 同步消息列表（若当前有缓存则追加，避免重复）
          const existedMsgs = state.messages[chatId] || [];
          const appended =
            state.currentChatId === chatId
              ? existedMsgs.some(m => m.id === msg.id)
                ? existedMsgs // 消息已存在，不重复添加
                : [...existedMsgs, msg] // 新消息，追加到末尾
              : existedMsgs;

          return {
            chats: nextChats,
            messages: { ...state.messages, [chatId]: appended },
          };
        });
      },

      clearMessages: async (chatId: string) => {
        console.log('[chat-store] 清空消息:', chatId);
        try {
          await apiClient.delete(`/chats/${chatId}/messages`);
          console.log('[chat-store] 消息清空成功');
          // 重新加载消息列表，因为只删除了自己的消息，对方消息仍然存在
          set(state => ({
            messages: { ...state.messages, [chatId]: [] },
            nextCursor: { ...state.nextCursor, [chatId]: null },
          }));
          // 重新加载该聊天的消息
          const { loadMoreMessages } = get();
          await loadMoreMessages(chatId);
        } catch (error) {
          console.error('[chat-store] 清空消息失败:', error);
          throw error;
        }
      },

      reset: () => {
        console.log('[chat-store] 重置聊天状态');
        set({
          chats: [],
          loadingChats: false,
          messages: {},
          nextCursor: {},
          loadingMessages: {},
          currentChatId: null,
        });
      },
    }),
    { name: 'chat-store' }
  )
);
