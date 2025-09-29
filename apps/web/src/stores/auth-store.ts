import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

export interface User {
  id: string;
  email?: string;
  username: string;
  displayName?: string;
  avatar?: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  // 状态
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean; // 新增：标记是否已初始化

  // 动作
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  refreshAuth: (token: string, refreshToken: string) => void;
  setInitialized: (initialized: boolean) => void; // 新增
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer(set => ({
      // 初始状态
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      isInitialized: false,

      // 登录
      login: (user, token, refreshToken) => {
        set(state => {
          state.user = user;
          state.token = token;
          state.refreshToken = refreshToken;
          state.isAuthenticated = true;
          state.isLoading = false;
        });
        // 同时保存 token 到 localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
      },

      // 登出
      logout: () => {
        set(state => {
          state.user = null;
          state.token = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          state.isLoading = false;
        });
        // 同时清除 localStorage 中的 token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
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

      // 刷新认证信息
      refreshAuth: (token, refreshToken) => {
        set(state => {
          state.token = token;
          state.refreshToken = refreshToken;
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
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// 选择器
export const useAuth = () => {
  const {
    user,
    token,
    refreshToken,
    isLoading,
    isAuthenticated,
    isInitialized,
  } = useAuthStore();
  return {
    user,
    token,
    refreshToken,
    isLoading,
    isAuthenticated,
    isInitialized,
  };
};

export const useAuthActions = () => {
  const { login, logout, updateUser, setLoading, refreshAuth, setInitialized } =
    useAuthStore();
  return { login, logout, updateUser, setLoading, refreshAuth, setInitialized };
};
