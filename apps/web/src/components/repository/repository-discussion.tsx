'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { formatSmartTime } from '@/lib/utils/format-time';
import { apiClient } from '@/services/apiClient';
import { Heart, Loader2, MessageCircle, Send, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
  parent?: {
    id: string;
    author: {
      id: string;
      username: string;
      avatar: string | null;
    };
  } | null;
  _count?: {
    likes: number;
    replies: number;
  };
  liked?: boolean;
  replies?: Comment[];
}

interface RepositoryDiscussionProps {
  repositoryId: string;
  snapshotId?: string;
  className?: string;
  highlightCommentId?: string | null;
}

const reactionButtonClass =
  'flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40';

export function RepositoryDiscussion({
  repositoryId,
  snapshotId: providedSnapshotId,
  className = '',
  highlightCommentId,
}: RepositoryDiscussionProps) {
  const { user } = useAuth();
  const [snapshotId, setSnapshotId] = useState<string | null>(
    providedSnapshotId || null
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{
    commentId: string;
    targetAuthor: string;
  } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [highlightedCommentId, setHighlightedCommentId] = useState<
    string | null
  >(null);
  const commentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  // 获取默认快照ID
  useEffect(() => {
    if (providedSnapshotId) {
      setSnapshotId(providedSnapshotId);
      return;
    }

    const fetchDefaultSnapshot = async () => {
      try {
        const repoRes = await apiClient.get(`/repositories/${repositoryId}`);
        const defaultBranch = repoRes.data.defaultBranch;

        const branchesRes = await apiClient.get(
          `/repositories/${repositoryId}/branches`
        );
        const defaultBranchInfo = branchesRes.data.branches.find(
          (b: any) => b.name === defaultBranch || b.isDefault
        );

        if (defaultBranchInfo?.id) {
          const snapshotRes = await apiClient.get(
            `/artifacts/by-branch/${repositoryId}/${defaultBranchInfo.id}`
          );
          if (snapshotRes.data?.id) {
            setSnapshotId(snapshotRes.data.id);
          }
        }
      } catch (error) {
        console.error('获取快照ID失败:', error);
      }
    };

    fetchDefaultSnapshot();
  }, [repositoryId, providedSnapshotId]);

  // 加载评论列表
  const loadComments = useCallback(async () => {
    if (!snapshotId) return;

    try {
      setLoading(true);
      const params: any = {
        snapshotId,
        anchorType: 'SNAPSHOT',
        page: 1,
        limit: 100,
      };
      // 不传parentId，让后端返回所有评论并自动嵌套
      // 或者传递空字符串

      const response = await apiClient.get(`/comments`, { params });

      // 过滤出顶级评论（没有parentId的评论）
      const allComments = response.data.comments || [];
      const topLevelComments = allComments.filter((c: Comment) => !c.parentId);

      setComments(topLevelComments);
    } catch (error) {
      console.error('加载评论失败:', error);
    } finally {
      setLoading(false);
    }
  }, [snapshotId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // 处理评论高亮闪烁
  useEffect(() => {
    if (highlightCommentId && comments.length > 0) {
      // 检查是否存在该评论ID（主评论或次评论）
      let targetCommentId: string | null = null;
      let isReply = false;

      for (const comment of comments) {
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
  }, [highlightCommentId, comments]);

  // 提交新评论
  const handleSubmit = async () => {
    if (!newComment.trim() || submitting || !user) {
      if (!user) toast.error('请先登录');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post('/comments', {
        snapshotId,
        content: newComment.trim(),
        anchorType: 'SNAPSHOT',
      });

      setNewComment('');
      toast.success('评论发布成功');
      await loadComments();
    } catch (error) {
      console.error('发布评论失败:', error);
      toast.error('发布评论失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 提交回复
  const handleReplySubmit = async () => {
    if (!replyText.trim() || isSubmittingReply || !user || !replyingTo) {
      if (!user) toast.error('请先登录');
      return;
    }

    try {
      setIsSubmittingReply(true);
      await apiClient.post('/comments', {
        snapshotId,
        content: replyText.trim(),
        anchorType: 'SNAPSHOT',
        parentId: replyingTo.commentId,
      });

      setReplyText('');
      setReplyingTo(null);
      toast.success('回复成功');
      await loadComments();
    } catch (error) {
      console.error('回复失败:', error);
      toast.error('回复失败，请重试');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // 设置回复目标
  const handleReplyTarget = (commentId: string, targetAuthor: string) => {
    if (replyingTo?.commentId === commentId) {
      setReplyingTo(null);
      setReplyText('');
    } else {
      setReplyingTo({ commentId, targetAuthor });
      setTimeout(() => replyRef.current?.focus(), 100);
    }
  };

  // 切换回复展开/折叠
  const toggleRepliesExpansion = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // 点赞
  const handleLike = async (commentId: string, isReply = false) => {
    if (!user) {
      toast.error('请先登录');
      return;
    }

    if (likingIds.has(commentId)) return;
    setLikingIds(prev => new Set(prev).add(commentId));

    try {
      // 查找评论以获取当前状态
      let targetComment: Comment | undefined;
      for (const comment of comments) {
        if (comment.id === commentId) {
          targetComment = comment;
          break;
        }
        if (comment.replies) {
          targetComment = comment.replies.find(r => r.id === commentId);
          if (targetComment) break;
        }
      }

      const isLiked = !!targetComment?.liked;

      // 调用API
      let response;
      if (isLiked) {
        response = await apiClient.delete(`/comments/${commentId}/like`);
      } else {
        response = await apiClient.post(`/comments/${commentId}/like`);
      }

      // 立即更新本地状态
      const updateCommentInList = (commentsList: Comment[]): Comment[] => {
        return commentsList.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              liked: response.data.liked,
              _count: {
                ...comment._count,
                likes: response.data.likesCount,
                replies: comment._count?.replies || 0,
              },
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateCommentInList(comment.replies),
            };
          }
          return comment;
        });
      };

      setComments(updateCommentInList);
    } catch (error) {
      console.error('点赞操作失败:', error);
      toast.error('操作失败，请重试');
    } finally {
      setLikingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  // 删除评论
  const handleDelete = async (commentId: string, isReply = false) => {
    // 二次确认
    if (!confirm('确认删除该评论？')) return;

    if (deletingIds.has(commentId)) return;

    // 保存快照用于错误回滚
    const snapshot = [...comments];

    setDeletingIds(prev => new Set(prev).add(commentId));

    try {
      // 乐观更新：立即从列表中移除
      const removeCommentFromList = (commentsList: Comment[]): Comment[] => {
        return commentsList
          .filter(comment => comment.id !== commentId)
          .map(comment => ({
            ...comment,
            replies: comment.replies
              ? removeCommentFromList(comment.replies)
              : [],
          }));
      };

      setComments(removeCommentFromList);

      // 调用删除API
      await apiClient.delete(`/comments/${commentId}`);
      toast.success('已删除');
    } catch (error) {
      // 回滚到之前的状态
      setComments(snapshot);
      console.error('删除失败:', error);
      toast.error('删除失败，请重试');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const formatCount = (value?: number) => {
    const num = Number(value ?? 0);
    if (Number.isNaN(num)) return '0';
    if (num >= 10000)
      return `${(num / 10000).toFixed(1).replace(/\.0$/, '')}万`;
    if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    return `${num}`;
  };

  const canDelete = (authorId?: string) => {
    if (!user) return false;
    return user.id === authorId;
  };

  // 主评论排序：先按点赞数降序，如果点赞数相同则按创建时间升序
  const sortedComments = [...comments].sort((a, b) => {
    const likeDiff = (b._count?.likes || 0) - (a._count?.likes || 0);
    if (likeDiff !== 0) return likeDiff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  if (!snapshotId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>暂无可用的讨论区</p>
        <p className="text-sm mt-2">请先创建快照后再进行讨论</p>
      </div>
    );
  }

  return (
    <div
      className={`my-5 rounded-[26px] border border-border bg-card text-card-foreground shadow-lg backdrop-blur ${className}`}
    >
      {/* 头部标题 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3 text-[13px] text-muted-foreground">
          <span className="text-[15px] font-semibold tracking-wide text-foreground">
            项目讨论
          </span>
        </div>
      </div>

      {/* 评论列表区域 - 可滚动 */}
      <div className="p-6 space-y-6 h-[620px] overflow-y-auto">
        {/* 评论列表 */}
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : sortedComments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-[15px]">还没有评论</p>
            <p className="text-[13px] mt-2 text-muted-foreground/70">
              来发表第一条评论吧
            </p>
          </div>
        ) : (
          sortedComments.map(comment => (
            <div
              key={comment.id}
              ref={el => {
                commentRefs.current[comment.id] = el;
              }}
              className={`flex gap-4 transition-all duration-500 ease-in-out ${
                highlightedCommentId === comment.id
                  ? 'border-l-4 border-l-blue-500 dark:bg-blue-500/5 bg-blue-50/30 pl-3 rounded-r-lg py-2 -ml-1'
                  : 'border-l-4 border-l-transparent'
              }`}
            >
              {/* 主评论头像 */}
              <Avatar className="h-11 w-11 shrink-0 rounded-full ring-2 ring-border shadow-md">
                <AvatarImage src={comment.author.avatar || undefined} />
                <AvatarFallback className="text-[13px] font-semibold text-foreground/90">
                  {comment.author.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                {/* 主评论信息 */}
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <span className="text-[16px] font-semibold text-foreground">
                    {comment.author.username}
                  </span>
                  <span className="text-muted-foreground/70">
                    {formatSmartTime(comment.createdAt)}
                  </span>
                </div>

                {/* 主评论内容 */}
                <div
                  className="mt-2 text-[15px] leading-relaxed tracking-wide text-foreground/90"
                  style={{
                    fontFamily:
                      '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
                  }}
                >
                  {comment.content}
                </div>

                {/* 主评论操作按钮 */}
                <div className="mt-3 flex items-center gap-6">
                  <button
                    type="button"
                    className={reactionButtonClass}
                    onClick={() => handleLike(comment.id, false)}
                    disabled={likingIds.has(comment.id)}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        comment.liked
                          ? 'fill-current text-destructive'
                          : 'text-muted-foreground'
                      }`}
                    />
                    <span>{formatCount(comment._count?.likes)}</span>
                  </button>

                  <button
                    type="button"
                    className={reactionButtonClass}
                    onClick={() =>
                      handleReplyTarget(comment.id, comment.author.username)
                    }
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>回复</span>
                  </button>

                  {canDelete(comment.author.id) && (
                    <button
                      type="button"
                      className={reactionButtonClass}
                      onClick={() => handleDelete(comment.id, false)}
                      disabled={deletingIds.has(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* 次评论（回复）列表 */}
                {Array.isArray(comment.replies) &&
                  comment.replies.length > 0 && (
                    <div className="mt-6 space-y-6">
                      {(() => {
                        const sortedReplies = [...comment.replies].sort(
                          (a, b) =>
                            (b._count?.likes || 0) - (a._count?.likes || 0)
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
                                    ? 'border-l-4 border-l-blue-500 dark:bg-blue-500/5 bg-blue-50/30 pl-3 rounded-r-lg py-2 -ml-1'
                                    : 'border-l-4 border-l-transparent'
                                }`}
                              >
                                <Avatar className="h-11 w-11 shrink-0 rounded-full ring-2 ring-border shadow-md">
                                  <AvatarImage
                                    src={reply.author.avatar || undefined}
                                  />
                                  <AvatarFallback className="text-[13px] font-semibold text-foreground/90">
                                    {reply.author.username
                                      .charAt(0)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                  {/* 回复信息 - 显示 A ▶ B 格式 */}
                                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                                    <span className="text-[16px] font-semibold text-foreground">
                                      {reply.author.username}
                                    </span>
                                    <span className="text-muted-foreground">
                                      ▶
                                    </span>
                                    <span className="text-[16px] font-semibold text-foreground">
                                      {reply.parent?.author?.username ||
                                        comment.author.username}
                                    </span>
                                    <span className="text-muted-foreground/70">
                                      {formatSmartTime(reply.createdAt)}
                                    </span>
                                  </div>

                                  {/* 回复内容 */}
                                  <div
                                    className="mt-2 text-[15px] leading-relaxed tracking-wide text-foreground/90"
                                    style={{
                                      fontFamily:
                                        '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
                                    }}
                                  >
                                    {reply.content}
                                  </div>

                                  {/* 回复操作按钮 */}
                                  <div className="mt-3 flex items-center gap-6">
                                    <button
                                      type="button"
                                      className={reactionButtonClass}
                                      onClick={() => handleLike(reply.id, true)}
                                      disabled={likingIds.has(reply.id)}
                                    >
                                      <Heart
                                        className={`h-4 w-4 ${
                                          reply.liked
                                            ? 'fill-current text-destructive'
                                            : 'text-muted-foreground'
                                        }`}
                                      />
                                      <span>
                                        {formatCount(reply._count?.likes)}
                                      </span>
                                    </button>

                                    <button
                                      type="button"
                                      className={reactionButtonClass}
                                      onClick={() =>
                                        handleReplyTarget(
                                          comment.id,
                                          reply.author.username
                                        )
                                      }
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                      <span>回复</span>
                                    </button>

                                    {canDelete(reply.author.id) && (
                                      <button
                                        type="button"
                                        className={reactionButtonClass}
                                        onClick={() =>
                                          handleDelete(reply.id, true)
                                        }
                                        disabled={deletingIds.has(reply.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* 查看更多按钮 */}
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

                {/* 回复输入框 */}
                {replyingTo?.commentId === comment.id && (
                  <div className="mt-4 ml-2 rounded-[20px] border border-border bg-accent/5 px-5 py-4 shadow-sm">
                    <Textarea
                      ref={replyRef}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder={`回复 @${replyingTo?.targetAuthor || comment.author.username}:`}
                      className="min-h-[76px] resize-none border-none bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                      style={{
                        fontFamily:
                          '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
                      }}
                      disabled={isSubmittingReply}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          handleReplySubmit();
                        }
                      }}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[12px] text-muted-foreground/70">
                        Ctrl/Cmd + Enter 发送
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          className="rounded-[10px]"
                        >
                          取消
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleReplySubmit}
                          disabled={!replyText.trim() || isSubmittingReply}
                          className="rounded-[10px]"
                        >
                          {isSubmittingReply ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4 mr-2" />
                          )}
                          回复
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 发表评论区域 - 固定在底部 */}
      <div className="border-t border-border px-6 py-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 shrink-0 rounded-full ring-2 ring-border bg-accent/10">
            {user?.avatar && (
              <AvatarImage src={user.avatar} alt={user?.username || 'avatar'} />
            )}
            <AvatarFallback className="text-[13px] font-semibold text-foreground/90">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded-[20px] border border-border bg-accent/5 px-4 py-3 shadow-sm">
            <Textarea
              ref={textareaRef}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder={
                user
                  ? '分享你的想法... 支持 Ctrl/⌘ + Enter 快速发布'
                  : '请先登录后再评论'
              }
              disabled={!user || submitting}
              className="min-h-[70px] resize-none border-none bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{
                fontFamily:
                  '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <div className="mt-2 flex items-center justify-end">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!newComment.trim() || submitting || !user}
                className="h-8 rounded-full bg-primary px-5 text-[13px] font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                {submitting && (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
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
