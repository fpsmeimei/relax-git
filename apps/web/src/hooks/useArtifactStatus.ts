import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api/client';

export interface ArtifactStatus {
  id: string;
  status: 'QUEUED' | 'PROCESSING' | 'READY' | 'FAILED';
  processedAt?: string;
  errorMessage?: string;
}

export interface UseArtifactStatusOptions {
  /**
   * 轮询间隔（毫秒）
   * @default 2000
   */
  pollInterval?: number;

  /**
   * 超时时间（毫秒）
   * @default 300000 (5分钟)
   */
  timeout?: number;

  /**
   * 是否自动开始轮询
   * @default true
   */
  autoStart?: boolean;

  /**
   * 状态变化回调
   */
  onStatusChange?: (status: ArtifactStatus) => void;

  /**
   * 完成回调（READY或FAILED）
   */
  onComplete?: (status: ArtifactStatus) => void;

  /**
   * 错误回调
   */
  onError?: (error: Error) => void;
}

/**
 * 用于轮询artifact状态的Hook
 */
export function useArtifactStatus(
  artifactId: string | null,
  options: UseArtifactStatusOptions = {}
) {
  const {
    pollInterval = 2000,
    timeout = 300000, // 5分钟
    autoStart = true,
    onStatusChange,
    onComplete,
    onError,
  } = options;

  const [status, setStatus] = useState<ArtifactStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  /**
   * 获取artifact状态
   */
  const fetchStatus = useCallback(async () => {
    if (!artifactId) return null;

    try {
      const response = await apiClient.get<ArtifactStatus>(
        `/artifacts/${artifactId}/status`
      );
      return response.data;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to fetch artifact status'
      );
    }
  }, [artifactId]);

  /**
   * 停止轮询
   */
  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  /**
   * 开始轮询
   */
  const startPolling = useCallback(async () => {
    if (!artifactId || isPolling) return;

    setIsPolling(true);
    setError(null);
    startTimeRef.current = Date.now();

    // 设置超时
    timeoutTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      stopPolling();
      const timeoutError = new Error('Artifact processing timeout');
      setError(timeoutError);
      onError?.(timeoutError);
    }, timeout);

    const poll = async () => {
      if (!mountedRef.current) return;

      try {
        const newStatus = await fetchStatus();
        if (!newStatus || !mountedRef.current) return;

        setStatus(newStatus);
        onStatusChange?.(newStatus);

        // 检查是否完成
        if (newStatus.status === 'READY' || newStatus.status === 'FAILED') {
          stopPolling();
          onComplete?.(newStatus);
          return;
        }

        // 继续轮询
        if (mountedRef.current && isPolling) {
          pollTimerRef.current = setTimeout(poll, pollInterval);
        }
      } catch (err) {
        if (!mountedRef.current) return;

        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        stopPolling();
        onError?.(error);
      }
    };

    // 立即执行第一次查询
    await poll();
  }, [
    artifactId,
    isPolling,
    fetchStatus,
    stopPolling,
    pollInterval,
    timeout,
    onStatusChange,
    onComplete,
    onError,
  ]);

  /**
   * 重试（用于失败的artifact）
   */
  const retry = useCallback(async () => {
    if (!artifactId) return;

    try {
      await apiClient.post(`/artifacts/${artifactId}/retry`);
      // 重新开始轮询
      await startPolling();
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to retry artifact');
      setError(error);
      onError?.(error);
    }
  }, [artifactId, startPolling, onError]);

  /**
   * 手动刷新状态（不启动轮询）
   */
  const refresh = useCallback(async () => {
    if (!artifactId) return;

    try {
      const newStatus = await fetchStatus();
      if (newStatus && mountedRef.current) {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      }
    } catch (err) {
      if (mountedRef.current) {
        const error =
          err instanceof Error ? err : new Error('Failed to refresh status');
        setError(error);
      }
    }
  }, [artifactId, fetchStatus, onStatusChange]);

  // 自动开始轮询
  useEffect(() => {
    if (autoStart && artifactId && !isPolling) {
      startPolling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, artifactId]); // 注意：这里故意不包含 isPolling 和 startPolling

  // 清理
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  return {
    status,
    isPolling,
    error,
    startPolling,
    stopPolling,
    retry,
    refresh,
    isReady: status?.status === 'READY',
    isFailed: status?.status === 'FAILED',
    isProcessing:
      status?.status === 'PROCESSING' || status?.status === 'QUEUED',
  };
}
