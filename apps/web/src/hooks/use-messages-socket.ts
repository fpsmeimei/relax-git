'use client';

import { useSocket } from '@/components/socket-provider';
import { apiClient } from '@/services/apiClient';
import { useMessagesStore } from '@/stores/messages-store';
import { useContactsStore } from '@/stores/contacts-store';
import { useAuth } from '@/stores/auth-store';
import { useEffect } from 'react';

export function useMessagesSocket() {
  const { isConnected, on } = useSocket();
  const { user } = useAuth();
  const { updateOnNewMessage, markMessagesRead, applyUnreadCounts } =
    useMessagesStore();
  const {
    addIncomingRequest,
    updateRequestStatus,
    updateUnreadRequestCount,
    loadFriends,
    loadFriendRequests,
  } = useContactsStore();

  useEffect(() => {
    if (!isConnected) return;

    // 新私信消息推送
    const handleNewMessage = (message: any) => {
      const isSelf = user?.id === message.senderId;
      updateOnNewMessage(message, isSelf);
    };

    // 私信消息已读回执
    const handleMessageRead = (data: {
      chatId: string;
      userId: string;
      messageIds: string[];
      readAt: string;
    }) => {
      if (!data.chatId || !Array.isArray(data.messageIds)) {
        return;
      }

      markMessagesRead(data.chatId, data.messageIds, data.readAt);
    };

    // 好友申请通知
    const handleFriendRequestNew = (data: {
      requestId: string;
      fromUserId: string;
      message?: string;
      createdAt: string;
    }) => {
      // 优先回源，拿到真实用户名和头像，避免消息中心出现占位文案。
      void loadFriendRequests().catch(async () => {
        let fromUser:
          | {
              id: string;
              username: string;
              avatar: string | null;
            }
          | undefined;

        try {
          const response = await apiClient.get<{
            id: string;
            username: string;
            avatar?: string | null;
          }>(`/users/${data.fromUserId}`);

          if (response.data?.id) {
            fromUser = {
              id: response.data.id,
              username: response.data.username,
              avatar: response.data.avatar ?? null,
            };
          }
        } catch {
          // ignore
        }

        if (!fromUser) {
          fromUser = {
            id: data.fromUserId,
            username: '新用户',
            avatar: null,
          };
        }

        // 构造好友申请对象
        const request = {
          id: data.requestId,
          fromUserId: data.fromUserId,
          toUserId: user?.id ?? '',
          status: 'PENDING' as const,
          message: data.message ?? null,
          createdAt: data.createdAt,
          updatedAt: data.createdAt,
          fromUser,
        };
        addIncomingRequest(request);
      });
    };

    // 好友申请处理结果
    const handleFriendRequestResult = (data: {
      requestId: string;
      status: 'ACCEPTED' | 'REJECTED';
      byUserId: string;
      createdAt: string;
    }) => {
      updateRequestStatus(data.requestId, data.status);

      // 如果被接受，重新加载好友列表
      if (data.status === 'ACCEPTED') {
        void loadFriends();
      }
    };

    // 未读统计更新
    const handleUnreadCounts = (counts: {
      chats: Array<{ chatId: string; unread: number }>;
      friendRequests: number;
    }) => {
      updateUnreadRequestCount(counts.friendRequests);
      applyUnreadCounts(counts.chats);
    };

    // 注册事件监听，保存清理函数
    const unsubscribeMessage = on('chat:message:new', handleNewMessage as any);
    const unsubscribeRead = on('chat:message:read', handleMessageRead as any);
    const unsubscribeFriendRequest = on(
      'chat:friend-request:new',
      handleFriendRequestNew as any
    );
    const unsubscribeFriendResult = on(
      'chat:friend-request:result',
      handleFriendRequestResult as any
    );
    const unsubscribeUnreadCounts = on(
      'chat:unread-counts',
      handleUnreadCounts as any
    );

    // 清理函数：移除所有监听器
    return () => {
      unsubscribeMessage();
      unsubscribeRead();
      unsubscribeFriendRequest();
      unsubscribeFriendResult();
      unsubscribeUnreadCounts();
    };
  }, [
    isConnected,
    on,
    user?.id,
    updateOnNewMessage,
    markMessagesRead,
    applyUnreadCounts,
    addIncomingRequest,
    updateRequestStatus,
    updateUnreadRequestCount,
    loadFriends,
    loadFriendRequests,
    user?.id,
  ]);

  return { isConnected };
}
