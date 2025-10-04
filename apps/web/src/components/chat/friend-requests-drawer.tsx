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
import { useChatFriendsStore } from '@/stores/chat-friends-store';
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
  } = useChatFriendsStore();

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
        <Button size="sm" variant="ghost" className="relative">
          <Bell className="h-4 w-4" />
          {unreadRequestCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium">
              {unreadRequestCount > 99 ? '99+' : unreadRequestCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>聊天室通知</SheetTitle>
          <SheetDescription>好友申请与处理记录</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {requestsLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!requestsLoading && (
            <>
              {/* 收到的申请 */}
              <div>
                <h3 className="text-sm font-semibold mb-3">收到的申请</h3>
                {incomingRequests.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    暂无待处理的申请
                  </div>
                ) : (
                  <div className="space-y-3">
                    {incomingRequests.map(request => {
                      const isProcessing = processingIds.has(request.id);
                      const isPending = request.status === 'PENDING';

                      return (
                        <div
                          key={request.id}
                          className="p-3 rounded-lg border bg-card space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="font-medium">
                                {request.fromUser?.username || '未知用户'}
                              </div>
                              {request.message && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {request.message}
                                </div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(request.createdAt).toLocaleString(
                                  'zh-CN'
                                )}
                              </div>
                            </div>
                            {!isPending && (
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  request.status === 'ACCEPTED'
                                    ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                    : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                                }`}
                              >
                                {request.status === 'ACCEPTED'
                                  ? '已通过'
                                  : '已拒绝'}
                              </span>
                            )}
                          </div>

                          {isPending && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => void handleAccept(request.id)}
                                disabled={isProcessing}
                                className="flex-1"
                              >
                                {isProcessing && (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                )}
                                <Check className="h-3 w-3 mr-1" />
                                通过
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void handleReject(request.id)}
                                disabled={isProcessing}
                                className="flex-1"
                              >
                                {isProcessing && (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                )}
                                <X className="h-3 w-3 mr-1" />
                                拒绝
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 发出的申请 */}
              <div>
                <h3 className="text-sm font-semibold mb-3">发出的申请</h3>
                {outgoingRequests.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    暂无发出的申请
                  </div>
                ) : (
                  <div className="space-y-3">
                    {outgoingRequests.map(request => (
                      <div
                        key={request.id}
                        className="p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium">
                              {request.toUser?.username || '未知用户'}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(request.createdAt).toLocaleString(
                                'zh-CN'
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                              request.status === 'PENDING'
                                ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                                : request.status === 'ACCEPTED'
                                  ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                  : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {request.status === 'PENDING'
                              ? '等待对方'
                              : request.status === 'ACCEPTED'
                                ? '已通过'
                                : '已拒绝'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
