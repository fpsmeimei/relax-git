import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { useMessagesStore } from './messages-store';
import { useContactsStore } from './contacts-store';
import { useNotificationsStore } from './notifications-store';
import { useAppStore } from './app-store';
import { useSearchStore } from './searchStore';

export interface User {
  id: string;
  username: string;
  uid: string;
  displayName?: string;
  avatar?: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  // 状态
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // 动作
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

// 自动清理旧的 token 数据（一次性迁移）
if (typeof window !== 'undefined') {
  const hasOldTokenData =
    localStorage.getItem('token') || localStorage.getItem('refreshToken');
  if (hasOldTokenData) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    // 也清理可能包含 token 的 auth-storage
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.token || parsed.state?.refreshToken) {
          localStorage.removeItem('auth-storage');
        }
      } catch {
        // 解析失败，直接清理
        localStorage.removeItem('auth-storage');
      }
    }
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer(set => ({
      // 初始状态
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isInitialized: false,

      // 登录
      login: user => {
        set(state => {
          state.user = user;
          state.isAuthenticated = true;
          state.isLoading = false;
          state.isInitialized = true;
        });
      },

      // 登出
      logout: () => {
        set(state => {
          state.user = null;
          state.isAuthenticated = false;
          state.isLoading = false;
        });

        // 清空所有相关的 store 状态
        try {
          useMessagesStore.getState().reset();
          useContactsStore.getState().reset();
          useNotificationsStore.getState().reset();
          useAppStore.getState().reset();
          useSearchStore.getState().reset();

          // 广播登出事件
          if (typeof window !== 'undefined') {
            try {
              window.dispatchEvent(new Event('RG_LOGOUT'));
            } catch {}
          }
        } catch (error) {
          console.error('[auth-store] 状态清理时出错:', error);
        }
      },

      // 更新用户信息
      updateUser: userData => {
        set(state => {
          if (state.user) {
            state.user = { ...state.user, ...userData };
          }
        });
      },

      // 设置加载状态
      setLoading: loading => {
        set(state => {
          state.isLoading = loading;
        });
      },

      // 设置初始化状态
      setInitialized: initialized => {
        set(state => {
          state.isInitialized = initialized;
        });
      },
    })),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// 选择器
export const useAuth = () => {
  const { user, isLoading, isAuthenticated, isInitialized } = useAuthStore();
  return {
    user,
    isLoading,
    isAuthenticated,
    isInitialized,
  };
};

export const useAuthActions = () => {
  const { login, logout, updateUser, setLoading, setInitialized } =
    useAuthStore();
  return { login, logout, updateUser, setLoading, setInitialized };
};
