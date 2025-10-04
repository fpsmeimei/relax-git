'use client';

import { useSocket } from '@/components/socket-provider';
import { useChatStore } from '@/stores/chat-store';
import { useChatFriendsStore } from '@/stores/chat-friends-store';
import { useEffect } from 'react';

export function useChatSocket() {
  const { isConnected, on } = useSocket();
  const { updateOnNewMessage } = useChatStore();
  const {
    addIncomingRequest,
    updateRequestStatus,
    updateUnreadRequestCount,
    loadFriends,
  } = useChatFriendsStore();

  useEffect(() => {
    if (!isConnected) return;

    // 新消息推送
    const handleNewMessage = (message: any) => {
      console.log('[use-chat-socket] 收到新消息推送:', message);
      // 判断是否是自己发送的消息
      const isSelf = false; // TODO: 获取当前用户ID并比较
      updateOnNewMessage(message, isSelf);
    };

    // 消息已读回执
    const handleMessageRead = (data: {
      chatId: string;
      userId: string;
      messageIds: string[];
      readAt: string;
    }) => {
      // TODO: 更新消息已读状态
      console.log('Message read receipt:', data);
    };

    // 好友申请通知
    const handleFriendRequestNew = (data: {
      requestId: string;
      fromUserId: string;
      message?: string;
      createdAt: string;
    }) => {
      // 构造好友申请对象
      const request = {
        id: data.requestId,
        fromUserId: data.fromUserId,
        toUserId: '', // 当前用户
        status: 'PENDING' as const,
        message: data.message ?? null,
        createdAt: data.createdAt,
        updatedAt: data.createdAt,
        fromUser: {
          id: data.fromUserId,
          username: '新用户', // TODO: 从缓存或API获取用户信息
          avatar: null,
        },
      };
      addIncomingRequest(request);
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
      // TODO: 更新聊天未读统计
    };

    // 注册事件监听
    on('chat:message:new', handleNewMessage as any);
    on('chat:message:read', handleMessageRead as any);
    on('chat:friend-request:new', handleFriendRequestNew as any);
    on('chat:friend-request:result', handleFriendRequestResult as any);
    on('chat:unread-counts', handleUnreadCounts as any);

    // TODO: 清理函数需要 socket provider 支持 off 方法
    return () => {
      // 暂时无法清理监听器
    };
  }, [
    isConnected,
    on,
    updateOnNewMessage,
    addIncomingRequest,
    updateRequestStatus,
    updateUnreadRequestCount,
    loadFriends,
  ]);

  return { isConnected };
}
