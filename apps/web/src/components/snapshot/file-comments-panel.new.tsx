'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useAvatarSync } from '@/hooks/use-avatar-sync';
import { useToast } from '@/hooks/use-toast';
import { formatSmartTime } from '@/lib/utils/format-time';
import { apiClient } from '@/services/apiClient';
import { Heart, Loader2, Reply, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EmptyHint } from './empty-hint';
import { FeedbackBanner } from './feedback-banner';
import { LoadingHint } from './loading-hint';

interface FileCommentReply {
  id: string;
  content: string;
  author: string;
  authorId?: string;
  createdAt: string;
  likes?: number;
  isLiked?: boolean;
}

interface FileCommentItem {
  id: string;
  content: string;
  author: string;
  authorId?: string;
  createdAt: string;
  likes?: number;
  isLiked?: boolean;
  filePath?: string;
  lineStart?: number;
  replies?: FileCommentReply[];
}

export function FileCommentsPanel({
  snapshotId,
  commitSha,
  filePath,
}: {
  snapshotId: string;
  commitSha: string;
  filePath: string;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<FileCommentItem[]>([]);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoggedIn = !!user?.id;
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [pendingReplies, setPendingReplies] = useState<
    Record<string, FileCommentReply[]>
  >({});
  // 待发布（乐观）占位
  const [pendingItems, setPendingItems] = useState<
    Array<{ id: string; content: string; author: string; createdAt: string }>
  >([]);

  const replyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 使用头像同步 hook 获取最新头像
  const { currentAvatar, fetchLatestAvatar } = useAvatarSync(user?.avatar);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get<{ comments: any[] }>(
        `/comments/by-snapshot/${snapshotId}`,
        {
          params: {
            filePath,
            anchorType: 'FILE',
            page: 1,
            limit: 100,
          },
        }
      );
      const list: any[] = Array.isArray((data as any)?.comments)
        ? (data as any).comments
        : [];
      const mapped: FileCommentItem[] = list
        .filter((c: any) => !c.parentId)
        .map((c: any) => ({
          id: c.id,
          content: c.content,
          author: c.author?.username || '未知用户',
          authorId: c.authorId,
          createdAt: c.createdAt,
          likes: c._count?.likes ?? c.likes ?? 0,
          isLiked: !!c.liked,
          filePath: c.filePath,
          lineStart: c.lineStart,
          replies: Array.isArray(c.replies)
            ? c.replies.map((r: any) => ({
                id: r.id,
                content: r.content,
                author: r.author?.username || '未知用户',
                authorId: r.authorId,
                createdAt: r.createdAt,
                likes: r._count?.likes ?? r.likes ?? 0,
                isLiked: !!r.liked,
              }))
            : [],
        }));
      setItems(mapped);
    } catch (e: any) {
      setError(e?.message || '加载失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [snapshotId, filePath]);

  useEffect(() => {
    if (!filePath) return;
    void load();
  }, [filePath, load]);

  // 获取最新头像
  useEffect(() => {
    if (user) {
      fetchLatestAvatar();
    }
  }, [user, fetchLatestAvatar]);

  const formatTime = useCallback((s: string) => {
    return formatSmartTime(s);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!text.trim() || submitting) return;
    if (!isLoggedIn) {
      toast({ title: '请先登录', variant: 'destructive' });
      return;
    }
    const tempId = `temp:${Date.now()}`;
    const optimistic = {
      id: tempId,
      content: text.trim(),
      author: user?.username || '匿名用户',
      createdAt: new Date().toISOString(),
    };
    setPendingItems(prev => [...prev, optimistic]);
    setText('');
    setTimeout(() => textareaRef.current?.focus(), 0);

    try {
      setSubmitting(true);
      const { data } = await apiClient.post('/comments', {
        snapshotId,
        content: optimistic.content,
        anchorType: 'FILE',
        commitSha,
        filePath,
      });
      // 移除待发布占位，追加后端返回
      setPendingItems(prev => prev.filter(x => x.id !== tempId));
      const created: FileCommentItem = {
        id: (data as any)?.id,
        content: (data as any)?.content,
        author: user?.username || '匿名用户',
        authorId: user?.id,
        createdAt: (data as any)?.createdAt,
        likes: 0,
        isLiked: false,
        filePath,
        replies: [],
      };

      setItems(it => [...it, created]);
    } catch (e: any) {
      setPendingItems(prev => prev.filter(x => x.id !== tempId));
      toast({
        title: '发布失败',
        description: e?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    text,
    submitting,
    isLoggedIn,
    snapshotId,
    commitSha,
    filePath,
    toast,
    user?.username,
    user?.id,
  ]);

  const handleLike = useCallback(
    async (commentId: string, parentId?: string) => {
      try {
        if (!isLoggedIn) {
          toast({ title: '请先登录', variant: 'destructive' });
          return;
        }
        const targetKey = parentId ? `${parentId}-${commentId}` : commentId;
        if (likingIds.has(targetKey)) return;
        setLikingIds(prev => new Set(prev).add(targetKey));

        const parent = parentId
          ? items.find(it => it.id === parentId)
          : items.find(it => it.id === commentId);
        if (!parent) return;
        const target = parentId
          ? parent.replies?.find(r => r.id === commentId)
          : parent;
        if (!target) return;
        const liked = !!target.isLiked;
        const likes = Number(target.likes || 0);
        const optimisticLikes = Math.max(0, likes + (liked ? -1 : 1));

        setItems(prev =>
          prev.map(it =>
            it.id === (parentId ?? commentId)
              ? parentId
                ? {
                    ...it,
                    replies: (it.replies || []).map(r =>
                      r.id === commentId
                        ? {
                            ...r,
                            likes: optimisticLikes,
                            isLiked: !liked,
                          }
                        : r
                    ),
                  }
                : { ...it, likes: optimisticLikes, isLiked: !liked }
              : it
          )
        );

        const res = liked
          ? await apiClient.delete(`/comments/${commentId}/like`)
          : await apiClient.post(`/comments/${commentId}/like`);

        const serverLikes = Number(
          (res as any)?.data?.likesCount ?? optimisticLikes
        );
        const serverLiked = !!(res as any)?.data?.liked;

        setItems(prev =>
          prev.map(it =>
            it.id === (parentId ?? commentId)
              ? parentId
                ? {
                    ...it,
                    replies: (it.replies || []).map(r =>
                      r.id === commentId
                        ? {
                            ...r,
                            likes: serverLikes,
                            isLiked: serverLiked,
                          }
                        : r
                    ),
                  }
                : { ...it, likes: serverLikes, isLiked: serverLiked }
              : it
          )
        );
      } catch (e: any) {
        setItems(prev => [...prev]);
        toast({
          title: '点赞失败',
          description: e?.message,
          variant: 'destructive',
        });
      } finally {
        setLikingIds(prev => {
          const s = new Set(prev);
          const key = parentId ? `${parentId}-${commentId}` : commentId;
          s.delete(key);
          return s;
        });
      }
    },
    [isLoggedIn, toast, likingIds, items]
  );

  const handleReply = useCallback(
    async (parentId: string) => {
      if (!replyText.trim()) return;
      if (!isLoggedIn) {
        toast({ title: '请先登录', variant: 'destructive' });
        return;
      }

      const tempId = `temp:${Date.now()}`;
      const optimistic = {
        id: tempId,
        content: replyText.trim(),
        author: user?.username || '匿名用户',
        authorId: user?.id,
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      } satisfies FileCommentReply;

      setPendingReplies(prev => ({
        ...prev,
        [parentId]: [...(prev[parentId] || []), optimistic],
      }));
      setReplyText('');

      try {
        const { data } = await apiClient.post('/comments', {
          snapshotId,
          content: optimistic.content,
          anchorType: 'FILE',
          commitSha,
          filePath,
          parentId,
        });

        setPendingReplies(prev => {
          const list = [...(prev[parentId] || [])].filter(r => r.id !== tempId);
          if (list.length === 0) {
            const next = { ...prev } as Record<string, FileCommentReply[]>;
            delete next[parentId];
            return next;
          }
          return { ...prev, [parentId]: list };
        });

        const newReply: FileCommentReply = {
          id: (data as any)?.id,
          content: (data as any)?.content,
          author: user?.username || '匿名用户',
          authorId: user?.id,
          createdAt: (data as any)?.createdAt,
          likes: 0,
          isLiked: false,
        };

        setItems(prev =>
          prev.map(it =>
            it.id === parentId
              ? {
                  ...it,
                  replies: [...(it.replies || []), newReply],
                }
              : it
          )
        );
        setReplyingTo(null);
        toast({ title: '回复成功' });
      } catch (e: any) {
        setPendingReplies(prev => {
          const list = [...(prev[parentId] || [])].filter(r => r.id !== tempId);
          if (list.length === 0) {
            const next = { ...prev } as Record<string, FileCommentReply[]>;
            delete next[parentId];
            return next;
          }
          return { ...prev, [parentId]: list };
        });
        toast({
          title: '回复失败',
          description: e?.message,
          variant: 'destructive',
        });
      }
    },
    [
      replyText,
      isLoggedIn,
      toast,
      snapshotId,
      commitSha,
      filePath,
      user?.username,
      user?.id,
    ]
  );

  const handleDelete = useCallback(
    async (id: string, parentId?: string) => {
      const prevList = [...items];
      try {
        if (!isLoggedIn) {
          toast({ title: '请先登录', variant: 'destructive' });
          return;
        }
        if (!confirm('确认删除此评论？')) return;

        const key = parentId ? `${parentId}-${id}` : id;
        if (deletingIds.has(key)) return;
        setDeletingIds(prev => new Set(prev).add(key));

        if (parentId) {
          setItems(list =>
            list.map(it =>
              it.id === parentId
                ? {
                    ...it,
                    replies: (it.replies || []).filter(r => r.id !== id),
                  }
                : it
            )
          );
        } else {
          setItems(list => list.filter(x => x.id !== id));
        }

        await apiClient.delete(`/comments/${id}`);
        toast({ title: '已删除' });
      } catch (e: any) {
        setItems(prev => prevList);
        toast({
          title: '删除失败',
          description: e?.message,
          variant: 'destructive',
        });
      } finally {
        setDeletingIds(prev => {
          const s = new Set(prev);
          const key = parentId ? `${parentId}-${id}` : id;
          s.delete(key);
          return s;
        });
      }
    },
    [isLoggedIn, items, toast, deletingIds]
  );

  const sorted = useMemo(() => {
    return [...items]
      .map(comment => {
        const replies = Array.isArray(comment.replies)
          ? [...comment.replies].sort((ra, rb) => {
              const diff = Number(rb.likes ?? 0) - Number(ra.likes ?? 0);
              if (diff !== 0) return diff;
              return (
                new Date(ra.createdAt).getTime() -
                new Date(rb.createdAt).getTime()
              );
            })
          : [];

        return {
          ...comment,
          replies,
        };
      })
      .sort((a, b) => {
        const diff = Number(b.likes ?? 0) - Number(a.likes ?? 0);
        if (diff !== 0) return diff;
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
  }, [items]);

  if (!filePath) return null;

  return (
    <div className="mt-3 glass-panel p-2 text-card-foreground">
      <div className="glass-panel-header rounded-[26px] uppercase tracking-wide">
        文件评论
        <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent-foreground">
          Beta
        </span>
      </div>
      <div className="space-y-3 p-4">
        {loading ? (
          <LoadingHint message={'加载中...'} />
        ) : error ? (
          <FeedbackBanner
            variant="error"
            message={error}
            retryLabel="重试"
            onRetry={() => void load()}
          />
        ) : sorted.length > 0 || pendingItems.length > 0 ? (
          <div className="space-y-3">
            {pendingItems.length > 0 &&
              pendingItems.map(it => (
                <div
                  key={it.id}
                  className="flex gap-3 rounded-2xl border border-border bg-secondary p-3 opacity-70 backdrop-blur-lg"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-ring">
                    <AvatarFallback className="bg-accent/10 text-[10px] font-semibold text-foreground">
                      {it.author.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">
                      <span className="mr-2 font-semibold text-foreground">
                        {it.author}
                      </span>
                      <span
                        title={new Date(it.createdAt).toLocaleString('zh-CN', {
                          hour12: false,
                        })}
                      >
                        刚刚
                      </span>
                    </div>
                    <div className="my-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                      {it.content}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      正在发布...
                    </div>
                  </div>
                </div>
              ))}
            {sorted.map(it => (
              <div
                key={it.id}
                className="flex gap-3 rounded-3xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 elevated-shadow"
              >
                <Avatar className="h-9 w-9 ring-2 ring-ring">
                  <AvatarFallback className="bg-accent/10 text-[10px] font-semibold text-foreground">
                    {it.author.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">
                    <span className="mr-2 font-semibold text-foreground">
                      {it.author}
                    </span>
                    <span
                      title={new Date(it.createdAt).toLocaleString('zh-CN', {
                        hour12: false,
                      })}
                    >
                      {formatTime(it.createdAt)}
                    </span>
                  </div>
                  <div className="my-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {it.content}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-end gap-2 text-xs text-muted-foreground">
                    <Button
                      variant="soft"
                      size="sm"
                      className="h-7 px-3"
                      onClick={() => void handleLike(it.id)}
                      disabled={likingIds.has(it.id)}
                    >
                      <Heart
                        className={`mr-1 h-3 w-3 ${it.isLiked ? 'fill-current text-destructive' : 'text-muted-foreground'}`}
                      />
                      点赞 {Number(it.likes || 0)}
                    </Button>
                    <Button
                      variant="glow"
                      size="sm"
                      className="h-7 px-3"
                      onClick={() => {
                        setReplyingTo(p => (p === it.id ? null : it.id));
                        setReplyText('');
                        setTimeout(() => replyTextareaRef.current?.focus(), 0);
                      }}
                    >
                      <Reply className="mr-1 h-3 w-3" /> 回复
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 font-sans"
                      onClick={() => void handleDelete(it.id)}
                      disabled={deletingIds.has(it.id)}
                    >
                      删除
                    </Button>
                  </div>
                  {pendingReplies[it.id]?.length ? (
                    <div className="mt-3 space-y-2 opacity-70">
                      {pendingReplies[it.id]!.map(r => (
                        <div
                          key={r.id}
                          className="ml-10 rounded-2xl border border-border bg-secondary p-3 backdrop-blur-lg"
                        >
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {r.author}
                            </span>
                            <span>刚刚</span>
                          </div>
                          <div className="my-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                            {r.content}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin text-primary" />{' '}
                            正在发布...
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {Array.isArray(it.replies) && it.replies.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {it.replies.map(r => (
                        <div
                          key={r.id}
                          className="ml-10 rounded-2xl border border-border bg-secondary p-3 backdrop-blur-xl"
                        >
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">
                              {r.author}
                            </span>
                            <span
                              title={new Date(r.createdAt).toLocaleString(
                                'zh-CN',
                                {
                                  hour12: false,
                                }
                              )}
                            >
                              {formatTime(r.createdAt)}
                            </span>
                          </div>
                          <div className="my-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                            {r.content}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Button
                              variant="soft"
                              size="sm"
                              className="h-7 px-3"
                              onClick={() => void handleLike(r.id, it.id)}
                              disabled={likingIds.has(`${it.id}-${r.id}`)}
                            >
                              <Heart
                                className={`mr-1 h-3 w-3 ${r.isLiked ? 'fill-current text-destructive' : 'text-muted-foreground'}`}
                              />
                              点赞 {Number(r.likes || 0)}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-3 font-sans"
                              onClick={() => void handleDelete(r.id, it.id)}
                              disabled={deletingIds.has(`${it.id}-${r.id}`)}
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {replyingTo === it.id && (
                    <div className="mt-3">
                      <Textarea
                        ref={replyTextareaRef}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder={`回复 @${it.author}:`}
                        className="mb-2 min-h-[72px] rounded-2xl border border-border bg-accent/5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background"
                        onKeyDown={e => {
                          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                            e.preventDefault();
                            void handleReply(it.id);
                          }
                        }}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                        >
                          取消
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => void handleReply(it.id)}
                          disabled={!replyText.trim()}
                        >
                          <Send className="mr-1 h-3 w-3" /> 发布
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyHint message={'暂无评论'} />
        )}

        <div className="border-t border-border pt-4">
          <div className="flex gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-ring">
              {(currentAvatar || user?.avatar) && (
                <AvatarImage
                  src={currentAvatar || user?.avatar || ''}
                  alt={user?.username || 'avatar'}
                />
              )}
              <AvatarFallback className="bg-accent/10 text-[10px] font-semibold text-foreground">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="添加文件级评论... Ctrl/⌘+Enter 发表"
                className="mb-3 min-h-[96px] rounded-3xl border border-border bg-accent/5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-background"
                onKeyDown={e => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    void handleSubmit();
                  }
                }}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={() => void handleSubmit()}
                  disabled={!text.trim() || submitting}
                >
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Send className="mr-2 h-4 w-4" /> 发布评论
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
