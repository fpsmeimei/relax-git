import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProtectedAction } from '../use-protected-action';

// Mock dependencies
vi.mock('@/stores/auth-store', () => ({
  useAuth: vi.fn(),
  useAuthActions: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

import { useAuth } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

describe('useProtectedAction Hook', () => {
  const mockPush = vi.fn();
  const mockRouter = { push: mockPush };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    // Mock window.location
    delete (window as any).location;
    (window as any).location = { pathname: '/test-path' };
  });

  describe('withAuth', () => {
    it('should execute action when user is authenticated', async () => {
      // Mock 已登录状态
      (useAuth as any).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', username: 'testuser' },
      });

      const mockAction = vi.fn().mockResolvedValue('result');
      const { result } = renderHook(() => useProtectedAction());

      const wrappedAction = result.current.withAuth(mockAction);

      // 执行包装后的函数
      const actionResult = await wrappedAction('arg1', 123);

      // 应该执行原始函数
      expect(mockAction).toHaveBeenCalledWith('arg1', 123);
      expect(actionResult).toBe('result');
      expect(toast).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should redirect to login when user is not authenticated', () => {
      // Mock 未登录状态
      (useAuth as any).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      const mockAction = vi.fn();
      const { result } = renderHook(() => useProtectedAction());

      const wrappedAction = result.current.withAuth(mockAction);

      // 执行包装后的函数
      wrappedAction();

      // 不应该执行原始函数
      expect(mockAction).not.toHaveBeenCalled();
      
      // 应该显示提示
      expect(toast).toHaveBeenCalledWith({
        title: '需要登录',
        description: '请先登录后再使用此功能',
        variant: 'warning',
      });

      // 应该跳转到登录页
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login?redirect=')
      );
    });

    it('should use custom message when provided', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      const mockAction = vi.fn();
      const { result } = renderHook(() => useProtectedAction());

      const customMessage = '创建仓库需要登录';
      const wrappedAction = result.current.withAuth(mockAction, {
        message: customMessage,
      });

      wrappedAction();

      expect(toast).toHaveBeenCalledWith({
        title: '需要登录',
        description: customMessage,
        variant: 'warning',
      });
    });

    it('should redirect to custom path when provided', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      const mockAction = vi.fn();
      const { result } = renderHook(() => useProtectedAction());

      const wrappedAction = result.current.withAuth(mockAction, {
        redirectTo: '/custom-path',
      });

      wrappedAction();

      expect(mockPush).toHaveBeenCalledWith(
        '/auth/login?redirect=%2Fcustom-path'
      );
    });

    it('should not show toast when silent option is true', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      const mockAction = vi.fn();
      const { result } = renderHook(() => useProtectedAction());

      const wrappedAction = result.current.withAuth(mockAction, {
        silent: true,
      });

      wrappedAction();

      expect(toast).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe('checkAuth', () => {
    it('should return true when authenticated', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1' },
      });

      const { result } = renderHook(() => useProtectedAction());

      expect(result.current.checkAuth()).toBe(true);
    });

    it('should return false when not authenticated', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      const { result } = renderHook(() => useProtectedAction());

      expect(result.current.checkAuth()).toBe(false);
    });

    it('should return false when user is null even if isAuthenticated is true', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: true,
        user: null,
      });

      const { result } = renderHook(() => useProtectedAction());

      expect(result.current.checkAuth()).toBe(false);
    });
  });

  describe('requireAuth', () => {
    it('should return true when authenticated', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1' },
      });

      const { result } = renderHook(() => useProtectedAction());

      const authResult = result.current.requireAuth();

      expect(authResult).toBe(true);
      expect(toast).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should show toast and redirect when not authenticated', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      const { result } = renderHook(() => useProtectedAction());

      const authResult = result.current.requireAuth('操作需要登录');

      expect(authResult).toBe(false);
      expect(toast).toHaveBeenCalledWith({
        title: '需要登录',
        description: '操作需要登录',
        variant: 'warning',
      });
      expect(mockPush).toHaveBeenCalled();
    });

    it('should use custom redirectTo', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      const { result } = renderHook(() => useProtectedAction());

      result.current.requireAuth(undefined, '/target-page');

      expect(mockPush).toHaveBeenCalledWith(
        '/auth/login?redirect=%2Ftarget-page'
      );
    });
  });

  describe('exported properties', () => {
    it('should export isAuthenticated from useAuth', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1' },
      });

      const { result } = renderHook(() => useProtectedAction());

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should export user from useAuth', () => {
      const mockUser = { id: '1', username: 'test' };
      (useAuth as any).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
      });

      const { result } = renderHook(() => useProtectedAction());

      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle create repository flow', async () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', username: 'developer' },
      });

      const createRepository = vi.fn().mockResolvedValue({
        id: 'repo-1',
        name: 'my-repo',
      });

      const { result } = renderHook(() => useProtectedAction());

      const wrappedCreate = result.current.withAuth(createRepository, {
        message: '创建仓库需要登录',
      });

      const repo = await wrappedCreate({ name: 'my-repo' });

      expect(createRepository).toHaveBeenCalledWith({ name: 'my-repo' });
      expect(repo).toEqual({ id: 'repo-1', name: 'my-repo' });
    });

    it('should handle comment submission flow', () => {
      (useAuth as any).mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      const submitComment = vi.fn();
      const { result } = renderHook(() => useProtectedAction());

      const wrappedSubmit = result.current.withAuth(submitComment, {
        message: '评论需要登录',
      });

      wrappedSubmit('这是我的评论');

      expect(submitComment).not.toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith({
        title: '需要登录',
        description: '评论需要登录',
        variant: 'warning',
      });
    });
  });
});
