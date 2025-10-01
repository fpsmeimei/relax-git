/**
 * 本地存储清理工具
 * 自动检测和清理过期或无效的认证数据
 */

export class StorageCleaner {
  private static readonly AUTH_KEYS = [
    'auth-storage',
    'token',
    'refreshToken',
  ];

  /**
   * 检查并清理无效的认证数据
   */
  static cleanInvalidAuth(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      // 1. 检查 auth-storage 是否存在
      const authStorage = localStorage.getItem('auth-storage');
      
      if (!authStorage) {
        // 如果 auth-storage 不存在，但有残留的 token，清理它们
        const hasToken = localStorage.getItem('token');
        const hasRefreshToken = localStorage.getItem('refreshToken');
        
        if (hasToken || hasRefreshToken) {
          console.warn('[StorageCleaner] 发现孤立的 token，正在清理...');
          this.clearAll();
          return true;
        }
        return false;
      }

      // 2. 解析 auth-storage
      const authData = JSON.parse(authStorage);
      const { state } = authData;

      // 3. 检查是否有用户和 token
      if (!state || !state.user || !state.token) {
        console.warn('[StorageCleaner] auth-storage 数据不完整，正在清理...');
        this.clearAll();
        return true;
      }

      // 4. 验证 token 格式（JWT 应该有三个部分）
      const token = state.token;
      if (typeof token === 'string') {
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.warn('[StorageCleaner] token 格式无效，正在清理...');
          this.clearAll();
          return true;
        }

        // 5. 检查 token 是否过期（可选，需要解析 JWT）
        try {
          const payloadPart = parts[1];
          if (!payloadPart) {
            console.warn('[StorageCleaner] token payload 部分缺失，正在清理...');
            this.clearAll();
            return true;
          }
          const payload = JSON.parse(atob(payloadPart));
          const exp = payload.exp;
          
          if (exp && exp * 1000 < Date.now()) {
            console.warn('[StorageCleaner] token 已过期，正在清理...');
            this.clearAll();
            return true;
          }
        } catch (e) {
          console.warn('[StorageCleaner] 无法解析 token，正在清理...');
          this.clearAll();
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('[StorageCleaner] 清理过程出错:', error);
      // 出错时清理所有数据，确保状态干净
      this.clearAll();
      return true;
    }
  }

  /**
   * 清理所有认证相关的本地存储
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return;

    this.AUTH_KEYS.forEach(key => {
      try {
        localStorage.removeItem(key);
        console.log(`[StorageCleaner] 已清理: ${key}`);
      } catch (e) {
        console.error(`[StorageCleaner] 清理 ${key} 失败:`, e);
      }
    });
  }

  /**
   * 在应用启动时自动清理
   */
  static autoCleanOnStartup(): void {
    if (typeof window === 'undefined') return;

    console.log('[StorageCleaner] 开始启动检查...');
    const cleaned = this.cleanInvalidAuth();
    
    if (cleaned) {
      console.log('[StorageCleaner] ✅ 已清理无效的认证数据');
    } else {
      console.log('[StorageCleaner] ✅ 认证数据有效');
    }
  }

  /**
   * 检查是否需要清理（供外部调用）
   */
  static needsCleanup(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (!authStorage) return false;

      const authData = JSON.parse(authStorage);
      const token = authData?.state?.token;
      
      if (!token) return true;

      // 检查 token 格式
      const parts = token.split('.');
      if (parts.length !== 3) return true;

      // 检查是否过期
      try {
        const payloadPart = parts[1];
        if (!payloadPart) return true;
        const payload = JSON.parse(atob(payloadPart));
        return payload.exp && payload.exp * 1000 < Date.now();
      } catch {
        return true;
      }
    } catch {
      return true;
    }
  }
}

// 导出便捷方法
export const cleanInvalidAuth = () => StorageCleaner.cleanInvalidAuth();
export const clearAllAuth = () => StorageCleaner.clearAll();
export const autoCleanOnStartup = () => StorageCleaner.autoCleanOnStartup();
