import { apiClient } from './apiClient';
import {
  CreateSearchRequest,
  SearchResponse,
  SearchResult,
  SearchHistoryResponse,
  SearchHistoryQuery,
} from '../types/search';

export class SearchService {
  /**
   * 创建搜索任务
   */
  static async createSearch(
    request: CreateSearchRequest
  ): Promise<SearchResponse> {
    const response = await apiClient.post('/search', request);
    return response.data;
  }

  /**
   * 获取搜索结果
   */
  static async getSearchResult(searchId: string): Promise<SearchResult> {
    const response = await apiClient.get(`/search/${searchId}`);
    return response.data;
  }

  /**
   * 获取搜索历史
   */
  static async getSearchHistory(
    query?: SearchHistoryQuery
  ): Promise<SearchHistoryResponse> {
    const params = new URLSearchParams();

    if (query?.repositoryId) {
      params.append('repositoryId', query.repositoryId);
    }
    if (query?.page) {
      params.append('page', query.page.toString());
    }
    if (query?.limit) {
      params.append('limit', query.limit.toString());
    }

    const response = await apiClient.get(`/search?${params.toString()}`);
    return response.data;
  }

  /**
   * 删除搜索历史
   */
  static async deleteSearchHistory(historyId: string): Promise<void> {
    await apiClient.delete(`/search/history/${historyId}`);
  }

  /**
   * 轮询搜索结果
   */
  static async pollSearchResult(
    searchId: string,
    onUpdate: (result: SearchResult) => void,
    onComplete: (result: SearchResult) => void,
    onError: (error: Error) => void,
    maxAttempts: number = 60,
    interval: number = 2000
  ): Promise<void> {
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const result = await this.getSearchResult(searchId);

        onUpdate(result);

        if (result.status === 'COMPLETED' || result.status === 'FAILED') {
          onComplete(result);
          return;
        }

        if (attempts >= maxAttempts) {
          onError(new Error('搜索超时'));
          return;
        }

        setTimeout(poll, interval);
      } catch (error) {
        onError(error as Error);
      }
    };

    poll();
  }
}
