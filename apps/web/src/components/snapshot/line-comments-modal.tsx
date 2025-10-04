'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/hooks/use-auth';
import { formatSmartTime } from '@/lib/utils/format-time';
import {
  ChevronDown,
  ChevronUp,
  Heart,
  Loader2,
  MessageCircle,
  Reply,
  Send,
  Trash2,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

// 简单 Markdown 渲染器 + 防止XSS攻击
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeUrl(url: string): string | null {
  const t = url.trim();
  if (/^https?:\/\//i.test(t)) return t;
  return null;
}

function mdToHtmlBasic(src: string): string {
  if (!src) return '';
  // 预处理代码块
  const blocks: string[] = [];
  let text = String(src);
  text = text.replace(/```([\s\S]*?)```/g, (_m, code) => {
    const escaped = escapeHtml(String(code));
    const token = `@@CODE_BLOCK_${blocks.length}@@`;
    blocks.push(
      `<pre class="rounded-md border bg-muted/30 p-2 overflow-auto"><code>${escaped}</code></pre>`
    );
    return token;
  });

  // 转义HTML防止XSS
  text = escapeHtml(text);

  // 行内代码
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 粗体和斜体处理
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');

  // 链接处理（仅http/https）
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
    const safe = sanitizeUrl(String(url));
    return safe
      ? `<a href="${safe}" target="_blank" rel="noopener noreferrer" class="underline">${label}</a>`
      : label;
  });

  // 处理列表
  const lines = text.split('\n');
  const out: string[] = [];
  let inUl = false;
  let inOl = false;

  const flush = () => {
    if (inUl) {
      out.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      out.push('</ol>');
      inOl = false;
    }
  };

  for (const line of lines) {
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);

    if (ul) {
      if (!inUl) {
        flush();
        out.push('<ul class="list-disc pl-5 my-2">');
        inUl = true;
      }
      out.push(`<li>${ul[1]}</li>`);
      continue;
    }

    if (ol) {
      if (!inOl) {
        flush();
        out.push('<ol class="list-decimal pl-5 my-2">');
        inOl = true;
      }
      out.push(`<li>${ol[1]}</li>`);
      continue;
    }

    flush();
    if (line.trim().length === 0) out.push('<br/>');
    else out.push(`<p>${line}</p>`);
  }

  flush();
  let html = out.join('\n');

  // 恢复代码块
  blocks.forEach((h, i) => {
    html = html.replace(`@@CODE_BLOCK_${i}@@`, h);
  });

  return html;
}

interface LineCommentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commentData: {
    filePath: string;
    lineNumber: number;
    comments: Array<{
      id: string;
      content: string;
      author: string;
      createdAt: string;
      likes?: number;
      isLiked?: boolean;
      replies?: Array<{
        id: string;
        content: string;
        author: string;
        createdAt: string;
        likes?: number;
        isLiked?: boolean;
      }>;
    }>;
  };
  snapshotId: string;
  commitSha: string;
  autoFocusOnOpen?: boolean;
  onCommentsUpdate?: (
    updatedData: LineCommentsModalProps['commentData']
  ) => void;
}

export function LineCommentsModal({
  open,
  onOpenChange,
  commentData,
  snapshotId,
  commitSha,
  autoFocusOnOpen,
  onCommentsUpdate,
}: LineCommentsModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  // 提交函数引用，避免在键盘处理器中“在赋值前使用变量”
  const submitCommentRef = useRef<() => void>(() => {});
  const submitReplyRef = useRef<(id: string) => void>(() => {});

  useEffect(() => {
    if (open && autoFocusOnOpen) {
      // 等待下一帧再聚焦DOM元素
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [open, autoFocusOnOpen]);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const [submitting, setSubmitting] = useState(false);
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);
  // 点赞中的评论ID集合，避免重复点击
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());
  // --- @提及 自动补全相关状态 ---
  const [repoIdState, setRepoIdState] = useState<string | null>(null);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionFor, setMentionFor] = useState<'main' | 'reply'>('main');
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionList, setMentionList] = useState<
    Array<{ id: string; username: string; avatar?: string }>
  >([]);
  const [mentionStartMain, setMentionStartMain] = useState<number | null>(null);
  const [mentionStartReply, setMentionStartReply] = useState<number | null>(
    null
  );

  // 评论/回复长度限制
  const MAX_COMMENT_LEN = 1000;

  // 获取仓库可见性和用户成员状态
  const [repoVisibility, setRepoVisibility] = useState<
    'PUBLIC' | 'INTERNAL' | 'PRIVATE' | null
  >(null);
  const [isRepoMember, setIsRepoMember] = useState<boolean>(false);
  const [gateLoading, setGateLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setGateLoading(true);
        const { data } = await apiClient.get<any>(`/snapshots/${snapshotId}`);
        const repo = (data as any)?.repository;
        const repoId = (data as any)?.repoId || repo?.id;
        const visibility =
          (repo?.visibility as 'PUBLIC' | 'INTERNAL' | 'PRIVATE' | undefined) ||
          null;
        setRepoVisibility(visibility);
        if (repoId) setRepoIdState(String(repoId));
        if (repoId) {
          try {
            const resp = await apiClient.get<{ status: string }>(
              `/repositories/${repoId}/join-requests/me`
            );
            const s = String(
              (resp as any)?.data?.status || 'none'
            ).toLowerCase();
            const role = (resp as any)?.data?.role as
              | 'OWNER'
              | 'ADMIN'
              | 'MEMBER'
              | undefined;
            const isOwner =
              !!user?.id &&
              (repo?.owner?.id === user.id ||
                (repo as any)?.ownerId === user.id);
            const isMemberByRole =
              role === 'OWNER' || role === 'ADMIN' || role === 'MEMBER';
            setIsRepoMember(s === 'member' || isMemberByRole || isOwner);
          } catch {
            const isOwner =
              !!user?.id &&
              (repo?.owner?.id === user.id ||
                (repo as any)?.ownerId === user.id);
            setIsRepoMember(isOwner);
          }
        }
      } finally {
        setGateLoading(false);
      }
    })();
  }, [open, snapshotId, user?.id]);

  const isLoggedIn = !!user?.id;
  const canComment =
    repoVisibility === 'PUBLIC'
      ? isLoggedIn
      : repoVisibility === 'INTERNAL' || repoVisibility === 'PRIVATE'
        ? isRepoMember && isLoggedIn
        : false;

  const commentBlockReason = !canComment
    ? repoVisibility === 'PUBLIC'
      ? '请先登录后评论'
      : repoVisibility === 'INTERNAL'
        ? '仅仓库成员可评论'
        : repoVisibility === 'PRIVATE'
          ? '私有仓库仅成员可评论'
          : undefined
    : undefined;

  // --- @提及：检测当前输入是否处于 @mention 上下文 ---
  const detectMentionContext = useCallback(
    (text: string, caret: number): { start: number; query: string } | null => {
      try {
        const before = text.slice(0, caret);
        const at = before.lastIndexOf('@');
        if (at < 0) return null;
        // @ 前要么是开头，要么是空白字符
        if (at > 0 && /[^\s]/.test(before.charAt(at - 1))) return null;
        const after = before.slice(at + 1);
        // 关键字由字母/数字/下划线组成
        const m = after.match(/^[A-Za-z0-9_]+$/);
        if (!m) return null;
        return { start: at, query: after };
      } catch {
        return null;
      }
    },
    []
  );

  // --- @提及：搜索成员（300ms 防抖） ---
  useEffect(() => {
    if (!mentionOpen || !repoIdState) return;
    if (!mentionQuery) {
      setMentionList([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const { data } = await apiClient.get<any>(
          `/repositories/${repoIdState}/members`,
          { params: { search: mentionQuery, limit: 8 } }
        );
        const items = Array.isArray((data as any)?.items)
          ? (data as any).items
          : Array.isArray((data as any)?.members)
            ? (data as any).members
            : [];
        const mapped = items
          .map((x: any) => ({
            id: String(x?.user?.id ?? x?.id ?? ''),
            username: String(x?.user?.username ?? x?.username ?? ''),
            avatar: x?.user?.avatar ?? x?.avatar,
          }))
          .filter(
            (x: { id: string; username: string; avatar?: string }) =>
              !!x.username
          );
        setMentionList(mapped);
        setMentionIndex(0);
      } catch {
        setMentionList([]);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [mentionOpen, mentionQuery, repoIdState]);

  const closeMention = useCallback(() => {
    setMentionOpen(false);
    setMentionQuery('');
    setMentionIndex(0);
    setMentionList([]);
  }, []);

  const applyMention = useCallback(
    (username: string) => {
      try {
        if (mentionFor === 'main') {
          const el = textareaRef.current;
          const caret = el?.selectionStart ?? newComment.length;
          const start = mentionStartMain ?? -1;
          if (start >= 0) {
            const prefix = newComment.slice(0, start);
            const suffix = newComment.slice(caret);
            const inserted = `@${username} `;
            const next = prefix + inserted + suffix;
            setNewComment(next);
            setTimeout(() => {
              const pos = (prefix + inserted).length;
              try {
                el?.setSelectionRange(pos, pos);
              } catch {}
              el?.focus();
            }, 0);
          }
        } else {
          const el = replyTextareaRef.current;
          const caret = el?.selectionStart ?? replyText.length;
          const start = mentionStartReply ?? -1;
          if (start >= 0) {
            const prefix = replyText.slice(0, start);
            const suffix = replyText.slice(caret);
            const inserted = `@${username} `;
            const next = prefix + inserted + suffix;
            setReplyText(next);
            setTimeout(() => {
              const pos = (prefix + inserted).length;
              try {
                el?.setSelectionRange(pos, pos);
              } catch {}
              el?.focus();
            }, 0);
          }
        }
      } finally {
        closeMention();
      }
    },
    [
      mentionFor,
      newComment,
      replyText,
      mentionStartMain,
      mentionStartReply,
      closeMention,
    ]
  );

  // --- 主评论输入：处理 @ 提及 ---
  const onMainInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const v = e.target.value;
      setNewComment(v);
      const caret = e.target.selectionStart ?? v.length;
      const ctx = detectMentionContext(v, caret);
      if (ctx) {
        setMentionFor('main');
        setMentionStartMain(ctx.start);
        setMentionQuery(ctx.query);
        setMentionOpen(true);
      } else if (mentionFor === 'main') {
        closeMention();
        setMentionStartMain(null);
      }
    },
    [detectMentionContext, mentionFor, closeMention]
  );

  const onMainInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (mentionOpen && mentionFor === 'main') {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const n = mentionList.length;
          if (n > 0) {
            const delta = e.key === 'ArrowDown' ? 1 : -1;
            setMentionIndex(i => (i + delta + n) % n);
          }
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          const chosen = mentionList[mentionIndex];
          if (chosen) applyMention(chosen.username);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          closeMention();
          return;
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        submitCommentRef.current();
      }
    },
    [
      mentionOpen,
      mentionFor,
      mentionList,
      mentionIndex,
      applyMention,
      closeMention,
    ]
  );

  // --- 回复输入：处理 @ 提及 ---
  const onReplyInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const v = e.target.value;
      setReplyText(v);
      const caret = e.target.selectionStart ?? v.length;
      const ctx = detectMentionContext(v, caret);
      if (ctx) {
        setMentionFor('reply');
        setMentionStartReply(ctx.start);
        setMentionQuery(ctx.query);
        setMentionOpen(true);
      } else if (mentionFor === 'reply') {
        closeMention();
        setMentionStartReply(null);
      }
    },
    [detectMentionContext, mentionFor, closeMention]
  );

  const onReplyInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>, parentCommentId: string) => {
      if (mentionOpen && mentionFor === 'reply') {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const n = mentionList.length;
          if (n > 0) {
            const delta = e.key === 'ArrowDown' ? 1 : -1;
            setMentionIndex(i => (i + delta + n) % n);
          }
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          const chosen = mentionList[mentionIndex];
          if (chosen) applyMention(chosen.username);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          closeMention();
          return;
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        submitReplyRef.current(parentCommentId);
      }
    },
    [
      mentionOpen,
      mentionFor,
      mentionList,
      mentionIndex,
      applyMention,
      closeMention,
    ]
  );

  // 打开弹窗时，若主楼缺少 replies/likes/liked，则补全详情
  useEffect(() => {
    if (!open) return;
    if (!commentData?.comments?.length) return;
    (async () => {
      try {
        const needFetchIds = commentData.comments
          .filter(
            c =>
              c &&
              (c.replies === undefined ||
                c.likes === undefined ||
                c.isLiked === undefined)
          )
          .map(c => c.id);
        if (needFetchIds.length === 0) return;
        const results = await Promise.all(
          needFetchIds.map(id =>
            apiClient
              .get(`/comments/${id}`)
              .then(res => ({ id, data: res.data }))
              .catch(() => ({ id, data: null }))
          )
        );
        const enriched = commentData.comments.map(c => {
          const found = results.find(r => r.id === c.id)?.data;
          if (!found) return c;
          return {
            ...c,
            likes: Number(
              found.likesCount ?? found._count?.likes ?? c.likes ?? 0
            ),
            isLiked: !!found.liked || c.isLiked,
            replies: Array.isArray(found.replies)
              ? found.replies.map((r: any) => ({
                  id: r.id,
                  content: r.content,
                  author: r.author?.username || '未知用户',
                  createdAt: r.createdAt,
                  likes: Number(r.likesCount ?? r._count?.likes ?? 0),
                  isLiked: !!r.liked,
                }))
              : (c.replies ?? []),
          } as any;
        });
        onCommentsUpdate?.({ ...commentData, comments: enriched });
      } catch {
        // 忽略补全失败
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, commentData?.comments?.length]);

  // 切换评论展开状态
  const toggleCommentExpanded = useCallback((commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  // 提交评论
  const handleSubmitComment = useCallback(async () => {
    if (!newComment.trim() || submitting) return;

    try {
      if (!canComment) {
        toast({
          title: '无法评论',
          description: commentBlockReason || '权限不足',
          variant: 'destructive',
        });
        return;
      }

      setSubmitting(true);
      const { data } = await apiClient.post('/comments', {
        snapshotId,
        content: newComment.trim(),
        anchorType: 'LINE',
        commitSha,
        filePath: commentData.filePath,
        lineStart: commentData.lineNumber,
        lineEnd: commentData.lineNumber,
      });

      // 更新评论数据
      const updatedData = {
        ...commentData,
        comments: [
          ...commentData.comments,
          {
            id: data.id,
            content: data.content,
            author: user?.username || '匿名用户',
            createdAt: data.createdAt,
            likes: 0,
            isLiked: false,
            replies: [],
          },
        ],
      };

      onCommentsUpdate?.(updatedData);
      setNewComment('');
      // 重新聚焦输入框
      setTimeout(() => textareaRef.current?.focus(), 0);

      toast({
        title: '评论成功',
        description: '您的评论已发布成功',
      });
    } catch (e: any) {
      toast({
        title: '评论失败',
        description: e?.message || '发布失败',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
      // 提交后重新聚焦到输入框
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [
    newComment,
    submitting,
    snapshotId,
    commitSha,
    commentData,
    user,
    onCommentsUpdate,
    toast,
    canComment,
    commentBlockReason,
  ]);

  // 提交回复
  const handleSubmitReply = useCallback(
    async (parentCommentId: string) => {
      if (!replyText.trim() || submittingReply) return;

      try {
        if (!canComment) {
          toast({
            title: '无法回复',
            description: commentBlockReason || '权限不足',
            variant: 'destructive',
          });
          return;
        }

        setSubmittingReply(parentCommentId);
        const { data } = await apiClient.post('/comments', {
          snapshotId,
          content: replyText.trim(),
          anchorType: 'LINE',
          commitSha,
          filePath: commentData.filePath,
          lineStart: commentData.lineNumber,
          lineEnd: commentData.lineNumber,
          parentId: parentCommentId,
        });

        // 更新评论数据
        const updatedData = {
          ...commentData,
          comments: commentData.comments.map(comment => {
            if (comment.id === parentCommentId) {
              return {
                ...comment,
                replies: [
                  ...(comment.replies || []),
                  {
                    id: data.id,
                    content: data.content,
                    author: user?.username || '匿名用户',
                    createdAt: data.createdAt,
                    likes: 0,
                    isLiked: false,
                  },
                ],
              };
            }
            return comment;
          }),
        };

        onCommentsUpdate?.(updatedData);
        setReplyText('');
        setReplyingTo(null);

        toast({
          title: '回复成功',
          description: '回复发布成功',
        });
      } catch (e: any) {
        toast({
          title: '回复失败',
          description: e?.message || '发布失败',
          variant: 'destructive',
        });
      } finally {
        setSubmittingReply(null);
      }
    },
    [
      replyText,
      submittingReply,
      snapshotId,
      commitSha,
      commentData,
      user,
      onCommentsUpdate,
      toast,
      canComment,
      commentBlockReason,
    ]
  );

  // 将提交函数写入 ref，供键盘事件安全调用
  useEffect(() => {
    submitCommentRef.current = () => {
      void handleSubmitComment();
    };
  }, [handleSubmitComment]);
  useEffect(() => {
    submitReplyRef.current = (id: string) => {
      void handleSubmitReply(id);
    };
  }, [handleSubmitReply]);

  // 格式化时间 - 统一智能时间格式化
  const formatTime = useCallback((dateString: string) => {
    return formatSmartTime(dateString);
  }, []);

  // 点赞/取消点赞
  const handleLike = useCallback(
    async (commentId: string, isReply = false) => {
      try {
        if (!isLoggedIn) {
          toast({
            title: '无法点赞',
            description: '请先登录后再操作',
            variant: 'destructive',
          });
          return;
        }

        if (likingIds.has(commentId)) return;
        setLikingIds(prev => new Set(prev).add(commentId));

        // 在本地数据中查找目标评论（主楼或回复）与父ID
        let target: any = null;
        let parentId: string | null = null;
        for (const c of commentData.comments) {
          if (c.id === commentId && !isReply) {
            target = c;
            break;
          }
          if (isReply && c.replies) {
            const r = c.replies.find((x: any) => x.id === commentId);
            if (r) {
              target = r;
              parentId = c.id;
              break;
            }
          }
        }
        if (!target) return;

        const currentlyLiked = !!target.isLiked;
        const optimisticLikes = Math.max(
          0,
          (Number(target.likes) || 0) + (currentlyLiked ? -1 : 1)
        );

        // 乐观更新
        const optimisticData = {
          ...commentData,
          comments: commentData.comments.map(c => {
            if (!isReply && c.id === commentId) {
              return {
                ...c,
                likes: optimisticLikes,
                isLiked: !currentlyLiked,
              } as any;
            }
            if (isReply && c.id === parentId) {
              return {
                ...c,
                replies: (c.replies || []).map(r =>
                  r.id === commentId
                    ? { ...r, likes: optimisticLikes, isLiked: !currentlyLiked }
                    : r
                ),
              } as any;
            }
            return c;
          }),
        } as typeof commentData;
        onCommentsUpdate?.(optimisticData);

        // 调用后端 API
        let res: any;
        if (currentlyLiked) {
          res = await apiClient.delete(`/comments/${commentId}/like`);
        } else {
          res = await apiClient.post(`/comments/${commentId}/like`);
        }
        const serverLikes = Number(res?.data?.likesCount ?? optimisticLikes);
        const serverLiked = !!res?.data?.liked;

        // 用服务端结果校正
        const correctedData = {
          ...optimisticData,
          comments: optimisticData.comments.map(c => {
            if (!isReply && c.id === commentId) {
              return { ...c, likes: serverLikes, isLiked: serverLiked } as any;
            }
            if (isReply && c.id === parentId) {
              return {
                ...c,
                replies: (c.replies || []).map(r =>
                  r.id === commentId
                    ? { ...r, likes: serverLikes, isLiked: serverLiked }
                    : r
                ),
              } as any;
            }
            return c;
          }),
        } as typeof commentData;
        onCommentsUpdate?.(correctedData);
      } catch (e: any) {
        // 失败：回滚（重新以原始 commentData 作为基准刷新 UI）
        onCommentsUpdate?.({ ...commentData });
        toast({
          title: '操作失败',
          description: e?.message || '点赞操作失败',
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
    [isLoggedIn, toast, likingIds, commentData, onCommentsUpdate]
  );

  // 渲染评论 - B站风格
  const renderComment = useCallback(
    (comment: any, isReply = false) => {
      const hasReplies = comment.replies && comment.replies.length > 0;
      const isExpanded = expandedComments.has(comment.id);
      const showExpandButton = hasReplies && comment.replies.length > 2;
      const visibleReplies = isExpanded
        ? comment.replies
        : comment.replies?.slice(0, 2) || [];

      return (
        <div
          key={comment.id}
          className={`${isReply ? 'ml-12 pl-4 border-l border-border' : 'mb-4'}`}
        >
          <div className="flex gap-3 comment-bubble hover:bg-accent/20 transition-colors">
            {/* 头像 */}
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="text-xs bg-primary/15 text-primary">
                {comment.author.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* 用户名和时间 */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm text-primary">
                  {comment.author}
                </span>
                {!isReply && (
                  <Badge variant="outline" className="text-xs">
                    楼主
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatTime(comment.createdAt)}
                </span>
              </div>

              {/* 评论内容 */}
              <div className="text-sm text-foreground/90 mb-3 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </div>

              {/* 操作按钮 - B站风格 */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => handleLike(comment.id, isReply)}
                  disabled={likingIds.has(comment.id) || gateLoading}
                  aria-label={comment.isLiked ? '取消点赞' : '点赞'}
                >
                  <Heart
                    className={`h-3 w-3 mr-1 ${comment.isLiked ? 'fill-current text-destructive' : ''}`}
                  />
                  {comment.likes || 0}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                  aria-label="回复评论"
                >
                  <Reply className="h-3 w-3" />
                </Button>
              </div>

              {/* 回复输入框 */}
              {replyingTo === comment.id && (
                <div className="mt-3 comment-bubble">
                  <Textarea
                    value={replyText}
                    onChange={onReplyInputChange}
                    placeholder={`回复 @${comment.author}:`}
                    maxLength={MAX_COMMENT_LEN}
                    className="min-h-[80px] mb-2 text-foreground placeholder:text-muted-foreground"
                    disabled={!canComment || gateLoading}
                    ref={replyTextareaRef}
                    onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                      onReplyInputKeyDown(e, comment.id)
                    }
                  />
                  {mentionOpen &&
                    mentionFor === 'reply' &&
                    replyingTo === comment.id &&
                    mentionList.length > 0 && (
                      <div className="relative">
                        <div className="absolute z-50 mt-1 w-56 rounded-md border border-border bg-popover shadow-md text-foreground">
                          {mentionList.map((m, idx) => (
                            <button
                              key={m.id + idx}
                              type="button"
                              className={`flex w-full items-center gap-2 px-2 py-1 text-left text-sm hover:bg-accent ${idx === mentionIndex ? 'bg-accent' : ''}`}
                              onMouseDown={ev => {
                                ev.preventDefault();
                                applyMention(m.username);
                              }}
                            >
                              <span className="inline-block h-5 w-5 rounded-full bg-muted text-center text-[10px] leading-5">
                                {m.username.charAt(0).toUpperCase()}
                              </span>
                              <span className="truncate">@{m.username}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  <div className="-mt-1 mb-2 text-right text-[10px] text-muted-foreground">
                    {replyText.length}/{MAX_COMMENT_LEN}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline-subtle"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={
                        !replyText.trim() ||
                        submittingReply === comment.id ||
                        !canComment ||
                        gateLoading
                      }
                    >
                      {submittingReply === comment.id && (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      )}
                      <Send className="h-3 w-3 mr-1" />
                      发布
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 回复列表 - B站风格楼中楼 */}
          {hasReplies && (
            <div className="mt-2 space-y-2">
              {visibleReplies.map((reply: any) => renderComment(reply, true))}

              {/* 展开/收起按钮 */}
              {showExpandButton && (
                <div className="ml-12 pl-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs text-primary hover:bg-accent"
                    onClick={() => toggleCommentExpanded(comment.id)}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        收起回复
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        查看全部 {comment.replies.length} 条回复
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    },
    [
      expandedComments,
      replyingTo,
      replyText,
      submittingReply,
      formatTime,
      toggleCommentExpanded,
      handleSubmitReply,
      handleLike,
      canComment,
      gateLoading,
      // mention 相关依赖
      mentionOpen,
      mentionFor,
      mentionIndex,
      mentionList,
      onReplyInputChange,
      onReplyInputKeyDown,
      applyMention,
      likingIds,
    ]
  );

  // 按点赞数降序；若相同则按时间正序
  const sortedComments = [...(commentData.comments ?? [])]
    .map(c => ({
      ...c,
      replies: Array.isArray(c.replies)
        ? [...c.replies].sort((ra, rb) => {
            const diff = Number(rb.likes ?? 0) - Number(ra.likes ?? 0);
            if (diff !== 0) return diff;
            return (
              new Date(ra.createdAt).getTime() -
              new Date(rb.createdAt).getTime()
            );
          })
        : c.replies,
    }))
    .sort((a, b) => {
      const diff = Number(b.likes ?? 0) - Number(a.likes ?? 0);
      if (diff !== 0) return diff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[900px] md:w-[980px] lg:w-[1040px] max-w-[96vw] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />第 {commentData.lineNumber}{' '}
            行的评论
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {commentData.filePath}
          </p>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-auto space-y-4 px-2">
          {/* 评论列表 */}
          {sortedComments.length > 0 ? (
            <div className="space-y-1">
              {sortedComments.map(comment => renderComment(comment))}
            </div>
          ) : (
            <div className="empty-state">
              <MessageCircle className="empty-state-icon" />
              <h3 className="empty-state-title">暂无评论</h3>
              <p className="empty-state-desc">来发表第一条吧</p>
            </div>
          )}

          {/* 添加评论 */}
          <div className="border-t border-border pt-4 bg-card">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="text-xs bg-success/15 text-success">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={onMainInputChange}
                  onKeyDown={onMainInputKeyDown}
                  placeholder="添加评论..."
                  maxLength={MAX_COMMENT_LEN}
                  className="min-h-[100px] mb-3"
                  disabled={!canComment || gateLoading}
                />
                {mentionOpen &&
                  mentionFor === 'main' &&
                  mentionList.length > 0 && (
                    <div className="relative">
                      <div className="absolute z-50 mt-1 w-56 rounded-md border border-border bg-popover shadow-md">
                        {mentionList.map((m, idx) => (
                          <button
                            key={m.id + idx}
                            type="button"
                            className={`flex w-full items-center gap-2 px-2 py-1 text-left text-sm hover:bg-accent ${idx === mentionIndex ? 'bg-accent' : ''}`}
                            onMouseDown={ev => {
                              ev.preventDefault();
                              applyMention(m.username);
                            }}
                          >
                            <span className="inline-block h-5 w-5 rounded-full bg-muted text-center text-[10px] leading-5">
                              {m.username.charAt(0).toUpperCase()}
                            </span>
                            <span className="truncate">@{m.username}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                <div className="-mt-2 mb-2 text-right text-[10px] text-muted-foreground">
                  {newComment.length}/{MAX_COMMENT_LEN}
                </div>
                {!canComment && commentBlockReason && (
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {commentBlockReason}
                    </p>
                    {repoVisibility === 'PUBLIC' && !isLoggedIn && (
                      <Button
                        size="sm"
                        onClick={() => {
                          try {
                            localStorage.setItem(
                              'RG_POST_LOGIN',
                              JSON.stringify({
                                action: 'openLineComments',
                                snapshotId,
                                filePath: commentData.filePath,
                                lineNumber: commentData.lineNumber,
                                ts: Date.now(),
                              })
                            );
                          } catch {}
                          router.push(
                            `/auth/login?intent=login&redirect=${encodeURIComponent(pathname || '')}`
                          );
                        }}
                      >
                        登录后评论
                      </Button>
                    )}
                  </div>
                )}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={
                      !newComment.trim() ||
                      submitting ||
                      !canComment ||
                      gateLoading
                    }
                  >
                    {submitting && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    <Send className="h-4 w-4 mr-2" />
                    发布评论
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
