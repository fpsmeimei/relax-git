import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Repository {
  id: string;
  name: string;
  description?: string;
  url: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INTERNAL';
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
}

export interface Snapshot {
  id: string;
  repositoryId: string;
  ownerId?: string;
  commitSha: string;
  branchName: string;
  status: 'QUEUED' | 'PROCESSING' | 'READY' | 'EXPIRED' | 'FAILED';
  title?: string;
  description?: string;
  worktreePath?: string;
  bundlePath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  // 当前选中的仓库
  currentRepository: Repository | null;

  // 当前选中的快照
  currentSnapshot: Snapshot | null;

  // 侧边栏状态
  sidebarOpen: boolean;

  // 主题设置
  theme: 'light' | 'dark' | 'system';

  // 简化的布局设置（学习项目版本）
  layout: {
    sidebarWidth: number;
  };

  // 简化的过滤器设置
  filters: {
    eventTypes: string[];
  };

  // 简化的动作（学习项目版本）
  setCurrentRepository: (repository: Repository | null) => void;
  setCurrentSnapshot: (snapshot: Snapshot | null) => void;

  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  updateLayout: (layout: Partial<AppState['layout']>) => void;
  updateFilters: (filters: Partial<AppState['filters']>) => void;
  resetFilters: () => void;
  reset: () => void;
}

// 简化的默认配置（学习项目版本）
const defaultLayout = {
  sidebarWidth: 300,
};

const defaultFilters = {
  eventTypes: [],
};

export const useAppStore = create<AppState>()(
  persist(
    immer(set => ({
      // 初始状态
      currentRepository: null,
      currentSnapshot: null,
      currentDiff: null,
      sidebarOpen: true,
      theme: 'system',
      layout: defaultLayout,
      filters: defaultFilters,

      // 设置当前仓库
      setCurrentRepository: repository => {
        set(state => {
          state.currentRepository = repository;
          // 切换仓库时清空当前快照
          state.currentSnapshot = null;
        });
      },

      // 设置当前快照
      setCurrentSnapshot: snapshot => {
        set(state => {
          state.currentSnapshot = snapshot;
        });
      },

      // 设置侧边栏状态
      setSidebarOpen: open => {
        set(state => {
          state.sidebarOpen = open;
        });
      },

      // 设置主题
      setTheme: theme => {
        set(state => {
          state.theme = theme;
        });
      },

      // 更新布局
      updateLayout: layoutUpdate => {
        set(state => {
          state.layout = { ...state.layout, ...layoutUpdate };
        });
      },

      // 更新过滤器
      updateFilters: filtersUpdate => {
        set(state => {
          state.filters = { ...state.filters, ...filtersUpdate };
        });
      },

      // 重置过滤器
      resetFilters: () => {
        set(state => {
          state.filters = defaultFilters;
        });
      },

      // 重置应用状态（用于用户切换）
      reset: () => {
        console.log('[app-store] 重置应用状态');
        set(state => {
          state.currentRepository = null;
          state.currentSnapshot = null;
          state.filters = defaultFilters;
          // 保留用户界面偏好设置（主题、布局等）
        });
      },
    })),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        layout: state.layout,
        filters: state.filters,
      }),
    }
  )
);

// 选择器
export const useCurrentRepository = () => {
  return useAppStore(state => state.currentRepository);
};

export const useCurrentSnapshot = () => {
  return useAppStore(state => state.currentSnapshot);
};

export const useSidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  return { sidebarOpen, setSidebarOpen };
};

export const useTheme = () => {
  const { theme, setTheme } = useAppStore();
  return { theme, setTheme };
};

export const useLayout = () => {
  const { layout, updateLayout } = useAppStore();
  return { layout, updateLayout };
};

export const useFilters = () => {
  const { filters, updateFilters, resetFilters } = useAppStore();
  return { filters, updateFilters, resetFilters };
};
