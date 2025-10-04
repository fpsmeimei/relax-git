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
      console.log('Fetching avatar from /_auth/profile...');
      const res = await apiClient.get('/_auth/profile');
      console.log('Avatar response:', res.data);
      const avatarUrl = res.data?.avatar;
      if (avatarUrl !== currentAvatar) {
        console.log('Updating avatar:', avatarUrl);
        setCurrentAvatar(avatarUrl || null);
        return avatarUrl;
      }
      return currentAvatar;
    } catch (error: any) {
      console.error('Failed to fetch latest avatar:', error);
      console.error('Error details:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url,
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
