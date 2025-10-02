import { apiClient } from '@/services/apiClient';

export interface CommunityFeedItem {
  id: string;
  name: string;
  description: string | null;
  coverImage: string | null;
  tags: string[];
  language: string | null;
  stars: number;
  viewCount: number;
  commentsCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    username: string;
    avatar: string | null;
  };
  isLiked?: boolean;
  isCollected?: boolean;
}

export interface CommunityFeedResponse {
  items: CommunityFeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CommunityFeedQuery {
  cursor?: string | undefined;
  limit?: number;
  sort?: 'latest' | 'trending' | 'popular';
  language?: string | undefined;
  tags?: string[] | undefined;
  search?: string | undefined;
}

export interface PopularTag {
  tag: string;
  count: number;
}

export interface PopularLanguage {
  language: string;
  count: number;
}

export interface LikeResponse {
  success: boolean;
  stars: number;
}

export interface RepositoryComment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
  parent?: {
    id: string;
    authorId: string;
    content: string;
    author: {
      username: string;
    };
  } | null;
  children?: RepositoryComment[];
  _count: {
    children: number;
    likes: number;
  };
  likes?: Array<{ id: string }>;
}

export interface CreateRepositoryCommentDto {
  content: string;
  parentId?: string;
}

export interface RepositoryCommentDto {
  id: string;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
  parentId?: string | null;
  replies?: RepositoryCommentDto[];
}

export interface RepositoryCommentsResponse {
  comments: RepositoryCommentDto[];
  total: number;
  nextCursor?: string | null;
  hasMore: boolean;
}

/**
 * 社区API服务
 */
export class CommunityAPI {
  /**
   * 获取社区feed流
   */
  static async getFeed(
    query: CommunityFeedQuery = {}
  ): Promise<CommunityFeedResponse> {
    const params = new URLSearchParams();

    if (query.cursor) params.append('cursor', query.cursor);
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.sort) params.append('sort', query.sort);
    if (query.language) params.append('language', query.language);
    if (query.tags && query.tags.length > 0) {
      params.append('tags', query.tags.join(','));
    }
    if (query.search) params.append('search', query.search);

    try {
      const response = await apiClient.get(
        `/community/feed?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      // 如果是401且有Authorization头，尝试匿名重试一次
      if (
        error?.response?.status === 401 &&
        error?.config?.headers?.Authorization
      ) {
        try {
          const retryResponse = await apiClient.get(
            `/community/feed?${params.toString()}`,
            {
              headers: {} as any, // 移除认证头进行匿名访问
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          // 匿名重试也失败，抛出原错误
          throw error;
        }
      }
      throw error;
    }
  }

  /**
   * 获取仓库详情
   */
  static async getRepositoryDetail(repoId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/community/repositories/${repoId}`);
      return response.data;
    } catch (error: any) {
      if (
        error?.response?.status === 401 &&
        error?.config?.headers?.Authorization
      ) {
        try {
          const retryResponse = await apiClient.get(
            `/community/repositories/${repoId}`,
            {
              headers: {} as any,
            }
          );
          return retryResponse.data;
        } catch (retryError) {
          throw error;
        }
      }
      throw error;
    }
  }

  /**
   * 切换仓库点赞状态
   */
  static async toggleRepositoryLike(repoId: string): Promise<{
    isLiked: boolean;
    likesCount: number;
  }> {
    const response = await apiClient.post(`/repositories/${repoId}/like`);
    return response.data;
  }

  /**
   * 切换仓库收藏状态
   */
  static async toggleRepositoryCollection(repoId: string): Promise<{
    isCollected: boolean;
    collectionsCount: number;
  }> {
    const response = await apiClient.post(`/repositories/${repoId}/collect`);
    return response.data;
  }

  /**
   * 获取仓库评论列表
   */
  static async getRepositoryComments(
    repoId: string,
    cursor?: string,
    limit = 20
  ): Promise<RepositoryCommentsResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    try {
      const response = await apiClient.get(
        `/community/repositories/${repoId}/comments?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      if (
        error?.response?.status === 401 &&
        error?.config?.headers?.Authorization
      ) {
        try {
          const retry = await apiClient.get(
            `/community/repositories/${repoId}/comments?${params.toString()}`,
            { headers: {} as any }
          );
          return retry.data;
        } catch (retryErr) {
          throw error;
        }
      }
      throw error;
    }
  }

  /**
   * 创建仓库评论
   */
  static async createRepositoryComment(
    repoId: string,
    data: CreateRepositoryCommentDto
  ): Promise<RepositoryCommentDto> {
    const response = await apiClient.post(
      `/community/repositories/${repoId}/comments`,
      data
    );
    return response.data;
  }

  /**
   * 切换评论点赞状态
   */
  static async toggleCommentLike(commentId: string): Promise<{
    isLiked: boolean;
    likesCount: number;
  }> {
    const response = await apiClient.post(
      `/community/repositories/comments/${commentId}/like`
    );
    return response.data;
  }

  /**
   * 记录仓库浏览
   */
  static async recordRepositoryView(repoId: string): Promise<void> {
    try {
      try {
        await apiClient.post(`/community/repositories/${repoId}/view`);
      } catch (error: any) {
        if (
          error?.response?.status === 401 &&
          error?.config?.headers?.Authorization
        ) {
          await apiClient.post(
            `/community/repositories/${repoId}/view`,
            {},
            {
              headers: {} as any,
            }
          );
        } else {
          throw error;
        }
      }
    } catch (error) {
      // 静默失败，不影响用户体验
      console.warn('Failed to record repository view:', error);
    }
  }

  /**
   * 获取热门标签
   */
  static async getPopularTags(limit: number = 20): Promise<PopularTag[]> {
    try {
      const response = await apiClient.get(
        `/community/tags/popular?limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      if (
        error?.response?.status === 401 &&
        error?.config?.headers?.Authorization
      ) {
        try {
          const retryResponse = await apiClient.get(
            `/community/tags/popular?limit=${limit}`,
            { headers: {} as any }
          );
          return retryResponse.data;
        } catch (retryError) {
          throw error;
        }
      }
      throw error;
    }
  }

  /**
   * 获取热门编程语言
   */
  static async getPopularLanguages(
    limit: number = 10
  ): Promise<PopularLanguage[]> {
    try {
      const response = await apiClient.get(
        `/community/languages/popular?limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      if (
        error?.response?.status === 401 &&
        error?.config?.headers?.Authorization
      ) {
        try {
          const retryResponse = await apiClient.get(
            `/community/languages/popular?limit=${limit}`,
            { headers: {} as any }
          );
          return retryResponse.data;
        } catch (retryError) {
          throw error;
        }
      }
      throw error;
    }
  }
}
