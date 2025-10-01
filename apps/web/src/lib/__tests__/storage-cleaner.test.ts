import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageCleaner } from '../storage-cleaner';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// 设置 global localStorage
beforeEach(() => {
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  localStorage.clear();
  vi.clearAllMocks();
});

describe('StorageCleaner', () => {
  describe('cleanInvalidAuth', () => {
    it('should not clean if no auth data exists', () => {
      const result = StorageCleaner.cleanInvalidAuth();
      expect(result).toBe(false);
    });

    it('should clean orphaned tokens', () => {
      localStorage.setItem('token', 'some-token');
      localStorage.setItem('refreshToken', 'some-refresh-token');

      const result = StorageCleaner.cleanInvalidAuth();

      expect(result).toBe(true);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('should clean incomplete auth-storage', () => {
      const incompleteAuth = JSON.stringify({
        state: { user: null, token: null },
      });
      localStorage.setItem('auth-storage', incompleteAuth);

      const result = StorageCleaner.cleanInvalidAuth();

      expect(result).toBe(true);
      expect(localStorage.getItem('auth-storage')).toBeNull();
    });

    it('should clean invalid token format', () => {
      const invalidAuth = JSON.stringify({
        state: {
          user: { id: '1', username: 'test' },
          token: 'invalid-token', // 不是 JWT 格式
        },
      });
      localStorage.setItem('auth-storage', invalidAuth);

      const result = StorageCleaner.cleanInvalidAuth();

      expect(result).toBe(true);
      expect(localStorage.getItem('auth-storage')).toBeNull();
    });

    it('should clean expired token', () => {
      // 创建一个过期的 JWT
      const expiredPayload = {
        exp: Math.floor(Date.now() / 1000) - 3600, // 1小时前过期
        sub: '123',
        username: 'test',
      };
      const base64Payload = btoa(JSON.stringify(expiredPayload));
      const expiredToken = `header.${base64Payload}.signature`;

      const authWithExpiredToken = JSON.stringify({
        state: {
          user: { id: '123', username: 'test' },
          token: expiredToken,
        },
      });
      localStorage.setItem('auth-storage', authWithExpiredToken);

      const result = StorageCleaner.cleanInvalidAuth();

      expect(result).toBe(true);
      expect(localStorage.getItem('auth-storage')).toBeNull();
    });

    it('should not clean valid token', () => {
      // 创建一个未过期的 JWT
      const validPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600, // 1小时后过期
        sub: '123',
        username: 'test',
      };
      const base64Payload = btoa(JSON.stringify(validPayload));
      const validToken = `header.${base64Payload}.signature`;

      const authWithValidToken = JSON.stringify({
        state: {
          user: { id: '123', username: 'test' },
          token: validToken,
        },
      });
      localStorage.setItem('auth-storage', authWithValidToken);

      const result = StorageCleaner.cleanInvalidAuth();

      expect(result).toBe(false);
      expect(localStorage.getItem('auth-storage')).not.toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should clear all auth keys', () => {
      localStorage.setItem('auth-storage', 'test');
      localStorage.setItem('token', 'test');
      localStorage.setItem('refreshToken', 'test');
      localStorage.setItem('other-key', 'should-remain');

      StorageCleaner.clearAll();

      expect(localStorage.getItem('auth-storage')).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('other-key')).toBe('should-remain');
    });
  });

  describe('needsCleanup', () => {
    it('should return false if no auth data', () => {
      expect(StorageCleaner.needsCleanup()).toBe(false);
    });

    it('should return true if token is expired', () => {
      const expiredPayload = {
        exp: Math.floor(Date.now() / 1000) - 100,
        sub: '123',
      };
      const base64Payload = btoa(JSON.stringify(expiredPayload));
      const expiredToken = `header.${base64Payload}.signature`;

      const auth = JSON.stringify({
        state: { user: {}, token: expiredToken },
      });
      localStorage.setItem('auth-storage', auth);

      expect(StorageCleaner.needsCleanup()).toBe(true);
    });

    it('should return false if token is valid', () => {
      const validPayload = {
        exp: Math.floor(Date.now() / 1000) + 3600,
        sub: '123',
      };
      const base64Payload = btoa(JSON.stringify(validPayload));
      const validToken = `header.${base64Payload}.signature`;

      const auth = JSON.stringify({
        state: { user: {}, token: validToken },
      });
      localStorage.setItem('auth-storage', auth);

      expect(StorageCleaner.needsCleanup()).toBe(false);
    });
  });
});
