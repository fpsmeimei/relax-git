'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useContactsStore } from '@/stores/contacts-store';
import { Bell, Check, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function FriendRequestsDrawer() {
  const [open, setOpen] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const {
    incomingRequests,
    outgoingRequests,
    requestsLoading,
    unreadRequestCount,
    loadFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useContactsStore();

  useEffect(() => {
    if (open) {
      void loadFriendRequests('ALL');
    }
  }, [open, loadFriendRequests]);

  const handleAccept = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      await acceptFriendRequest(requestId);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingIds(prev => new Set(prev).add(requestId));
    try {
      await rejectFriendRequest(requestId);
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="relative gap-1.5 rounded-full border border-border/50 bg-background/60 px-3"
          aria-label="查看好友申请"
        >
          <Bell className="h-4 w-4" />
          <span className="text-sm">好友申请</span>
          {unreadRequestCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium">
              {unreadRequestCount > 99 ? '99+' : unreadRequestCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="p-0 sm:max-w-md">
        <div className="flex h-full flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="text-lg">社交通知</SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              好友申请与处理记录
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {requestsLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-8">
                <section className="space-y-3">
                  <header>
                    <h3 className="text-sm font-semibold text-foreground">
                      收到的申请
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      及时处理新朋友的申请
                    </p>
                  </header>
                  {incomingRequests.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-muted/40 py-6 text-center text-sm text-muted-foreground">
                      暂无待处理的申请
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {incomingRequests.map(request => {
                        const isProcessing = processingIds.has(request.id);
                        const isPending = request.status === 'PENDING';

                        return (
                          <li
                            key={request.id}
                            className="rounded-lg border bg-card p-3 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="font-medium truncate">
                                  {request.fromUser?.username || '未知用户'}
                                </div>
                                {request.message && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {request.message}
                                  </p>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  {new Date(request.createdAt).toLocaleString(
                                    'zh-CN'
                                  )}
                                </div>
                              </div>
                              {!isPending && (
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                                    request.status === 'ACCEPTED'
                                      ? 'bg-green-500/10 text-green-600'
                                      : 'bg-gray-500/10 text-muted-foreground'
                                  }`}
                                >
                                  {request.status === 'ACCEPTED'
                                    ? '已通过'
                                    : '已拒绝'}
                                </span>
                              )}
                            </div>
                            {isPending && (
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => void handleAccept(request.id)}
                                  disabled={isProcessing}
                                  className="justify-center"
                                >
                                  {isProcessing && (
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  )}
                                  <Check className="mr-1 h-3 w-3" />
                                  通过
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => void handleReject(request.id)}
                                  disabled={isProcessing}
                                  className="justify-center"
                                >
                                  {isProcessing && (
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  )}
                                  <X className="mr-1 h-3 w-3" />
                                  拒绝
                                </Button>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                <section className="space-y-3">
                  <header>
                    <h3 className="text-sm font-semibold text-foreground">
                      发出的申请
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      查看你已发送的好友申请状态
                    </p>
                  </header>
                  {outgoingRequests.length === 0 ? (
                    <div className="rounded-lg border border-dashed bg-muted/40 py-6 text-center text-sm text-muted-foreground">
                      暂无发出的申请
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {outgoingRequests.map(request => (
                        <li
                          key={request.id}
                          className="rounded-lg border bg-card p-3 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="font-medium truncate">
                                {request.toUser?.username || '未知用户'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(request.createdAt).toLocaleString(
                                  'zh-CN'
                                )}
                              </div>
                            </div>
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${
                                request.status === 'PENDING'
                                  ? 'bg-yellow-500/10 text-yellow-600'
                                  : request.status === 'ACCEPTED'
                                    ? 'bg-green-500/10 text-green-600'
                                    : 'bg-gray-500/10 text-muted-foreground'
                              }`}
                            >
                              {request.status === 'PENDING'
                                ? '等待对方'
                                : request.status === 'ACCEPTED'
                                  ? '已通过'
                                  : '已拒绝'}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            )}
          </div>

          <div className="border-t bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
            小提示：好友通过申请后会自动添加到左侧列表，可立即开始私信。
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
