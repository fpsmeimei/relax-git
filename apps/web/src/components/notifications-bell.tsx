'use client';

import { cn } from '@/lib/utils';
import { apiClient } from '@/services/apiClient';
import { useNotificationsStore } from '@/stores/notifications-store';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, Bell, Inbox, Loader2, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { NotificationRow as NotificationRowComp } from './notification-row';

export function NotificationsBell({ className }: { className?: string }) {
  const { unreadCount, setUnreadCount, incrementUnread, syncUnreadCount } =
    useNotificationsStore();
  const [open, setOpen] = useState(false);

  // 过滤/分页状态
  const [tab, setTab] = useState<'unread' | 'all'>(() => {
    try {
      const v = localStorage.getItem('RG_NOTIFS_LAST_TAB');
      return v === 'all' ? 'all' : 'unread';
    } catch {
      return 'unread';
    }
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  // P3-1 轻量关键词过滤（本地前端）
  const [filterKeyword, setFilterKeyword] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  // P3-1 过滤后的结果
  const filteredItems = useMemo(() => {
    if (!filterKeyword.trim()) return items;
    const keyword = filterKeyword.toLowerCase().trim();
    return items.filter(item => {
      const content = (item.content || '').toLowerCase();
      const actorName = (item.actor?.username || '').toLowerCase();
      return content.includes(keyword) || actorName.includes(keyword);
    });
  }, [items, filterKeyword]);

  // 本地缓存：避免切换“仅未读/全部”时出现骨架闪烁
  const listCacheRef = useRef<{
    unread: { items: any[]; total: number };
    all: { items: any[]; total: number };
  }>({
    unread: { items: [], total: 0 },
    all: { items: [], total: 0 },
  });

  const [error, setError] = useState<string | null>(null);
  // P2-2 错误重试状态
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  // 滚动容器与“加载更多”追加时的滚动位置保持
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const appendMetricsRef = useRef<{
    scrollTop: number;
    scrollHeight: number;
  } | null>(null);
  const appendingRef = useRef(false);
  // 全部已读：API 提交中的加载态
  const [markAllLoading, setMarkAllLoading] = useState(false);

  // P2-2 错误重试策略：区分网络/服务器错误，自动重试一次
  const loadListWithRetry = useCallback(
    async (opts?: {
      append?: boolean;
      page?: number;
      reset?: boolean;
      isRetry?: boolean;
    }) => {
      const append = !!opts?.append;
      const pageNum = opts?.page ?? (append ? page + 1 : 1);
      const isRetry = !!opts?.isRetry;

      try {
        if (append) setLoadingMore(true);
        else setLoading(true);
        if (!isRetry) {
          setError(null);
          setRetryCount(0);
        }
        setIsRetrying(isRetry);

        const res = await apiClient.get(`/notifications`, {
          params: {
            page: pageNum,
            limit,
            ...(tab === 'unread' ? { isRead: false } : {}),
          },
        });
        const data = res.data || {};
        const list = Array.isArray(data.items) ? data.items : [];
        setTotal(Number(data.total || list.length || 0));

        if (append) {
          // P1-1 去重合并：加载更多时去重
          setItems(prev => {
            const existingIds = new Set(prev.map(item => item.id));
            const newItems = list.filter(
              (item: any) => !existingIds.has(item.id)
            );
            return [...prev, ...newItems];
          });
          setPage(pageNum);
        } else {
          // P1-1 去重合并：首次加载时与存在的实时数据去重
          setItems(prev => {
            if (opts?.reset || prev.length === 0) {
              return list;
            }
            // 合并新旧数据并去重
            const existingIds = new Set(prev.map(item => item.id));
            const newItems = list.filter(
              (item: any) => !existingIds.has(item.id)
            );
            const mergedItems = [...newItems, ...prev];
            // 按时间排序（新到旧）
            return mergedItems.sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime()
            );
          });
          setPage(pageNum);
          // 更新缓存（仅在非 append 的首次页加载时）
          const totalNum = Number(data.total || list.length || 0);
          if (tab === 'unread') {
            listCacheRef.current.unread = { items: list, total: totalNum };
            try {
              localStorage.setItem(
                'RG_NOTIFS_CACHE_UNREAD',
                JSON.stringify({ items: list, total: totalNum, ts: Date.now() })
              );
            } catch {}
          } else {
            listCacheRef.current.all = { items: list, total: totalNum };
            try {
              localStorage.setItem(
                'RG_NOTIFS_CACHE_ALL',
                JSON.stringify({ items: list, total: totalNum, ts: Date.now() })
              );
            } catch {}
          }
        }

        // 成功后清除错误状态
        setError(null);
        setRetryCount(0);
      } catch (err: any) {
        // P2-2 错误分类与重试策略
        const isNetworkError =
          !err?.response ||
          err?.code === 'NETWORK_ERROR' ||
          err?.message?.includes('fetch');
        const currentRetry = retryCount;

        if (!isRetry && currentRetry === 0 && isNetworkError) {
          // 网络错误且未重试过，等待 1 秒后自动重试一次
          setRetryCount(1);
          setTimeout(() => {
            void loadListWithRetry({ ...opts, isRetry: true });
          }, 1000);
          return;
        }

        // 设置错误信息
        if (isNetworkError) {
          setError('网络连接失败，请检查网络后重试');
        } else if (err?.response?.status >= 500) {
          setError('服务器错误，请稍后重试');
        } else {
          setError('加载失败，请重试');
        }

        if (!append) {
          setItems([]);
          setTotal(0);
          setPage(1);
        }
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
        setIsRetrying(false);
      }
    },
    [limit, page, tab, retryCount]
  );

  // 保持原 loadList 名称兼容
  const loadList = loadListWithRetry;

  // 在“加载更多”追加完成后恢复滚动位置，避免跳动
  useEffect(() => {
    if (!appendingRef.current || loadingMore) return;
    const el = listContainerRef.current;
    const m = appendMetricsRef.current;
    if (!el || !m) {
      appendingRef.current = false;
      appendMetricsRef.current = null;
      return;
    }
    requestAnimationFrame(() => {
      try {
        el.scrollTop = m.scrollTop;
      } finally {
        appendMetricsRef.current = null;
        appendingRef.current = false;
      }
    });
  }, [loadingMore, items.length]);
  // 实时插入：抽屉打开且 tab 匹配时，将新通知插入顶部并保持滚动位置
  useEffect(() => {
    if (!open) return;
    const handler = (ev: any) => {
      try {
        const n = ev?.detail?.n;
        if (!n) return;
        const matches =
          tab === 'all' || (tab === 'unread' && n?.isRead === false);
        if (!matches) return;
        const el = listContainerRef.current;
        const prevScrollTop = el?.scrollTop ?? 0;
        const prevScrollHeight = el?.scrollHeight ?? 0;
        const nearTop = (el?.scrollTop ?? 0) <= 8;

        setItems(prev => {
          // P1-1 去重合并：检查是否已存在相同 ID 的通知
          const exists = prev.some(item => item.id === n.id);
          if (exists) return prev;
          return [n, ...prev];
        });
        setTotal(t => t + 1);

        // 更新内存缓存，保持切换 tab 时一致
        try {
          if (tab === 'unread') {
            const prev = listCacheRef.current.unread;
            const exists = prev?.items?.some(item => item.id === n.id) ?? false;
            if (!exists) {
              listCacheRef.current.unread = {
                items: [n, ...(prev?.items ?? [])],
                total: (prev?.total ?? 0) + 1,
              };
            }
          } else {
            const prev = listCacheRef.current.all;
            const exists = prev?.items?.some(item => item.id === n.id) ?? false;
            if (!exists) {
              listCacheRef.current.all = {
                items: [n, ...(prev?.items ?? [])],
                total: (prev?.total ?? 0) + 1,
              };
            }
          }
        } catch {}

        // 维持阅读位置：非顶部时按高度差补偿 scrollTop
        requestAnimationFrame(() => {
          const el2 = listContainerRef.current;
          if (!el2) return;
          if (nearTop) return; // 置顶阅读者看到新通知
          const newHeight = el2.scrollHeight;
          el2.scrollTop = prevScrollTop + (newHeight - prevScrollHeight);
        });
      } catch {}
    };
    window.addEventListener('RG_NOTIFICATION_ARRIVED', handler as any);
    return () =>
      window.removeEventListener('RG_NOTIFICATION_ARRIVED', handler as any);
  }, [open, tab, limit]); // P1-2 修复 ESLint：包含所有依赖
  // P1-3 断线重连后的增量补拉：若抽屉开启且 tab 匹配，触发一次轻量刷新补拉
  useEffect(() => {
    if (!open) return;
    const reconnectHandler = () => {
      try {
        // 等待 500ms 让重连稳定，然后进行补担
        setTimeout(async () => {
          if (!open) return;
          try {
            const res = await apiClient.get(`/notifications`, {
              params: {
                page: 1,
                limit,
                ...(tab === 'unread' ? { isRead: false } : {}),
              },
            });
            const data = res.data || {};
            const list = Array.isArray(data.items) ? data.items : [];
            setItems(list);
            setTotal(Number(data.total || list.length || 0));
            setPage(1);
          } catch {
            // 忽略重连补拉失败
          }
        }, 500);
      } catch {}
    };
    window.addEventListener('RG_SOCKET_RECONNECTED', reconnectHandler as any);
    return () =>
      window.removeEventListener(
        'RG_SOCKET_RECONNECTED',
        reconnectHandler as any
      );
  }, [open, tab, limit]); // P1-2 修复 ESLint：移除 loadList 依赖，使用闭包内的实际参数

  // 触底自动加载（靠近底部自动触发“加载更多”，按钮兜底）
  useEffect(() => {
    if (!open) return;
    const el = listContainerRef.current;
    if (!el) return;

    const threshold = 64; // px，靠近底部阈值
    const onScroll = () => {
      try {
        if (loadingMore) return;
        if (items.length >= total) return;
        const distanceToBottom =
          el.scrollHeight - (el.scrollTop + el.clientHeight);
        if (distanceToBottom <= threshold) {
          // 记录追加前滚动指标，保持位置
          appendMetricsRef.current = {
            scrollTop: el.scrollTop,
            scrollHeight: el.scrollHeight,
          };
          appendingRef.current = true;
          void loadList({ append: true, page: page + 1 });
        }
      } catch {}
    };

    el.addEventListener('scroll', onScroll, { passive: true } as any);
    return () => {
      el.removeEventListener('scroll', onScroll as any);
    };
  }, [open, items.length, total, loadingMore, page, loadList]); // P1-2 修复 ESLint：包含 loadList 依赖

  // P1-2 多标签页未读数同步：监听 localStorage 变化事件作为备用方案
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      try {
        if (e.key === 'notifications-store' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.state?.unreadCount !== undefined) {
            const newCount = Number(parsed.state.unreadCount);
            if (newCount !== unreadCount) {
              syncUnreadCount(newCount);
            }
          }
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [unreadCount, syncUnreadCount]);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (v) {
      // 优先展示缓存，避免打开时闪烁（内存缓存优先，其次本地缓存）
      let cached =
        tab === 'unread'
          ? listCacheRef.current.unread
          : listCacheRef.current.all;

      if (cached.items.length === 0) {
        try {
          const key =
            tab === 'unread' ? 'RG_NOTIFS_CACHE_UNREAD' : 'RG_NOTIFS_CACHE_ALL';
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (
              parsed &&
              Array.isArray(parsed.items) &&
              typeof parsed.total === 'number'
            ) {
              const fresh =
                typeof parsed.ts === 'number'
                  ? Date.now() - parsed.ts < 60000
                  : false;
              if (fresh) {
                cached = { items: parsed.items, total: parsed.total };
              }
            }
          }
        } catch {}
      }

      if (cached.items.length > 0) {
        setItems(cached.items);
        setTotal(cached.total);
      }
      setPage(1);
      void loadList({ page: 1 });
    }
  };

  const markAllRead = async () => {
    if (markAllLoading) return;
    if (unreadCount <= 0 && (tab !== 'unread' || items.length === 0)) return;

    // 记录快照用于失败回滚（不提供撤销）
    const snapshot = { items: [...items], total, unread: unreadCount };

    // 乐观更新 UI
    setUnreadCount(0);
    if (tab === 'unread') {
      setItems([]);
      setTotal(0);
    } else {
      setItems(prev => prev.map(x => ({ ...x, isRead: true })));
    }

    setMarkAllLoading(true);
    try {
      await apiClient.patch(`/notifications/read-all`);
    } catch {
      // 失败回滚
      setUnreadCount(snapshot.unread);
      setItems(snapshot.items);
      setTotal(snapshot.total);
    } finally {
      setMarkAllLoading(false);
    }
  };

  const markOneRead = async (n: any) => {
    const id = n?.id as string;
    if (!id) return;

    // 乐观更新 UI
    incrementUnread(-1);
    if (tab === 'unread') {
      setItems(prev => prev.filter(x => x.id !== id));
      setTotal(t => Math.max(0, t - 1));
    } else {
      setItems(prev =>
        prev.map(x => (x.id === id ? { ...x, isRead: true } : x))
      );
    }

    try {
      await apiClient.post(`/notifications/read`, { ids: [id] });
    } catch {
      // 失败回滚
      if (tab === 'unread') {
        setItems(prev => [n, ...prev]);
        setTotal(t => t + 1);
      } else {
        setItems(prev =>
          prev.map(x => (x.id === id ? { ...x, isRead: false } : x))
        );
      }
      incrementUnread(1);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            'relative inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent',
            className
          )}
          aria-label="通知"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-foreground/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-[360px] max-w-[90vw] border-l bg-background shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
          <div className="flex items-center justify-between border-b p-4">
            <Dialog.Title className="text-sm font-semibold">通知</Dialog.Title>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center overflow-hidden rounded-md border text-xs"
                role="tablist"
                aria-label="通知筛选"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'unread'}
                  onClick={() => {
                    if (tab !== 'unread') {
                      const cached = listCacheRef.current.unread;
                      if (cached.items.length > 0) {
                        setItems(cached.items);
                        setTotal(cached.total);
                      } else {
                        setItems([]);
                        setTotal(0);
                      }
                      setTab('unread');
                      try {
                        localStorage.setItem('RG_NOTIFS_LAST_TAB', 'unread');
                      } catch {}
                      setPage(1);
                      void loadList({ page: 1 });
                    }
                  }}
                  className={cn(
                    'px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    tab === 'unread' ? 'bg-accent' : ''
                  )}
                >
                  仅未读
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'all'}
                  onClick={() => {
                    if (tab !== 'all') {
                      const cached = listCacheRef.current.all;
                      if (cached.items.length > 0) {
                        setItems(cached.items);
                        setTotal(cached.total);
                      } else {
                        setItems([]);
                        setTotal(0);
                      }
                      setTab('all');
                      try {
                        localStorage.setItem('RG_NOTIFS_LAST_TAB', 'all');
                      } catch {}
                      setPage(1);
                      void loadList({ page: 1 });
                    }
                  }}
                  className={cn(
                    'px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    tab === 'all' ? 'bg-accent' : ''
                  )}
                >
                  全部
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowFilter(!showFilter)}
                aria-label="过滤通知"
                className={cn(
                  'text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  showFilter && 'text-foreground'
                )}
              >
                <Search className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={markAllRead}
                disabled={markAllLoading}
                aria-label="全部设为已读"
                className="text-xs text-muted-foreground hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
              >
                {markAllLoading ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> 执行中…
                  </span>
                ) : (
                  '全部已读'
                )}
              </button>
              <Dialog.Close
                aria-label="关闭通知面板"
                className="text-xs text-muted-foreground hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                关闭
              </Dialog.Close>
            </div>
          </div>
          {/* P3-1 关键词过滤输入框 */}
          {showFilter && (
            <div className="border-b p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索通知内容或用户名..."
                  value={filterKeyword}
                  onChange={e => setFilterKeyword(e.target.value)}
                  className="w-full rounded border bg-background pl-7 pr-7 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                />
                {filterKeyword && (
                  <button
                    type="button"
                    onClick={() => setFilterKeyword('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="清除过滤"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              {filterKeyword && (
                <div className="mt-1 text-[10px] text-muted-foreground">
                  找到 {filteredItems.length} 条结果
                </div>
              )}
            </div>
          )}
          <div
            ref={listContainerRef}
            aria-busy={loadingMore}
            className={cn(
              'overflow-auto p-2',
              showFilter ? 'h-[calc(100%-49px-60px)]' : 'h-[calc(100%-49px)]'
            )}
          >
            {loading && !loadingMore && items.length === 0 ? (
              <div className="p-2 space-y-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  // P2-1 骨架优化：对齐真实 NotificationRow 的结构与行高
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-md p-3 hover:bg-accent/50 transition-colors"
                    style={{ minHeight: '72px' }} // 与真实通知行高一致
                  >
                    {/* 未读指示器 */}
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/30 animate-pulse" />

                    {/* 头像区域 */}
                    <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-muted/50 animate-pulse" />

                    {/* 内容区域 */}
                    <div className="min-w-0 flex-1 space-y-2">
                      {/* 用户名与操作类型 */}
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-16 rounded bg-muted/60 animate-pulse" />
                        <div className="h-3 w-12 rounded bg-muted/40 animate-pulse" />
                      </div>

                      {/* 评论内容 */}
                      <div className="space-y-1">
                        <div className="h-3 w-11/12 rounded bg-muted/40 animate-pulse" />
                        <div className="h-3 w-4/5 rounded bg-muted/30 animate-pulse" />
                      </div>

                      {/* 时间与操作按钮 */}
                      <div className="flex items-center justify-between">
                        <div className="h-2 w-20 rounded bg-muted/30 animate-pulse" />
                        <div className="h-6 w-12 rounded bg-muted/20 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div
                className="p-4 text-center text-xs text-red-600"
                role="status"
                aria-live="polite"
              >
                <div className="mx-auto inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-left text-red-700 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-400">
                  <AlertTriangle
                    className="h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{error}</span>
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => void loadList({ page: 1 })}
                    disabled={isRetrying}
                    aria-label="重试加载通知"
                    className="inline-flex items-center rounded border px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        重试中...
                      </>
                    ) : (
                      '重试'
                    )}
                  </button>
                </div>
              </div>
            ) : filteredItems.length === 0 && items.length > 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                <Search
                  className="mx-auto mb-2 h-6 w-6 opacity-60"
                  aria-hidden="true"
                />
                <div>未找到匹配的通知</div>
                <div className="mt-1 text-[11px] text-muted-foreground/80">
                  尝试其他关键词或清除过滤条件
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setFilterKeyword('')}
                    className="inline-flex items-center rounded border px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    清除过滤
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                <Inbox
                  className="mx-auto mb-2 h-6 w-6 opacity-60"
                  aria-hidden="true"
                />
                <div>暂无{tab === 'unread' ? '未读' : ''}通知</div>
                <div className="mt-1 text-[11px] text-muted-foreground/80">
                  参与评论、@他人或关注仓库活动以获取通知
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Dialog.Close asChild>
                    <Link
                      href="/repositories"
                      aria-label="前往仓库列表"
                      className="inline-flex items-center rounded border px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      去仓库
                    </Link>
                  </Dialog.Close>
                  <Dialog.Close asChild>
                    <Link
                      href="/community"
                      aria-label="前往社区"
                      className="inline-flex items-center rounded border px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      去社区
                    </Link>
                  </Dialog.Close>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredItems.map((n: any) => (
                  <NotificationRowComp
                    key={n.id}
                    n={n}
                    onNavigate={() => setOpen(false)}
                    onMarkRead={markOneRead}
                  />
                ))}
                {!filterKeyword && items.length < total && (
                  <div className="sticky bottom-0 bg-gradient-to-t from-background/70 to-transparent pt-2 text-center">
                    <button
                      type="button"
                      disabled={loadingMore}
                      aria-disabled={loadingMore}
                      aria-label={`加载更多通知（${items.length}/${total}）`}
                      onClick={() => {
                        const el = listContainerRef.current;
                        if (el) {
                          appendMetricsRef.current = {
                            scrollTop: el.scrollTop,
                            scrollHeight: el.scrollHeight,
                          };
                        }
                        appendingRef.current = true;
                        void loadList({ append: true, page: page + 1 });
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="mr-1 inline-block h-3 w-3 animate-spin" />
                          加载中…
                        </>
                      ) : (
                        <>
                          加载更多（{items.length}/{total}）
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
