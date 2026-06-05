import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAsync } from '../use-async';

describe('useAsync Hook', () => {
  // 测试初始状态
  it('should have correct initial state', () => {
    const mockFn = vi.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsync(mockFn));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  // 测试成功场景
  it('should handle successful execution', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFn = vi.fn().mockResolvedValue(mockData);
    const { result } = renderHook(() => useAsync(mockFn));

    // 执行异步操作
    act(() => {
      result.current.execute();
    });

    // 应该进入 loading 状态
    expect(result.current.isLoading).toBe(true);

    // 等待异步操作完成
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // 验证最终状态
    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  // 测试失败场景
  it('should handle error execution', async () => {
    const mockError = new Error('Test error');
    const mockFn = vi.fn().mockRejectedValue(mockError);
    const { result } = renderHook(() => useAsync(mockFn));

    // 执行异步操作
    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // 预期会抛出错误
      }
    });

    // 验证错误状态
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
  });

  // 测试带参数的执行
  it('should pass arguments to async function', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useAsync(mockFn));

    const arg1 = 'test';
    const arg2 = 123;

    await act(async () => {
      await result.current.execute(arg1, arg2);
    });

    expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
  });

  // 测试 reset 功能
  it('should reset state correctly', async () => {
    const mockFn = vi.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsync(mockFn));

    // 先执行一次
    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBe('data');
    expect(result.current.isSuccess).toBe(true);

    // 重置状态
    act(() => {
      result.current.reset();
    });

    // 验证重置后的状态
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  // 测试成功回调
  it('should call onSuccess callback', async () => {
    const mockData = 'success data';
    const mockFn = vi.fn().mockResolvedValue(mockData);
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useAsync(mockFn, { onSuccess }));

    await act(async () => {
      await result.current.execute();
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  // 测试错误回调
  it('should call onError callback', async () => {
    const mockError = new Error('Test error');
    const mockFn = vi.fn().mockRejectedValue(mockError);
    const onError = vi.fn();

    const { result } = renderHook(() => useAsync(mockFn, { onError }));

    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // 预期错误
      }
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  // 测试多次调用
  it('should handle multiple executions', async () => {
    let callCount = 0;
    const mockFn = vi.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve(`result-${callCount}`);
    });

    const { result } = renderHook(() => useAsync(mockFn));

    // 第一次调用
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.data).toBe('result-1');

    // 第二次调用
    await act(async () => {
      await result.current.execute();
    });
    expect(result.current.data).toBe('result-2');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });
});
