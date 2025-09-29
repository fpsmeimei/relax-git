'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CommunityAPI, RepositoryCommentDto } from '@/lib/api/community';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Heart, Loader2, MessageCircle, Send } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface RepositoryCommentsProps {
  repositoryId: string;
  className?: string;
}

interface CommentItemProps {
  comment: RepositoryCommentDto;
  onLike: (commentId: string) => void;
  onReply: (parentId: string, content: string) => void;
  isLiking: boolean;
}

function CommentItem({ comment, onLike, onReply, isLiking }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

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

  return (
    <div className="space-y-3">
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar || undefined} />
          <AvatarFallback>
            {comment.author.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="comment-bubble space-y-2">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-sm">
                {comment.author.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <button
              onClick={() => onLike(comment.id)}
              disabled={isLiking}
              aria-label={comment.isLiked ? '取消点赞' : '点赞'}
              className={`flex items-center space-x-1 hover:text-destructive transition-colors ${
                comment.isLiked ? 'text-destructive' : ''
              }`}
            >
              <Heart
                className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`}
              />
              <span>{comment.likesCount}</span>
            </button>

            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              aria-label="回复评论"
              className="flex items-center space-x-1 hover:text-primary transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>回复</span>
            </button>
          </div>

          {showReplyForm && (
            <div className="mt-2 comment-bubble space-y-3">
              <Textarea
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder="写下你的回复..."
                className="min-h-[80px] resize-none"
                maxLength={2000}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{replyContent.length}/2000</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline-subtle"
                    size="sm"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent('');
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReplySubmit}
                    disabled={!replyContent.trim() || isSubmittingReply}
                  >
                    {isSubmittingReply ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    回复
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 显示回复 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-4 space-y-3 border-l-2 border-border pl-4">
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onLike={onLike}
                  onReply={onReply}
                  isLiking={isLiking || false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RepositoryComments({
  repositoryId,
  className,
}: RepositoryCommentsProps) {
  const [comments, setComments] = useState<RepositoryCommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

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

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">加载评论中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">讨论 ({comments.length})</h3>

        {/* 发表评论 */}
        <div className="space-y-3 mb-6">
          <Textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="分享你的想法..."
            className="min-h-[100px] resize-none"
            maxLength={2000}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {newComment.length}/2000
            </span>
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              发表评论
            </Button>
          </div>
        </div>

        {/* 评论列表 */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>还没有评论，来发表第一条吧！</p>
            </div>
          ) : (
            <>
              {comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onLike={handleLike}
                  onReply={handleReply}
                  isLiking={isLiking}
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
      </CardContent>
    </Card>
  );
}
