'use client';

import { cn } from '@/lib/utils';
import * as Dialog from '@radix-ui/react-dialog';
import { formatSmartTime } from '@/lib/utils/format-time';
import { Loader2, MessageCircle, UserCheck, UserX, Bell } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function formatTimeDistance(d: Date): string {
  try {
    return formatSmartTime(d);
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

function getNotificationIcon(type: string) {
  switch (type) {
    case 'COMMENT_REPLY':
      return <MessageCircle className="h-3 w-3" />;
    case 'JOIN_REQUEST_APPROVED':
      return <UserCheck className="h-3 w-3" />;
    case 'JOIN_REQUEST_REJECTED':
      return <UserX className="h-3 w-3" />;
    default:
      return <Bell className="h-3 w-3" />;
  }
}

function getNotificationBgColor(type: string): string {
  switch (type) {
    case 'COMMENT_REPLY':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'JOIN_REQUEST_APPROVED':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    case 'JOIN_REQUEST_REJECTED':
      return 'bg-red-500/10 text-red-600 dark:text-red-400';
    default:
      return 'bg-primary/10 text-primary';
  }
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
  const actorAvatar = useMemo(() => n?.actor?.avatar, [n]);
  const title = useMemo(() => buildTitle(n, actor), [n, actor]);
  const description = useMemo(() => buildDescription(n), [n]);
  const createdAt = n?.createdAt ? new Date(n.createdAt) : undefined;
  const notificationType = n?.type ?? 'DEFAULT';

  const rowMain = (
    <div
      className={cn(
        'relative flex w-full items-start gap-3 rounded-lg p-3 pr-20 transition-all duration-200',
        'border border-transparent',
        !n?.isRead && 'bg-accent/30 border-accent',
        'hover:bg-accent/50 hover:border-accent/70 hover:shadow-sm',
        'focus-within:bg-accent/50 focus-within:border-accent/70 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1',
        n?.isRead && 'opacity-75 hover:opacity-100'
      )}
    >
      {/* 未读指示器 */}
      {!n?.isRead && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg"
          aria-hidden="true"
        />
      )}

      {/* 头像区域 */}
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
          <AvatarImage src={actorAvatar || undefined} alt={actor} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-sm font-semibold">
            {actor.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {/* 通知类型图标徽章 */}
        <div
          className={cn(
            'absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center shadow-sm border-2 border-background',
            getNotificationBgColor(notificationType)
          )}
        >
          {getNotificationIcon(notificationType)}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="min-w-0 flex-1 space-y-1">
        {/* 标题 */}
        <div className="flex items-center gap-2">
          <div className="line-clamp-1 text-sm font-semibold text-foreground group-hover:underline">
            {title}
          </div>
          {!n?.isRead && (
            <span className="shrink-0 h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </div>

        {/* 描述 */}
        <div className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {description}
        </div>

        {/* 时间 */}
        {createdAt && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
            <span>{formatTimeDistance(createdAt)}</span>
          </div>
        )}
      </div>
    </div>
  );

  const actions = (
    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
      <div className="flex items-center gap-2">
        {href && (
          <span className="pointer-events-auto">
            <Dialog.Close asChild>
              <Link
                href={href}
                aria-label={`查看通知：${title}`}
                className="inline-flex items-center gap-1 rounded-md bg-primary/90 px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onClick={e => {
                  onNavigate?.();
                }}
              >
                查看详情
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
            className="pointer-events-auto inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm hover:bg-accent hover:text-foreground disabled:opacity-60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {pending && <Loader2 className="h-3 w-3 animate-spin" />}
            {!pending && '标记已读'}
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
