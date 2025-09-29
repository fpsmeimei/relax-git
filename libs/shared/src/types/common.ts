// 通用类型定义

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type TaskStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface TaskResult {
  id: string;
  status: TaskStatus;
  progress?: number;
  error?: string;
  result?: unknown;
  createdAt: Date;
  updatedAt: Date;
}
