import { useCallback, useState } from 'react';
import { toast } from './use-toast';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  showToast?: boolean;
}

/**
 * 统一的异步请求状态管理 Hook
 *
 * @example
 * const { execute, isLoading, data } = useAsync(fetchRepositories);
 *
 * <button onClick={() => execute()} disabled={isLoading}>
 *   {isLoading ? '加载中...' : '获取仓库'}
 * </button>
 */
export function useAsync<T, Args extends any[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options?: UseAsyncOptions<T>
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(
    async (...args: Args) => {
      setState(prev => ({
        ...prev,
        isLoading: true,
        isError: false,
        error: null,
      }));

      try {
        const data = await asyncFunction(...args);

        setState({
          data,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        });

        // 成功回调
        options?.onSuccess?.(data);

        // 成功提示
        if (options?.showToast !== false && options?.successMessage) {
          toast({
            title: '操作成功',
            description: options.successMessage,
          });
        }

        return data;
      } catch (error) {
        const err = error as Error;

        setState({
          data: null,
          error: err,
          isLoading: false,
          isSuccess: false,
          isError: true,
        });

        // 错误回调
        options?.onError?.(err);

        // 错误提示（apiClient 已经处理了大部分错误）
        if (options?.showToast && options?.errorMessage) {
          toast({
            title: '操作失败',
            description: options.errorMessage,
            variant: 'destructive',
          });
        }

        throw error;
      }
    },
    [asyncFunction, options]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * 使用示例：
 *
 * // 基础用法
 * const { execute: createRepo, isLoading } = useAsync(
 *   createRepository,
 *   {
 *     successMessage: '仓库创建成功',
 *     onSuccess: (data) => router.push(`/repositories/${data.id}`),
 *   }
 * );
 *
 * // 带参数
 * const { execute: deleteRepo, isLoading } = useAsync(
 *   (id: string) => deleteRepository(id),
 *   { successMessage: '删除成功' }
 * );
 *
 * <button onClick={() => deleteRepo('repo-id')} disabled={isLoading}>
 *   {isLoading ? '删除中...' : '删除'}
 * </button>
 */
