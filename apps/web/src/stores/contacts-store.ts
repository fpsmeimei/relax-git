import { apiClient } from '@/services/apiClient';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface FriendSearchResult {
  id: string;
  username: string;
  avatar?: string | null;
  status: 'friend' | 'pendingOutgoing' | 'pendingIncoming' | 'none';
}

export interface FriendItem {
  id: string;
  username: string;
  avatar?: string | null;
  isOnline?: boolean;
  lastSeenAt?: string | null;
  chatId: string | null;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    type: string;
    isRead: boolean;
    readAt: string | null;
  } | null;
  unreadCount: number;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message?: string | null;
  createdAt: string;
  updatedAt: string;
  fromUser?: {
    id: string;
    username: string;
    avatar?: string | null;
  };
  toUser?: {
    id: string;
    username: string;
    avatar?: string | null;
  };
}

interface ContactsState {
  // 搜索用户
  searchResults: FriendSearchResult[];
  searchLoading: boolean;
  searchKeyword: string;

  // 好友列表
  friends: FriendItem[];
  friendsLoading: boolean;

  // 好友申请
  incomingRequests: FriendRequest[];
  outgoingRequests: FriendRequest[];
  requestsLoading: boolean;
  unreadRequestCount: number;

  // Actions
  searchUsers: (keyword: string) => Promise<void>;
  clearSearchResults: () => void;

  loadFriends: () => Promise<void>;
  loadFriendRequests: (
    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ALL'
  ) => Promise<void>;

  sendFriendRequest: (toUserId: string, message?: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;

  updateUnreadRequestCount: (count: number) => void;
  addIncomingRequest: (request: FriendRequest) => void;
  updateRequestStatus: (
    requestId: string,
    status: 'ACCEPTED' | 'REJECTED'
  ) => void;
  reset: () => void;
}

export const useContactsStore = create<ContactsState>()(
  devtools(
    (set, get) => ({
      searchResults: [],
      searchLoading: false,
      searchKeyword: '',

      friends: [],
      friendsLoading: false,

      incomingRequests: [],
      outgoingRequests: [],
      requestsLoading: false,
      unreadRequestCount: 0,

      searchUsers: async (keyword: string) => {
        const trimmed = keyword.trim();
        set({ searchKeyword: trimmed });

        if (!trimmed) {
          set({ searchResults: [] });
          return;
        }

        set({ searchLoading: true });
        try {
          const res = await apiClient.get<FriendSearchResult[]>(
            '/chat/friends/search',
            {
              params: { keyword: trimmed },
            }
          );
          set({ searchResults: res.data || [] });
        } catch {
          set({ searchResults: [] });
        } finally {
          set({ searchLoading: false });
        }
      },
      clearSearchResults: () => {
        set({ searchResults: [], searchKeyword: '' });
      },

      loadFriends: async () => {
        set({ friendsLoading: true });
        try {
          const res = await apiClient.get<FriendItem[]>('/chat/friends');
          const friends = res.data || [];

          // 同时获取好友在线状态
          try {
            const statusRes = await apiClient.get<
              Array<{
                id: string;
                username: string;
                isOnline: boolean;
                lastSeenAt: string | null;
              }>
            >('/users/online-status/friends');

            const statusMap = new Map(
              statusRes.data?.map(s => [s.id, s]) || []
            );

            const friendsWithStatus = friends.map(friend => ({
              ...friend,
              isOnline: statusMap.get(friend.id)?.isOnline || false,
              lastSeenAt: statusMap.get(friend.id)?.lastSeenAt || null,
            }));

            set({ friends: friendsWithStatus });
          } catch {
            set({ friends });
          }
        } catch {
          set({ friends: [] });
        } finally {
          set({ friendsLoading: false });
        }
      },

      loadFriendRequests: async (status = 'PENDING') => {
        set({ requestsLoading: true });
        try {
          const res = await apiClient.get<{
            incoming: FriendRequest[];
            outgoing: FriendRequest[];
          }>('/chat/friends/requests', { params: { status } });

          set({
            incomingRequests: res.data?.incoming || [],
            outgoingRequests: res.data?.outgoing || [],
            unreadRequestCount:
              status === 'PENDING'
                ? (res.data?.incoming || []).length
                : get().unreadRequestCount,
          });
        } catch {
          set({
            incomingRequests: [],
            outgoingRequests: [],
          });
        } finally {
          set({ requestsLoading: false });
        }
      },

      sendFriendRequest: async (toUserId: string, message?: string) => {
        try {
          const res = await apiClient.post<FriendRequest>(
            '/chat/friends/requests',
            {
              toUserId,
              message: message || undefined,
            }
          );

          // 更新外发列表
          set(state => ({
            outgoingRequests: [res.data, ...state.outgoingRequests],
          }));

          // 更新搜索结果中的状态
          set(state => ({
            searchResults: state.searchResults.map(user =>
              user.id === toUserId
                ? { ...user, status: 'pendingOutgoing' as const }
                : user
            ),
          }));
        } catch (err) {
          console.error('sendFriendRequest failed:', err);
          throw err;
        }
      },

      acceptFriendRequest: async (requestId: string) => {
        try {
          await apiClient.post(`/chat/friends/requests/${requestId}/accept`);

          set(state => ({
            incomingRequests: state.incomingRequests.filter(
              r => r.id !== requestId
            ),
            unreadRequestCount: Math.max(0, state.unreadRequestCount - 1),
          }));

          // 重新加载好友列表
          await get().loadFriends();
        } catch (err) {
          console.error('acceptFriendRequest failed:', err);
          throw err;
        }
      },

      rejectFriendRequest: async (requestId: string) => {
        try {
          await apiClient.post(`/chat/friends/requests/${requestId}/reject`);

          set(state => ({
            incomingRequests: state.incomingRequests.filter(
              r => r.id !== requestId
            ),
            unreadRequestCount: Math.max(0, state.unreadRequestCount - 1),
          }));
        } catch (err) {
          console.error('rejectFriendRequest failed:', err);
          throw err;
        }
      },

      removeFriend: async (friendId: string) => {
        try {
          await apiClient.delete(`/chat/friends/${friendId}`);

          set(state => ({
            friends: state.friends.filter(f => f.id !== friendId),
          }));
        } catch (err) {
          console.error('removeFriend failed:', err);
          throw err;
        }
      },

      updateUnreadRequestCount: (count: number) => {
        set({ unreadRequestCount: count });
      },

      addIncomingRequest: (request: FriendRequest) => {
        set(state => ({
          incomingRequests: [request, ...state.incomingRequests],
          unreadRequestCount: state.unreadRequestCount + 1,
        }));
      },

      updateRequestStatus: (
        requestId: string,
        status: 'ACCEPTED' | 'REJECTED'
      ) => {
        set(state => ({
          outgoingRequests: state.outgoingRequests.map(r =>
            r.id === requestId ? { ...r, status } : r
          ),
        }));
      },

      reset: () => {
        set({
          searchResults: [],
          searchLoading: false,
          searchKeyword: '',
          friends: [],
          friendsLoading: false,
          incomingRequests: [],
          outgoingRequests: [],
          requestsLoading: false,
          unreadRequestCount: 0,
        });
      },
    }),
    { name: 'contacts-store' }
  )
);
