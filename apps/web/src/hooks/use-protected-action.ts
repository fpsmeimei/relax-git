import { useAuth, useAuthActions } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from './use-toast';

/**
 * 受保护操作 Hook
 * 只有在用户点击按钮/执行操作时才检查认证
 */
export function useProtectedAction() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  /**
   * 包装一个需要认证的操作
   * @param action - 需要认证的操作函数
   * @param options - 配置选项
   */
  const withAuth = useCallback(
    <T extends (...args: any[]) => any>(
      action: T,
      options?: {
        redirectTo?: string; // 登录后重定向的地址
        message?: string; // 未登录提示消息
        silent?: boolean; // 是否静默（不显示toast）
      }
    ): T => {
      return ((...args: Parameters<T>) => {
        // 检查是否已登录
        if (!isAuthenticated || !user) {
          // 显示提示
          if (!options?.silent) {
            toast({
              title: '需要登录',
              description: options?.message || '请先登录后再使用此功能',
              variant: 'warning',
            });
          }

          // 记录原始地址
          const currentPath = window.location.pathname;
          const redirect = options?.redirectTo || currentPath;

          // 跳转到登录页
          router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
          return;
        }

        // 已登录，执行操作
        return action(...args);
      }) as T;
    },
    [isAuthenticated, user, router]
  );

  /**
   * 检查是否已登录
   * @returns boolean
   */
  const checkAuth = useCallback((): boolean => {
    return isAuthenticated && !!user;
  }, [isAuthenticated, user]);

  /**
   * 要求登录（显示提示并跳转）
   */
  const requireAuth = useCallback(
    (message?: string, redirectTo?: string) => {
      if (isAuthenticated && user) {
        return true;
      }

      toast({
        title: '需要登录',
        description: message || '请先登录后再使用此功能',
        variant: 'warning',
      });

      const currentPath = window.location.pathname;
      const redirect = redirectTo || currentPath;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
      return false;
    },
    [isAuthenticated, user, router]
  );

  return {
    withAuth, // 包装函数
    checkAuth, // 检查是否登录
    requireAuth, // 要求登录
    isAuthenticated, // 登录状态
    user, // 当前用户
  };
}

/**
 * 使用示例：
 *
 * // 在组件中
 * function MyComponent() {
 *   const { withAuth, requireAuth } = useProtectedAction();
 *
 *   // 方式1：包装函数
 *   const handleCreateRepo = withAuth(async () => {
 *     // 这里的代码只有在登录后才会执行
 *     await createRepository(...);
 *   }, {
 *     message: '创建仓库需要登录',
 *   });
 *
 *   // 方式2：手动检查
 *   const handleImportRepo = () => {
 *     if (!requireAuth('导入仓库需要登录')) {
 *       return;
 *     }
 *     // 执行导入逻辑
 *   };
 *
 *   return (
 *     <button onClick={handleCreateRepo}>创建仓库</button>
 *   );
 * }
 */
