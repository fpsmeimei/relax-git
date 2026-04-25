// 当前产品主线只保留私信；GROUP 仅用于兼容历史会话数据。
export type ChatType = 'DIRECT' | 'GROUP';
export type ChatMemberRole = 'ADMIN' | 'MEMBER';

export interface ChatMemberUser {
  id: string;
  username: string;
  avatar?: string;
}

export interface ChatSummary {
  chatId: string;
  type: ChatType;
  name?: string | null;
  members: ChatMemberUser[]; // 不包含当前用户
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type?: string;
  isRead?: boolean;
  readAt?: string | null;
  createdAt: string;
}
