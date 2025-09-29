'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  // 检查认证状态
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthState({ user: null, loading: false, error: null });
        return;
      }

      // 验证token并获取用户信息
      const response = await apiClient.get('/auth/me');
      setAuthState({
        user: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token无效，清除本地存储
      localStorage.removeItem('token');
      setAuthState({
        user: null,
        loading: false,
        error: 'Authentication failed',
      });
    }
  };

  // 登录
  const login = async (credentials: { email: string; password: string }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response = await apiClient.post('/auth/login', credentials);
      const { token, user } = response.data;

      // 保存token
      localStorage.setItem('token', token);

      setAuthState({
        user,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  // 注册
  const register = async (userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response = await apiClient.post('/auth/register', userData);
      const { token, user } = response.data;

      // 保存token
      localStorage.setItem('token', token);

      setAuthState({
        user,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Registration failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return { success: false, error: errorMessage };
    }
  };

  // 登出
  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      loading: false,
      error: null,
    });
    router.push('/');
  };

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null,
    }));
  };

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
    isAuthenticated: !!authState.user,
  };
}
