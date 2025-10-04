'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CommunityAPI, RepositoryCommentDto } from '@/lib/api/community';
import { Heart, Loader2, MessageCircle, Send, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { formatSmartTime } from '@/lib/utils/format-time';
import { apiClient } from '@/services/apiClient';

interface RepositoryCommentsProps {
  repositoryId: string;
  className?: string;
  highlightCommentId?: string | null | undefined;
}

interface CommentItemProps {
  comment: RepositoryCommentDto;
  onLike: (commentId: string) => void;
  onReply: (parentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  isLiking: boolean;
  isDeletingIds: Set<string>;
  highlightCommentId?: string | null;
}

function CommentItem({
  comment,
  onLike,
  onReply,
  onDelete,
  isLiking,
  isDeletingIds,
  highlightCommentId,
}: CommentItemProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState(false);
  const [highlightedCommentId, setHighlightedCommentId] = useState<
    string | null
  >(null);
  const commentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;

    setIsSubmittingReply(true);
    try {
      await onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setShowReplyForm(false);
      toast.success('回复成功');
    } catch (error) {
      toast.error('回复失败，请重试');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const formatTime = (dateInput: string | Date) => {
    // 使用统一的智能时间格式化
    return formatSmartTime(dateInput);
  };

  const formatCount = (value?: number) => {
    const num = Number(value ?? 0);
    if (Number.isNaN(num)) return '0';
    if (num >= 10000)
      return `${(num / 10000).toFixed(1).replace(/\.0$/, '')}万`;
    if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    return `${num}`;
  };

  const reactionButtonClass =
    'flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40';

  // 检查是否可以删除评论
  const canDelete = (
    authorId?: string | null,
    authorUsername?: string | null
  ) => {
    if (user?.id && authorId) return user.id === authorId;
    if (user?.username && authorUsername)
      return user.username === authorUsername;
    return false;
  };

  // 处理评论高亮闪烁
  useEffect(() => {
    if (highlightCommentId) {
      // 检查是否存在该评论ID（主评论或次评论）
      let targetCommentId: string | null = null;
      let isReply = false;

      if (comment.id === highlightCommentId) {
        targetCommentId = comment.id;
      } else if (
        comment.replies?.some(reply => reply.id === highlightCommentId)
      ) {
        targetCommentId = comment.id; // 主评论ID
        isReply = true;
      }

      if (targetCommentId === comment.id) {
        // 如果是次评论，需要先展开
        if (isReply) {
          setExpandedReplies(true);
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
  }, [highlightCommentId, comment.id, comment.replies]);

  return (
    <div
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
        <AvatarImage
          src={comment.author.avatar || undefined}
          alt={comment.author.username}
        />
        <AvatarFallback className="text-[13px] font-semibold text-foreground/90">
          {comment.author.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <span className="text-[16px] font-semibold text-foreground">
            {comment.author.username}
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
            onClick={() => onLike(comment.id)}
            disabled={isLiking}
          >
            <Heart
              className={`h-4 w-4 ${
                comment.isLiked
                  ? 'fill-current text-destructive'
                  : 'text-muted-foreground'
              }`}
            />
            <span>{formatCount(comment.likesCount)}</span>
          </button>
          <button
            type="button"
            className={reactionButtonClass}
            onClick={() => setShowReplyForm(!showReplyForm)}
            aria-label={
              showReplyForm ? '收起回复框' : `回复 ${comment.author.username}`
            }
          >
            <MessageCircle className="h-4 w-4" />
            <span>回复</span>
          </button>
          {canDelete(comment.author.id, comment.author.username) && (
            <button
              type="button"
              className={reactionButtonClass}
              onClick={() => onDelete(comment.id)}
              disabled={isDeletingIds.has(comment.id)}
              aria-label="删除评论"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {showReplyForm && (
          <div className="mt-4 ml-2 rounded-[20px] border border-border bg-accent/5 px-5 py-4 shadow-sm">
            <Textarea
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              placeholder={`回复 @${comment.author.username}:`}
              className="min-h-[76px] resize-none border-none bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              maxLength={2000}
              onKeyDown={e => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleReplySubmit();
                }
              }}
            />
            <div className="mt-3 flex items-center justify-end gap-4">
              <button
                type="button"
                className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => {
                  setReplyContent('');
                  setShowReplyForm(false);
                }}
              >
                取消
              </button>
              <Button
                size="sm"
                onClick={handleReplySubmit}
                disabled={!replyContent.trim() || isSubmittingReply}
                className="h-9 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                {isSubmittingReply && (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                )}
                发布
              </Button>
            </div>
          </div>
        )}

        {/* 显示回复 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-6 space-y-6">
            {(() => {
              // 按点赞数排序次评论
              const sortedReplies = [...comment.replies].sort(
                (a, b) => (b.likesCount || 0) - (a.likesCount || 0)
              );
              const visibleReplies = expandedReplies
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
                        <AvatarImage
                          src={reply.author.avatar || undefined}
                          alt={reply.author.username}
                        />
                        <AvatarFallback className="text-[13px] font-semibold text-foreground/90">
                          {reply.author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                          <span className="text-[16px] font-semibold text-foreground">
                            {reply.author.username}
                          </span>
                          <span className="text-muted-foreground">▶</span>
                          <span className="text-[16px] font-semibold text-foreground">
                            {comment.author.username}
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
                            onClick={() => onLike(reply.id)}
                            disabled={isLiking}
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                reply.isLiked
                                  ? 'fill-current text-destructive'
                                  : 'text-muted-foreground'
                              }`}
                            />
                            <span>{formatCount(reply.likesCount)}</span>
                          </button>
                          <button
                            type="button"
                            className={reactionButtonClass}
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            aria-label={`回复 ${reply.author.username}`}
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>回复</span>
                          </button>
                          {canDelete(
                            reply.author.id,
                            reply.author.username
                          ) && (
                            <button
                              type="button"
                              className={reactionButtonClass}
                              onClick={() => onDelete(reply.id)}
                              disabled={isDeletingIds.has(reply.id)}
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
                        onClick={() => setExpandedReplies(!expandedReplies)}
                      >
                        {expandedReplies
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
      </div>
    </div>
  );
}

export function RepositoryComments({
  repositoryId,
  className,
  highlightCommentId: propHighlightCommentId,
}: RepositoryCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<RepositoryCommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeletingIds, setIsDeletingIds] = useState<Set<string>>(new Set());

  // 主评论排序：先按点赞数降序，如果点赞数相同则按创建时间升序
  const sortedComments = [...comments].sort((a, b) => {
    const likeDiff = (b.likesCount || 0) - (a.likesCount || 0);
    if (likeDiff !== 0) return likeDiff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // 获取URL中的commentId参数或使用传入的参数
  const [highlightCommentId, setHighlightCommentId] = useState<string | null>(
    null
  );

  useEffect(() => {
    // 优先使用传入的参数，否则从URL获取
    if (propHighlightCommentId) {
      setHighlightCommentId(propHighlightCommentId);
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const commentId = params.get('commentId');
      setHighlightCommentId(commentId);
    }
  }, [propHighlightCommentId]);

  // 加载评论列表
  const loadComments = useCallback(
    async (cursor?: string) => {
      try {
        const response = await CommunityAPI.getRepositoryComments(
          repositoryId,
          cursor,
          20
        );

        if (cursor) {
          setComments(prev => [...prev, ...response.comments]);
        } else {
          setComments(response.comments);
        }

        setHasMore(response.hasMore);
        setNextCursor(response.nextCursor || null);
      } catch (error) {
        toast.error('加载评论失败');
      }
    },
    [repositoryId]
  );

  // 初始加载
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadComments();
      setLoading(false);
    };
    init();
  }, [loadComments]);

  // 加载更多
  const handleLoadMore = async () => {
    if (!hasMore || !nextCursor || loadingMore) return;

    setLoadingMore(true);
    await loadComments(nextCursor);
    setLoadingMore(false);
  };

  // 提交新评论
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const comment = await CommunityAPI.createRepositoryComment(repositoryId, {
        content: newComment.trim(),
      });

      setComments(prev => [comment, ...prev]);
      setNewComment('');
      toast.success('评论发表成功');
    } catch (error) {
      toast.error('评论发表失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理点赞
  const handleLike = async (commentId: string) => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await CommunityAPI.toggleCommentLike(commentId);

      // 更新评论状态
      const updateCommentInList = (
        commentsList: RepositoryCommentDto[]
      ): RepositoryCommentDto[] => {
        return commentsList.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              isLiked: response.isLiked,
              likesCount: response.likesCount,
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
      toast.error('操作失败，请重试');
    } finally {
      setIsLiking(false);
    }
  };

  // 处理回复
  const handleReply = async (parentId: string, content: string) => {
    const reply = await CommunityAPI.createRepositoryComment(repositoryId, {
      content,
      parentId,
    });

    // 更新评论列表，将回复添加到对应的父评论
    const updateCommentWithReply = (
      commentsList: RepositoryCommentDto[]
    ): RepositoryCommentDto[] => {
      return commentsList.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply],
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: updateCommentWithReply(comment.replies),
          };
        }
        return comment;
      });
    };

    setComments(updateCommentWithReply);
  };

  // 处理删除评论
  const handleDelete = async (commentId: string) => {
    // 二次确认
    if (!confirm('确认删除该评论？')) return;

    if (isDeletingIds.has(commentId)) return;

    // 保存快照用于错误回滚
    const snapshot = [...comments];

    setIsDeletingIds(prev => new Set(prev).add(commentId));
    try {
      // 乐观更新：立即从评论列表中移除
      const removeCommentFromList = (
        commentsList: RepositoryCommentDto[]
      ): RepositoryCommentDto[] => {
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
      toast.error('删除失败，请重试');
    } finally {
      setIsDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">加载评论中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">讨论 ({comments.length})</h3>

        {/* 评论列表 */}
        <div className="space-y-6">
          {sortedComments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>还没有评论，来发表第一条吧！</p>
            </div>
          ) : (
            <>
              {sortedComments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onLike={handleLike}
                  onReply={handleReply}
                  onDelete={handleDelete}
                  isLiking={isLiking}
                  isDeletingIds={isDeletingIds}
                  highlightCommentId={highlightCommentId}
                />
              ))}

              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    加载更多评论
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 发表评论 */}
        <div className="border-t pt-6">
          <div className="flex gap-4">
            <Avatar className="h-11 w-11 shrink-0 rounded-full ring-2 ring-border bg-accent/10">
              {user?.avatar && (
                <AvatarImage
                  src={user.avatar}
                  alt={user?.username || 'avatar'}
                />
              )}
              <AvatarFallback className="text-[13px] font-semibold text-foreground/90">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 rounded-[22px] border border-border bg-accent/5 px-5 py-4 shadow-sm">
              <Textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="说点什么吧... 支持 Ctrl/⌘ + Enter 快速发布"
                className="min-h-[90px] resize-none border-none bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                maxLength={2000}
                onKeyDown={e => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <div className="mt-3 flex items-center justify-end text-[12px] text-muted-foreground">
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="h-9 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  发布
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
