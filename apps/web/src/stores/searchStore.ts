import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  SearchType,
  SearchStatus,
  SearchResult,
  SearchHistoryItem,
  CreateSearchRequest,
} from '../types/search';
import { SearchService } from '../services/searchService';

interface SearchState {
  // 当前搜索状态
  currentSearch: SearchResult | null;
  isSearching: boolean;
  searchError: string | null;

  // 搜索历史
  searchHistory: SearchHistoryItem[];
  historyLoading: boolean;
  historyError: string | null;
  historyPagination: {
    page: number;
    limit: number;
    total: number;
  };

  // 搜索表单状态
  searchForm: {
    repositoryId: string;
    snapshotId?: string;
    query: string;
    searchType: SearchType;
    maxResults: number;
  };

  // Actions
  setSearchForm: (form: Partial<SearchState['searchForm']>) => void;
  createSearch: (request: CreateSearchRequest) => Promise<void>;
  clearCurrentSearch: () => void;
  loadSearchHistory: (repositoryId?: string, page?: number) => Promise<void>;
  deleteSearchHistory: (historyId: string) => Promise<void>;
  clearSearchHistory: () => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentSearch: null,
      isSearching: false,
      searchError: null,

      searchHistory: [],
      historyLoading: false,
      historyError: null,
      historyPagination: {
        page: 1,
        limit: 20,
        total: 0,
      },

      searchForm: {
        repositoryId: '',
        query: '',
        searchType: SearchType.CONTENT,
        maxResults: 100,
      },

      // Actions
      setSearchForm: form => {
        set(state => ({
          searchForm: { ...state.searchForm, ...form },
        }));
      },

      createSearch: async request => {
        set({ isSearching: true, searchError: null, currentSearch: null });

        try {
          const response = await SearchService.createSearch(request);

          // 开始轮询搜索结果
          SearchService.pollSearchResult(
            response.id,
            result => {
              set({ currentSearch: result });
            },
            result => {
              set({
                currentSearch: result,
                isSearching: false,
                searchError:
                  result.status === 'FAILED'
                    ? result.errorMessage || '搜索失败'
                    : null,
              });

              // 搜索完成后刷新历史记录
              get().loadSearchHistory(request.repositoryId);
            },
            error => {
              set({
                isSearching: false,
                searchError: error.message || '搜索失败',
              });
            }
          );
        } catch (error: any) {
          set({
            isSearching: false,
            searchError:
              error.response?.data?.message || error.message || '搜索失败',
          });
        }
      },

      clearCurrentSearch: () => {
        set({
          currentSearch: null,
          isSearching: false,
          searchError: null,
        });
      },

      loadSearchHistory: async (repositoryId, page = 1) => {
        set({ historyLoading: true, historyError: null });

        try {
          const query: any = {
            page,
            limit: get().historyPagination.limit,
          };
          if (repositoryId) query.repositoryId = repositoryId;
          const response = await SearchService.getSearchHistory(query);

          set({
            searchHistory: response.history,
            historyLoading: false,
            historyPagination: {
              page: response.page,
              limit: response.limit,
              total: response.total,
            },
          });
        } catch (error: any) {
          set({
            historyLoading: false,
            historyError:
              error.response?.data?.message ||
              error.message ||
              '加载搜索历史失败',
          });
        }
      },

      deleteSearchHistory: async historyId => {
        try {
          await SearchService.deleteSearchHistory(historyId);

          // 从本地状态中移除
          set(state => ({
            searchHistory: state.searchHistory.filter(
              item => item.id !== historyId
            ),
            historyPagination: {
              ...state.historyPagination,
              total: Math.max(0, state.historyPagination.total - 1),
            },
          }));
        } catch (error: any) {
          set({
            historyError:
              error.response?.data?.message ||
              error.message ||
              '删除搜索历史失败',
          });
        }
      },

      clearSearchHistory: () => {
        set({
          searchHistory: [],
          historyPagination: {
            page: 1,
            limit: 20,
            total: 0,
          },
        });
      },

      reset: () => {
        console.log('[search-store] 重置搜索状态');
        set({
          currentSearch: null,
          isSearching: false,
          searchError: null,
          searchHistory: [],
          historyLoading: false,
          historyError: null,
          historyPagination: {
            page: 1,
            limit: 20,
            total: 0,
          },
          searchForm: {
            repositoryId: '',
            query: '',
            searchType: SearchType.CONTENT,
            maxResults: 100,
          },
        });
      },
    }),
    {
      name: 'search-store',
    }
  )
);
