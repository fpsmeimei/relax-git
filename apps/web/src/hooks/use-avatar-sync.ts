import { useEffect, useState } from 'react';
import { apiClient } from '@/services/apiClient';

// 全局头像更新事件
const AVATAR_UPDATE_EVENT = 'avatar-updated';

// 触发头像更新事件
export const triggerAvatarUpdate = (newAvatarUrl: string) => {
  window.dispatchEvent(
    new CustomEvent(AVATAR_UPDATE_EVENT, {
      detail: { avatarUrl: newAvatarUrl },
    })
  );
};

// Hook 用于监听头像更新
export const useAvatarSync = (initialAvatar?: string | null) => {
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(
    initialAvatar || null
  );

  useEffect(() => {
    const handleAvatarUpdate = (event: CustomEvent) => {
      const newAvatarUrl = event.detail?.avatarUrl;
      if (newAvatarUrl) {
        setCurrentAvatar(newAvatarUrl);
      }
    };

    // 监听头像更新事件
    window.addEventListener(
      AVATAR_UPDATE_EVENT,
      handleAvatarUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        AVATAR_UPDATE_EVENT,
        handleAvatarUpdate as EventListener
      );
    };
  }, []);

  // 获取最新头像的函数
  const fetchLatestAvatar = async () => {
    try {
      const res = await apiClient.get('/_auth/profile');
      const avatarUrl = res.data?.avatar;
      if (avatarUrl !== currentAvatar) {
        setCurrentAvatar(avatarUrl || null);
        return avatarUrl;
      }
      return currentAvatar;
    } catch (error: any) {
      // 如果是401未授权错误（用户未登录），静默处理
      if (error?.status === 401 || error?.code === 'UNAUTHORIZED') {
        setCurrentAvatar(null);
        return null;
      }

      // 其他错误才打印日志
      console.warn('Failed to fetch avatar (non-critical):', {
        message: error?.message,
        status: error?.status,
        code: error?.code,
      });
      return currentAvatar;
    }
  };

  return {
    currentAvatar,
    setCurrentAvatar,
    fetchLatestAvatar,
  };
};
