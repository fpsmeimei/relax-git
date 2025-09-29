'use client';

import { cn } from '@/lib/utils';
import * as Dialog from '@radix-ui/react-dialog';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

function formatTimeDistance(d: Date): string {
  try {
    return formatDistanceToNow(d, { addSuffix: true, locale: zhCN });
  } catch {
    return '';
  }
}
function truncateText(s: string, max = 120): string {
  try {
    const t = (s ?? '').toString();
    return t.length > max ? `${t.slice(0, max)}…` : t;
  } catch {
    return '';
  }
}

function buildTitle(n: any, actor: string): string {
  const type = n?.type;
  switch (type) {
    case 'MENTION':
      return `${actor} 在评论中 @ 了你`;
    case 'COMMENT_REPLY':
      return `${actor} 回复了你`;
    case 'JOIN_REQUEST_APPROVED':
      return `${actor} 已通过你的加入申请`;
    case 'JOIN_REQUEST_REJECTED':
      return `${actor} 拒绝了你的加入申请`;
    default:
      return `${actor} 有新的动态`;
  }
}

function buildDescription(n: any): string {
  const content = (n?.content ?? '').toString().trim();
  if (!content) return '点击查看详情';
  return truncateText(content, 120);
}

export interface NotificationRowProps {
  n: any;
  onNavigate?: () => void;
  onMarkRead?: (n: any) => void;
  pending?: boolean;
}

export function NotificationRow({
  n,
  onNavigate,
  onMarkRead,
  pending,
}: NotificationRowProps) {
  const href = useMemo(() => {
    try {
      // 重定向到仓库详情页的分支标签页
      if (n?.repoId) {
        return `/repositories/${n.repoId}?tab=branches`;
      }
      // 如果只有snapshotId，尝试从中提取repoId（如果可能）
      if (n?.snapshotId) {
        // 暂时重定向到社区页面，后续可以改进为从快照ID查找仓库ID
        return `/community`;
      }
      return undefined;
    } catch {
      return n?.repoId
        ? `/repositories/${n.repoId}?tab=branches`
        : `/community`;
    }
  }, [n]);

  const actor = useMemo(() => n?.actor?.username ?? '有人', [n]);
  const title = useMemo(() => buildTitle(n, actor), [n, actor]);
  const description = useMemo(() => buildDescription(n), [n]);
  const createdAt = n?.createdAt ? new Date(n.createdAt) : undefined;

  const rowMain = (
    <div
      className={cn(
        'flex w-full items-start gap-3 rounded-md p-2 pr-16 transition-colors hover:bg-accent/70 focus-within:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        n?.isRead ? 'opacity-70' : ''
      )}
    >
      {!n?.isRead && (
        <div
          className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary ring-2 ring-background"
          aria-hidden="true"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="line-clamp-1 text-sm font-medium group-hover:underline">
          {title}
        </div>
        <div className="line-clamp-2 text-xs text-muted-foreground">
          {actor}：{description}
        </div>
        {createdAt && (
          <div className="mt-1 text-[10px] text-muted-foreground">
            {formatTimeDistance(createdAt)}
          </div>
        )}
      </div>
    </div>
  );

  const actions = (
    <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
      <div className="flex items-center gap-2">
        {href && (
          <span className="pointer-events-auto">
            <Dialog.Close asChild>
              <Link
                href={href}
                aria-label={`查看通知：${title}`}
                className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={e => {
                  onNavigate?.();
                }}
              >
                查看
              </Link>
            </Dialog.Close>
          </span>
        )}
        {!n?.isRead && (
          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onMarkRead?.(n);
            }}
            disabled={!!pending}
            aria-label={`设为已读：${title}`}
            className="pointer-events-auto inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] text-muted-foreground hover:bg-secondary disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {pending && <Loader2 className="h-3 w-3 animate-spin" />}
            设为已读
          </button>
        )}
        {n?.isRead && pending && (
          <Loader2 className="pointer-events-auto h-3 w-3 text-muted-foreground animate-spin" />
        )}
      </div>
    </div>
  );

  return (
    <div className="group relative" role="group">
      {href ? (
        <Dialog.Close asChild>
          <Link
            href={href}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={e => {
              onNavigate?.();
            }}
          >
            {rowMain}
          </Link>
        </Dialog.Close>
      ) : (
        rowMain
      )}
      {actions}
    </div>
  );
}
