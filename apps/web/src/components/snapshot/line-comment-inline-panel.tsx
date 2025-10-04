'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';
import { formatSmartTime } from '@/lib/utils/format-time';
import { Heart, Loader2, MessageCircle, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EmptyHint } from './empty-hint';

// Time constants in milliseconds
const TIME_MINUTE = 60000;
const TIME_HOUR = 3600000;
const TIME_DAY = 86400000;
const TIME_WEEK = 604800000;

// Number formatting thresholds
const NUM_THOUSAND = 1000;
const NUM_TEN_THOUSAND = 10000;

export interface LineCommentInlineData {
  filePath: string;
  lineNumber: number;
  repoOwnerId?: string; // 仓库所有者ID，用于标识楼主
  comments: Array<{
    id: string;
    content: string;
    author: string;
    authorId?: string;
    authorAvatar?: string;
    createdAt: string;
    likes?: number;
    isLiked?: boolean;
    replies?: Array<{
      id: string;
      content: string;
      author: string;
      authorId?: string;
      authorAvatar?: string;
      createdAt: string;
      likes?: number;
      isLiked?: boolean;
    }>;
  }>;
}

type CommentItem = LineCommentInlineData['comments'][number];
type ReplyItem = NonNullable<CommentItem['replies']>[number];
type PendingEntry = {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  authorId?: string;
  authorAvatar?: string;
  parentId?: string;
  replyTo?: string;
};

type ReplyTarget = null | {
  commentId: string;
  targetAuthor: string;
  targetId?: string | null;
};

const resolveAuthorName = (author: unknown, fallback = '匿名用户') => {
  if (typeof author === 'string' && author.trim()) return author;
  if (author && typeof author === 'object') {
    const obj = author as {
      username?: string;
      name?: string;
      nickname?: string;
    };
    return obj.username || obj.name || obj.nickname || fallback;
  }
  return fallback;
};

const resolveAuthorId = (author: unknown): string | undefined => {
  if (author && typeof author === 'object') {
    const obj = author as { id?: string };
    return obj.id;
  }
  return undefined;
};

const resolveAuthorAvatar = (
  payload: { authorAvatar?: string } & { author?: unknown }
) => {
  if (payload.authorAvatar) return payload.authorAvatar;
  const author = payload.author;
  if (author && typeof author === 'object') {
    const obj = author as { avatar?: string; image?: string };
    return obj.avatar || obj.image;
  }
  return undefined;
};

const createReplyItem = (payload: {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  likes?: number;
  isLiked?: boolean;
  authorId?: string;
  authorAvatar?: string;
  replyTo?: string;
}): ReplyItem => {
  const result: ReplyItem = {
    id: payload.id,
    content: payload.content,
    author: payload.author,
    createdAt: payload.createdAt,
    likes: payload.likes ?? 0,
    isLiked: payload.isLiked ?? false,
  };
  if (payload.authorId !== undefined) {
    result.authorId = payload.authorId;
  }
  if (payload.authorAvatar !== undefined) {
    (result as any).authorAvatar = payload.authorAvatar;
  }
  if (payload.replyTo !== undefined) {
    (result as any).replyTo = payload.replyTo;
  }
  return result;
};

const createCommentItem = (payload: {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  likes?: number;
  isLiked?: boolean;
  authorId?: string;
  replies?: ReplyItem[];
  authorAvatar?: string;
}): CommentItem => {
  const result: CommentItem = {
    id: payload.id,
    content: payload.content,
    author: payload.author,
    createdAt: payload.createdAt,
    likes: payload.likes ?? 0,
    isLiked: payload.isLiked ?? false,
  };
  if (payload.authorId !== undefined) {
    result.authorId = payload.authorId;
  }
  if (payload.replies !== undefined) {
    result.replies = [...payload.replies];
  }
  if (payload.authorAvatar !== undefined) {
    (result as any).authorAvatar = payload.authorAvatar;
  }
  return result;
};

export function LineCommentInlinePanel({
  data,
  snapshotId,
  commitSha,
  highlightCommentId,
  onUpdate,
}: {
  data: LineCommentInlineData;
  snapshotId: string;
  commitSha: string;
  highlightCommentId?: string | null;
  onUpdate: (updated: LineCommentInlineData) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [localData, setLocalData] = useState<LineCommentInlineData>(data);
  const pendingUpdateRef = useRef<LineCommentInlineData | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<ReplyTarget>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [highlightedCommentId, setHighlightedCommentId] = useState<
    string | null
  >(null);
  const commentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );
  const [pendingComments, setPendingComments] = useState<PendingEntry[]>([]);
  const [pendingReplies, setPendingReplies] = useState<
    Record<string, PendingEntry[]>
  >({});

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const replyRef = useRef<HTMLTextAreaElement | null>(null);

  const isLoggedIn = !!user?.id;

  const currentUserAvatar = useMemo(() => {
    if (user?.avatar) return user.avatar;
    if (!user?.id) return null;
    for (const comment of localData.comments || []) {
      const commentAvatar = (comment as any).authorAvatar as string | undefined;
      if (comment.authorId === user.id && commentAvatar) {
        return commentAvatar;
      }

      const replies = (comment as any).replies as
        | Array<{ authorId?: string; authorAvatar?: string }>
        | undefined;
      if (Array.isArray(replies)) {
        for (const reply of replies) {
          const replyAvatar = reply.authorAvatar;
          if (reply.authorId === user.id && replyAvatar) {
            return replyAvatar;
          }
        }
      }
    }

    return null;
  }, [user?.avatar, user?.id, localData.comments]);

  useEffect(() => {
    setLocalData(data);
  }, [data]);
  // 处理评论高亮闪烁
  useEffect(() => {
    if (highlightCommentId && localData.comments.length > 0) {
      // 检查是否存在该评论ID（主评论或次评论）
      let targetCommentId: string | null = null;
      let isReply = false;

      for (const comment of localData.comments) {
        if (comment.id === highlightCommentId) {
          targetCommentId = comment.id;
          break;
        }
        if (comment.replies?.some(reply => reply.id === highlightCommentId)) {
          targetCommentId = comment.id; // 主评论ID
          isReply = true;
          break;
        }
      }

      if (targetCommentId) {
        // 如果是次评论，需要先展开对应的主评论
        if (isReply) {
          setExpandedReplies(prev => new Set(prev).add(targetCommentId!));
        }

        setHighlightedCommentId(highlightCommentId);

        // 滚动到目标评论并居中显示
        setTimeout(() => {
          const targetElement = commentRefs.current[highlightCommentId];
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest',
            });
          }
        }, 100); // 稍微延迟确保DOM更新完成

        // 1秒后移除高亮
        const timer = setTimeout(() => {
          setHighlightedCommentId(null);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [highlightCommentId, localData.comments]);

  useEffect(() => {
    if (pendingUpdateRef.current) {
      onUpdate(pendingUpdateRef.current);
      pendingUpdateRef.current = null;
    }
  }, [localData, onUpdate]);

  const updateLocalData = useCallback(
    (updater: (prev: LineCommentInlineData) => LineCommentInlineData) => {
      setLocalData(prev => {
        const next = updater(prev);
        pendingUpdateRef.current = next;
        return next;
      });
    },
    []
  );

  const restoreLocalData = useCallback((snapshot: LineCommentInlineData) => {
    pendingUpdateRef.current = snapshot;
    setLocalData(snapshot);
  }, []);

  const formatTime = useCallback((dateString: string) => {
    return formatSmartTime(dateString);
  }, []);

  const formatCount = useCallback((value?: number) => {
    const num = Number(value ?? 0);
    if (Number.isNaN(num)) return '0';
    if (num >= NUM_TEN_THOUSAND)
      return `${(num / NUM_TEN_THOUSAND).toFixed(1).replace(/\.0$/, '')}万`;
    if (num >= NUM_THOUSAND)
      return `${(num / NUM_THOUSAND).toFixed(1).replace(/\.0$/, '')}k`;
    return `${num}`;
  }, []);

  const sorted = useMemo(() => {
    const normalized = (localData.comments || []).map(comment => {
      const commentAuthor = resolveAuthorName((comment as any).author);
      const commentAuthorId =
        comment.authorId ?? resolveAuthorId((comment as any).author);

      const mappedReplies = Array.isArray(comment.replies)
        ? comment.replies.map(reply => {
            const replyAuthor = resolveAuthorName(
              (reply as any).author,
              commentAuthor
            );
            const replyAuthorId =
              reply.authorId ?? resolveAuthorId((reply as any).author);
            const replyAvatar = resolveAuthorAvatar(reply as any);
            const replyTo =
              typeof (reply as any).replyTo === 'string'
                ? (reply as any).replyTo
                : undefined;

            return createReplyItem({
              id: reply.id,
              content: reply.content,
              author: replyAuthor,
              createdAt: reply.createdAt,
              likes: Number(reply.likes ?? 0),
              isLiked: !!reply.isLiked,
              ...(replyAuthorId ? { authorId: replyAuthorId } : {}),
              ...(replyAvatar ? { authorAvatar: replyAvatar } : {}),
              ...(replyTo ? { replyTo } : {}),
            });
          })
        : [];

      const sortedReplies = mappedReplies.sort(
        (ra, rb) =>
          new Date(ra.createdAt).getTime() - new Date(rb.createdAt).getTime()
      );

      const commentPayload: Parameters<typeof createCommentItem>[0] = {
        id: comment.id,
        content: comment.content,
        author: commentAuthor,
        createdAt: comment.createdAt,
        likes: Number(comment.likes ?? 0),
        isLiked: !!comment.isLiked,
        replies: sortedReplies,
        ...(commentAuthorId ? { authorId: commentAuthorId } : {}),
      };

      const commentAvatarResolved = resolveAuthorAvatar(comment as any);
      if (commentAvatarResolved) {
        Object.assign(commentPayload, { authorAvatar: commentAvatarResolved });
      }

      return createCommentItem({
        ...commentPayload,
      });
    });

    return normalized.sort((a, b) => {
      const diff = Number(b.likes ?? 0) - Number(a.likes ?? 0);
      if (diff !== 0) return diff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [localData.comments]);

  const handleSubmit = useCallback(async () => {
    if (!newComment.trim() || submitting) return;
    if (!isLoggedIn) {
      toast({ title: '请先登录', variant: 'destructive' });
      return;
    }

    const tempId = `temp:${Date.now()}`;
    const optimistic = {
      id: tempId,
      content: newComment.trim(),
      author: user?.username || '匿名用户',
      createdAt: new Date().toISOString(),
      ...(user?.id ? { authorId: user.id } : {}),
      ...(user?.avatar ? { authorAvatar: user.avatar } : {}),
    };
    setPendingComments(prev => [...prev, optimistic]);
    setNewComment('');
    setTimeout(() => textareaRef.current?.focus(), 0);

    setSubmitting(true);
    try {
      const { data: res } = await apiClient.post('/comments', {
        snapshotId,
        content: optimistic.content,
        anchorType: 'LINE',
        commitSha,
        filePath: localData.filePath,
        lineStart: localData.lineNumber,
        lineEnd: localData.lineNumber,
      });
      const responseAuthor =
        (res as any)?.author?.username ||
        (res as any)?.author?.name ||
        (res as any)?.authorName ||
        user?.username ||
        '匿名用户';
      const responseAuthorId =
        (res as any)?.author?.id || (res as any)?.authorId || user?.id;
      const responseAvatar =
        (res as any)?.authorAvatar ||
        (res as any)?.author?.avatar ||
        (res as any)?.author?.image ||
        user?.avatar ||
        null;

      const createdComment = createCommentItem({
        id: res.id,
        content: res.content,
        author: responseAuthor,
        createdAt: res.createdAt,
        ...(responseAuthorId ? { authorId: responseAuthorId } : {}),
        replies: [],
        ...(responseAvatar ? { authorAvatar: responseAvatar } : {}),
      });
      updateLocalData(prev => ({
        ...prev,
        comments: [...prev.comments, createdComment],
      }));
      setPendingComments(prev => prev.filter(c => c.id !== tempId));
    } catch (e: any) {
      setPendingComments(prev => prev.filter(c => c.id !== tempId));
      toast({
        title: '发布失败',
        description: e?.message,
        variant: 'destructive',
      });
    }

    setSubmitting(false);
  }, [
    newComment,
    submitting,
    isLoggedIn,
    toast,
    snapshotId,
    commitSha,
    localData.filePath,
    localData.lineNumber,
    updateLocalData,
    user?.username,
    user?.id,
    user?.avatar,
  ]);

  const handleReplyTarget = useCallback(
    (commentId: string, targetAuthor: string, targetId?: string | null) => {
      const isSame =
        replyingTo?.commentId === commentId &&
        replyingTo?.targetAuthor === targetAuthor &&
        replyingTo?.targetId === targetId;

      if (isSame) {
        setReplyingTo(null);
        setReplyText('');
        return;
      }

      setReplyingTo({ commentId, targetAuthor, targetId: targetId ?? null });
      setReplyText('');
      setTimeout(() => replyRef.current?.focus(), 0);
    },
    [replyingTo]
  );

  const handleReplySubmit = useCallback(async () => {
    const content = replyText.trim();
    if (!replyingTo || !content || submittingReply) return;
    if (!isLoggedIn) {
      toast({ title: '请先登录', variant: 'destructive' });
      return;
    }

    const { commentId: parentId, targetAuthor } = replyingTo;
    const tempId = `temp:${Date.now()}`;
    const optimistic: PendingEntry = {
      id: tempId,
      content,
      author: user?.username || '匿名用户',
      createdAt: new Date().toISOString(),
      parentId,
      replyTo: targetAuthor,
      ...(user?.id ? { authorId: user.id } : {}),
      ...(user?.avatar ? { authorAvatar: user.avatar } : {}),
    };
    setPendingReplies(prev => ({
      ...prev,
      [parentId]: [...(prev[parentId] || []), optimistic],
    }));
    setReplyText('');
    setSubmittingReply(parentId);

    try {
      const { data: res } = await apiClient.post('/comments', {
        snapshotId,
        content,
        anchorType: 'LINE',
        commitSha,
        filePath: localData.filePath,
        lineStart: localData.lineNumber,
        lineEnd: localData.lineNumber,
        parentId,
      });
      const responseAuthor =
        res.author || res.authorName || user?.username || '匿名用户';
      const responseAvatar =
        (res as any)?.authorAvatar ||
        (res as any)?.author?.avatar ||
        user?.avatar;
      const newReply = createReplyItem({
        id: res.id,
        content: res.content,
        author: responseAuthor,
        createdAt: res.createdAt,
        authorId: res.authorId ?? user?.id,
        ...(responseAvatar ? { authorAvatar: responseAvatar } : {}),
        replyTo: targetAuthor,
      });
      updateLocalData(prev => ({
        ...prev,
        comments: prev.comments.map(c =>
          c.id === parentId
            ? createCommentItem({
                ...c,
                replies: [...(c.replies || []), newReply],
              })
            : c
        ),
      }));
    } catch (e: any) {
      toast({
        title: '回复失败',
        description: e?.message,
        variant: 'destructive',
      });
    } finally {
      setSubmittingReply(null);
      setReplyingTo(null);
      setPendingReplies(prev => {
        const next = { ...prev };
        const list = next[parentId];
        if (!list) return next;
        const filtered = list.filter(r => r.id !== tempId);
        if (filtered.length > 0) {
          next[parentId] = filtered;
        } else {
          delete next[parentId];
        }
        return next;
      });
    }
  }, [
    replyText,
    replyingTo,
    submittingReply,
    isLoggedIn,
    toast,
    snapshotId,
    commitSha,
    localData.filePath,
    localData.lineNumber,
    updateLocalData,
    user?.username,
    user?.id,
    user?.avatar,
  ]);

  const handleLike = useCallback(
    async (commentId: string, isReply = false) => {
      const snapshot = localData;
      try {
        if (!isLoggedIn) {
          toast({ title: '请先登录', variant: 'destructive' });
          return;
        }
        if (likingIds.has(commentId)) return;
        setLikingIds(prev => new Set(prev).add(commentId));

        let parentId: string | null = null;
        let liked = false;
        let likes = 0;
        for (const c of localData.comments) {
          if (c.id === commentId && !isReply) {
            liked = !!c.isLiked;
            likes = Number(c.likes || 0);
            break;
          }
          if (isReply && c.replies) {
            const r = c.replies.find(x => x.id === commentId);
            if (r) {
              parentId = c.id;
              liked = !!r.isLiked;
              likes = Number(r.likes || 0);
              break;
            }
          }
        }

        const optimisticLikes = Math.max(0, likes + (liked ? -1 : 1));
        const optimistic = {
          ...localData,
          comments: localData.comments.map(c => {
            if (!isReply && c.id === commentId) {
              return { ...c, likes: optimisticLikes, isLiked: !liked };
            }
            if (isReply && c.id === parentId) {
              return {
                ...c,
                replies: (c.replies || []).map(r =>
                  r.id === commentId
                    ? { ...r, likes: optimisticLikes, isLiked: !liked }
                    : r
                ),
              };
            }
            return c;
          }),
        };
        updateLocalData(() => optimistic);

        const res = liked
          ? await apiClient.delete(`/comments/${commentId}/like`)
          : await apiClient.post(`/comments/${commentId}/like`);
        const serverLikes = Number(
          (res as any)?.data?.likesCount ?? optimisticLikes
        );
        const serverLiked = !!(res as any)?.data?.liked;
        const corrected = {
          ...optimistic,
          comments: optimistic.comments.map(c => {
            if (!isReply && c.id === commentId)
              return { ...c, likes: serverLikes, isLiked: serverLiked };
            if (isReply && c.id === parentId)
              return {
                ...c,
                replies: (c.replies || []).map(r =>
                  r.id === commentId
                    ? { ...r, likes: serverLikes, isLiked: serverLiked }
                    : r
                ),
              };
            return c;
          }),
        };
        updateLocalData(() => corrected as LineCommentInlineData);
      } catch (e: any) {
        restoreLocalData(snapshot);
        toast({
          title: '点赞失败',
          description: e?.message,
          variant: 'destructive',
        });
      } finally {
        setLikingIds(prev => {
          const s = new Set(prev);
          s.delete(commentId);
          return s;
        });
      }
    },
    [isLoggedIn, toast, likingIds, localData, updateLocalData, restoreLocalData]
  );

  const handleDelete = useCallback(
    async (commentId: string, isReply = false) => {
      const snapshot = localData;
      try {
        if (!isLoggedIn) {
          toast({ title: '请先登录', variant: 'destructive' });
          return;
        }
        if (!confirm('确认删除该评论？')) return;
        if (deletingIds.has(commentId)) return;
        setDeletingIds(prev => new Set(prev).add(commentId));

        const optimistic: LineCommentInlineData = {
          ...localData,
          comments: localData.comments
            .filter(c => (!isReply && c.id === commentId ? false : true))
            .map(c =>
              isReply
                ? {
                    ...c,
                    replies: (c.replies || []).filter(r => r.id !== commentId),
                  }
                : c
            ),
        };
        updateLocalData(() => optimistic);

        await apiClient.delete(`/comments/${commentId}`);
        toast({ title: '已删除' });
      } catch (e: any) {
        restoreLocalData(snapshot);
        toast({
          title: '删除失败',
          description: e?.message,
          variant: 'destructive',
        });
      } finally {
        setDeletingIds(prev => {
          const s = new Set(prev);
          s.delete(commentId);
          return s;
        });
      }
    },
    [
      isLoggedIn,
      toast,
      deletingIds,
      localData,
      updateLocalData,
      restoreLocalData,
    ]
  );

  const reactionButtonClass =
    'flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40';
  const subReactionButtonClass =
    'flex items-center gap-1 text-[12px] text-muted-foreground/80 hover:text-muted-foreground transition-colors disabled:opacity-40';
  const canDelete = useCallback(
    (authorId?: string | null, author?: string | null) => {
      if (user?.id && authorId) return user.id === authorId;
      if (user?.username && author) return user.username === author;
      return false;
    },
    [user?.id, user?.username]
  );

  const toggleRepliesExpansion = useCallback((commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  return (
    <div className="my-5 rounded-[26px] border border-border bg-card text-card-foreground shadow-lg backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
          <span className="text-[15px] font-semibold tracking-wide text-foreground">
            {data.filePath}
          </span>
          <span className="text-muted-foreground/70">
            第 {data.lineNumber} 行
          </span>
        </div>
      </div>

      <div
        className={`p-6 space-y-6 ${
          sorted.length > 5 ? 'max-h-[700px] overflow-y-auto' : ''
        }`}
      >
        {pendingComments.length > 0 && (
          <div className="space-y-4 opacity-70">
            {pendingComments.map(comment => (
              <div key={comment.id} className="flex gap-4">
                <Avatar className="h-11 w-11 shrink-0 rounded-full ring-2 ring-border bg-accent/10">
                  {comment.authorAvatar && (
                    <AvatarImage
                      src={comment.authorAvatar}
                      alt={comment.author}
                    />
                  )}
                  <AvatarFallback className="text-[13px] font-semibold text-foreground/85">
                    {comment.author.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <span className="text-[15px] font-semibold text-foreground">
                      {comment.author}
                    </span>
                    <span className="text-muted-foreground/70">
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  <div
                    className="mt-2 text-[16px] leading-relaxed tracking-wide text-foreground/90"
                    style={{
                      fontFamily:
                        '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
                    }}
                  >
                    {comment.content}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[12px] text-muted-foreground/70">
                    <Loader2 className="h-3 w-3 animate-spin" /> 正在发布...
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {sorted.length > 0 ? (
          <div className="space-y-6">
            {sorted.map(comment => (
              <div
                key={comment.id}
                ref={el => {
                  commentRefs.current[comment.id] = el;
                }}
                className={`flex gap-4 transition-all duration-500 ease-in-out ${
                  highlightedCommentId === comment.id
                    ? 'dark:bg-gray-800/40 bg-orange-50/80 rounded-lg p-3 -m-3'
                    : ''
                }`}
              >
                <Avatar className="h-11 w-11 shrink-0 rounded-full ring-2 ring-border shadow-md">
                  {comment.authorAvatar && (
                    <AvatarImage
                      src={(comment as any).authorAvatar}
                      alt={comment.author}
                    />
                  )}
                  <AvatarFallback className="text-[13px] font-semibold text-foreground/90">
                    {comment.author.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                    <span className="text-[16px] font-semibold text-foreground">
                      {comment.author}
                    </span>
                    <span className="text-muted-foreground/70">
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  <div
                    className="mt-2 text-[15px] leading-relaxed tracking-wide text-foreground/90"
                    style={{
                      fontFamily:
                        '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
                    }}
                  >
                    {comment.content}
                  </div>
                  <div className="mt-3 flex items-center gap-6">
                    <button
                      type="button"
                      className={reactionButtonClass}
                      onClick={() => void handleLike(comment.id, false)}
                      disabled={likingIds.has(comment.id)}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          comment.isLiked
                            ? 'fill-current text-destructive'
                            : 'text-muted-foreground'
                        }`}
                      />
                      <span>{formatCount(comment.likes)}</span>
                    </button>
                    <button
                      type="button"
                      className={reactionButtonClass}
                      onClick={() =>
                        handleReplyTarget(
                          comment.id,
                          comment.author,
                          comment.id
                        )
                      }
                      aria-label={
                        replyingTo?.commentId === comment.id
                          ? '收起回复框'
                          : `回复 ${comment.author}`
                      }
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>回复</span>
                    </button>
                    {canDelete(comment.authorId, comment.author) && (
                      <button
                        type="button"
                        className={reactionButtonClass}
                        onClick={() => void handleDelete(comment.id, false)}
                        disabled={deletingIds.has(comment.id)}
                        aria-label="删除评论"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {(pendingReplies[comment.id] || []).length > 0 && (
                    <div className="mt-4 space-y-3 border-l border-border pl-6">
                      {pendingReplies[comment.id]!.map(reply => (
                        <div key={reply.id} className="opacity-70">
                          <div className="flex items-center gap-2 text-[12px] text-muted-foreground/80">
                            <span className="font-semibold text-foreground">
                              {reply.author}
                            </span>
                            <span className="text-muted-foreground/70">
                              刚刚
                            </span>
                          </div>
                          <div
                            className="mt-1 text-[15px] leading-relaxed text-foreground/85"
                            style={{
                              fontFamily:
                                '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
                            }}
                          >
                            {reply.content}
                          </div>
                          <div className="mt-2 flex items-center gap-3 text-[12px] text-muted-foreground/70">
                            <Loader2 className="h-3 w-3 animate-spin" />{' '}
                            正在发布...
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {Array.isArray(comment.replies) &&
                    comment.replies.length > 0 && (
                      <div className="mt-6 space-y-6">
                        {(() => {
                          // 按点赞数排序次评论
                          const sortedReplies = [...comment.replies].sort(
                            (a, b) => (b.likes || 0) - (a.likes || 0)
                          );
                          const isExpanded = expandedReplies.has(comment.id);
                          const visibleReplies = isExpanded
                            ? sortedReplies
                            : sortedReplies.slice(0, 2);
                          const hasMore = sortedReplies.length > 2;

                          return (
                            <>
                              {visibleReplies.map(reply => (
                                <div
                                  key={reply.id}
                                  ref={el => {
                                    commentRefs.current[reply.id] = el;
                                  }}
                                  className={`flex gap-4 transition-all duration-500 ease-in-out ${
                                    highlightedCommentId === reply.id
                                      ? 'dark:bg-gray-800/40 bg-orange-50/80 rounded-lg p-3 -m-3'
                                      : ''
                                  }`}
                                >
                                  <Avatar className="h-11 w-11 shrink-0 rounded-full ring-2 ring-border shadow-md">
                                    {(reply as any)?.authorAvatar && (
                                      <AvatarImage
                                        src={(reply as any).authorAvatar}
                                        alt={reply.author}
                                      />
                                    )}
                                    <AvatarFallback className="text-[13px] font-semibold text-foreground/90">
                                      {reply.author.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                                      <span className="text-[16px] font-semibold text-foreground">
                                        {reply.author}
                                      </span>
                                      <span className="text-muted-foreground">
                                        ▶
                                      </span>
                                      <span className="text-[16px] font-semibold text-foreground">
                                        {comment.author}
                                      </span>
                                      <span className="text-muted-foreground/70">
                                        {formatTime(reply.createdAt)}
                                      </span>
                                    </div>
                                    <div
                                      className="mt-2 text-[15px] leading-relaxed tracking-wide text-foreground/90"
                                      style={{
                                        fontFamily:
                                          '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
                                      }}
                                    >
                                      {reply.content}
                                    </div>
                                    <div className="mt-3 flex items-center gap-6">
                                      <button
                                        type="button"
                                        className={reactionButtonClass}
                                        onClick={() =>
                                          void handleLike(reply.id, true)
                                        }
                                        disabled={likingIds.has(reply.id)}
                                      >
                                        <Heart
                                          className={`h-4 w-4 ${
                                            reply.isLiked
                                              ? 'fill-current text-destructive'
                                              : 'text-muted-foreground'
                                          }`}
                                        />
                                        <span>{formatCount(reply.likes)}</span>
                                      </button>
                                      <button
                                        type="button"
                                        className={reactionButtonClass}
                                        onClick={() =>
                                          handleReplyTarget(
                                            comment.id,
                                            reply.author,
                                            reply.id
                                          )
                                        }
                                        aria-label={`回复 ${reply.author}`}
                                      >
                                        <MessageCircle className="h-4 w-4" />
                                        <span>回复</span>
                                      </button>
                                      {canDelete(
                                        reply.authorId,
                                        reply.author
                                      ) && (
                                        <button
                                          type="button"
                                          className={reactionButtonClass}
                                          onClick={() =>
                                            void handleDelete(reply.id, true)
                                          }
                                          disabled={deletingIds.has(reply.id)}
                                          aria-label="删除回复"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {hasMore && (
                                <div className="ml-16">
                                  <button
                                    type="button"
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    style={{
                                      fontFamily:
                                        '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
                                    }}
                                    onClick={() =>
                                      toggleRepliesExpansion(comment.id)
                                    }
                                  >
                                    {isExpanded
                                      ? '收起'
                                      : `查看更多 (${sortedReplies.length - 2} 条)`}
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}

                  {replyingTo?.commentId === comment.id && (
                    <div className="mt-4 ml-2 rounded-[20px] border border-border bg-accent/5 px-5 py-4 shadow-sm">
                      <Textarea
                        ref={replyRef}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder={`回复 @${replyingTo?.targetAuthor || comment.author}:`}
                        className="min-h-[76px] resize-none border-none bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                        style={{
                          fontFamily:
                            '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
                        }}
                        onKeyDown={e => {
                          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                            e.preventDefault();
                            void handleReplySubmit();
                          }
                        }}
                      />
                      <div className="mt-3 flex items-center justify-end gap-4">
                        <button
                          type="button"
                          className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => {
                            setReplyText('');
                            setReplyingTo(null);
                          }}
                        >
                          取消
                        </button>
                        <Button
                          size="sm"
                          onClick={() => void handleReplySubmit()}
                          disabled={
                            !replyText.trim() || submittingReply === comment.id
                          }
                          className="h-9 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                        >
                          {submittingReply === comment.id && (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          发布
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyHint message={'暂无评论，来发表第一条吧'} />
        )}
      </div>

      <div className="border-t border-border px-6 py-5">
        <div className="flex gap-4">
          <Avatar className="h-11 w-11 shrink-0 rounded-full ring-2 ring-border bg-accent/10">
            {currentUserAvatar && (
              <AvatarImage
                src={currentUserAvatar}
                alt={user?.username || 'avatar'}
              />
            )}
            <AvatarFallback className="text-[13px] font-semibold text-foreground/90">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded-[22px] border border-border bg-accent/5 px-5 py-4 shadow-sm">
            <Textarea
              ref={textareaRef}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="说点什么吧... 支持 Ctrl/⌘ + Enter 快速发布"
              className="min-h-[90px] resize-none border-none bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{
                fontFamily:
                  '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
              }}
              onKeyDown={e => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  void handleSubmit();
                }
              }}
            />
            <div className="mt-3 flex items-center justify-end text-[12px] text-muted-foreground">
              <Button
                size="sm"
                onClick={() => void handleSubmit()}
                disabled={!newComment.trim() || submitting}
                className="h-9 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                {submitting && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                发布
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
