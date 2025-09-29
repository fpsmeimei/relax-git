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
  createdAt: string;
}
