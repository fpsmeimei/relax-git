'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useContactsStore } from '@/stores/contacts-store';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Plus, Search, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

export function SearchUsersDialog() {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const {
    searchResults,
    searchLoading,
    searchKeyword,
    searchUsers,
    clearSearchResults,
    sendFriendRequest,
  } = useContactsStore();

  const handleSearch = (keyword: string) => {
    void searchUsers(keyword);
  };

  const handleSendRequest = async () => {
    if (!selectedUserId) return;

    setSending(true);
    try {
      await sendFriendRequest(selectedUserId, message.trim() || undefined);
      setSelectedUserId(null);
      setMessage('');
    } catch (err) {
      // 错误由 apiClient 统一处理
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    clearSearchResults();
    setSelectedUserId(null);
    setMessage('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={val => (val ? setOpen(true) : handleClose())}
    >
      <DialogTrigger
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary shadow-sm transition hover:bg-primary/25"
        aria-label="添加好友"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>搜索用户</DialogTitle>
          <DialogDescription>输入用户名搜索并发送好友申请</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户名..."
              value={searchKeyword}
              onChange={e => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {searchLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!searchLoading && searchKeyword && searchResults.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              未找到匹配的用户
            </div>
          )}

          {!searchLoading && searchResults.length > 0 && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {searchResults.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {user.username}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        ID: {user.id}
                      </div>
                    </div>
                  </div>

                  <div>
                    {user.status === 'friend' && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        已是好友
                      </span>
                    )}
                    {user.status === 'pendingOutgoing' && (
                      <span className="text-xs text-muted-foreground">
                        等待对方通过
                      </span>
                    )}
                    {user.status === 'pendingIncoming' && (
                      <span className="text-xs text-primary">请求通过你</span>
                    )}
                    {user.status === 'none' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        添加
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedUserId && (
            <div className="border-t pt-4 space-y-3">
              <div className="text-sm font-medium">发送好友申请</div>
              <Textarea
                placeholder="附加留言（可选）"
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                maxLength={200}
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => void handleSendRequest()}
                  disabled={sending}
                  className="flex-1"
                >
                  {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  发送申请
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedUserId(null);
                    setMessage('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
