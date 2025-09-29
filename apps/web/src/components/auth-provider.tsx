'use client';

import { useAuthStore } from '@/stores/auth-store';
import { apiClient } from '@/services/apiClient';
import { useEffect, useRef } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { token, user, login, logout, setLoading, setInitialized } =
    useAuthStore();
  const hasChecked = useRef(false);

  // 验证 token 有效性并获取用户信息
  const validateToken = async () => {
    try {
      // 不需要手动设置 Authorization 头，apiClient 会自动从 localStorage 获取
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Token validation failed:', error);
      throw error;
    }
  };

  // 初始化时检查认证状态
  useEffect(() => {
    const checkAuth = async () => {
      // 避免重复检查
      if (hasChecked.current) return;
      hasChecked.current = true;

      // 从 localStorage 获取持久化的 token
      const storedToken =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!storedToken) {
        // 没有 token，确保清除状态
        if (token || user) {
          logout();
        }
        setLoading(false);
        setInitialized(true); // 标记初始化完成
        return;
      }

      setLoading(true);

      try {
        // 如果有 token 但没有 user，或者 store 中的 token 与 localStorage 不一致，需要验证
        if (storedToken && (!user || token !== storedToken)) {
          const userData = await validateToken();
          // 更新认证状态
          login(userData, storedToken, storedToken);
        }
      } catch (error) {
        // Token 无效，清除认证状态
        console.warn('Token validation failed, logging out');
        logout();
        // 清除 localStorage 中的无效 token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
        setInitialized(true); // 标记初始化完成
      }
    };

    checkAuth();
  }, [login, logout, setLoading, setInitialized, token, user]); // 依赖项包含所有使用的 store 方法和状态

  return <>{children}</>;
}
