import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../auth-store';

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

beforeEach(() => {
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  localStorage.clear();
  
  // 重置 store 状态
  useAuthStore.setState({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isInitialized: false,
  });
});

describe('Auth Store', () => {
  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isInitialized).toBe(false);
    });
  });

  describe('login', () => {
    it('should set user on login', () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        uid: 'testuser',
        role: 'USER' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { login } = useAuthStore.getState();
      login(mockUser);

      const state = useAuthStore.getState();

      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should persist uid to localStorage', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        uid: 'testuser',
        role: 'USER' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { login } = useAuthStore.getState();
      login(mockUser);

      expect(localStorage.getItem('uid')).toBe('testuser');
    });
  });

  describe('logout', () => {
    it('should clear user state on logout', () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        uid: 'testuser',
        role: 'USER' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { login, logout } = useAuthStore.getState();
      login(mockUser);
      logout();

      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('should remove uid from localStorage', () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        uid: 'testuser',
        role: 'USER' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { login, logout } = useAuthStore.getState();
      login(mockUser);
      logout();

      expect(localStorage.getItem('uid')).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user data', () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        uid: 'testuser',
        role: 'USER' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { login, updateUser } = useAuthStore.getState();
      login(mockUser);

      updateUser({ username: 'updateduser' });

      const state = useAuthStore.getState();
      expect(state.user?.username).toBe('updateduser');
      expect(state.user?.uid).toBe('testuser'); // 其他字段保持不变
    });
  });

  describe('setLoading', () => {
    it('should update loading state', () => {
      const { setLoading } = useAuthStore.getState();

      setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('setInitialized', () => {
    it('should update initialized state', () => {
      const { setInitialized } = useAuthStore.getState();

      setInitialized(true);
      expect(useAuthStore.getState().isInitialized).toBe(true);

      setInitialized(false);
      expect(useAuthStore.getState().isInitialized).toBe(false);
    });
  });
});
