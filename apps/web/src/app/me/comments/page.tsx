'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';
import { Clock, ExternalLink, Heart, MessageCircle, Reply } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  likes?: number;
  repliesCount?: number;
  author?: {
    id: string;
    username: string;
    avatar?: string | null;
  };
  snapshot: {
    id: string;
    title?: string;
    commitSha: string;
    repository: {
      id: string;
      name: string;
    };
  };
  filePath?: string;
  lineNumber?: number;
  anchorType: 'LINE' | 'FILE' | 'GENERAL';
}

export default function MyCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { toast } = useToast();

  const limit = 20;

  const loadComments = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const response = await apiClient.get('/comments/me/comments', {
          params: {
            page: pageNum,
            limit,
          },
        });

        const data = response.data;
        const newComments = Array.isArray(data.items) ? data.items : [];

        if (append) {
          setComments(prev => [...prev, ...newComments]);
        } else {
          setComments(newComments);
        }

        setTotal(data.total || 0);
        setHasMore(
          newComments.length === limit && (data.total || 0) > pageNum * limit
        );
        setPage(pageNum);
      } catch (error: any) {
        toast({
          title: '加载失败',
          description: error?.response?.data?.message || '无法加载评论列表',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [toast, limit]
  );

  useEffect(() => {
    loadComments(1);
  }, [loadComments]);

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;

    return date.toLocaleDateString('zh-CN');
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadComments(page + 1, true);
    }
  };

  const getAnchorTypeLabel = (anchorType: string) => {
    switch (anchorType) {
      case 'LINE':
        return '行评论';
      case 'FILE':
        return '文件评论';
      case 'GENERAL':
        return '通用评论';
      default:
        return '评论';
    }
  };

  const getAnchorTypeBadgeVariant = (anchorType: string) => {
    switch (anchorType) {
      case 'LINE':
        return 'default';
      case 'FILE':
        return 'secondary';
      case 'GENERAL':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">我的评论</h1>
          <p className="text-muted-foreground">
            查看我发表的所有评论 ({total} 条)
          </p>
        </div>

        {comments.length === 0 ? (
          <div className="empty-state">
            <MessageCircle className="empty-state-icon" />
            <h3 className="empty-state-title">还没有评论</h3>
            <p className="empty-state-desc">当您发表评论时，会在这里显示</p>
            <Button asChild variant="soft">
              <Link href="/repositories">去浏览仓库</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <Card key={comment.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {comment.author?.avatar ? (
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.username ?? 'avatar'}
                          className="h-10 w-10 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-green-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* 评论信息 */}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={
                            getAnchorTypeBadgeVariant(comment.anchorType) as any
                          }
                          className="text-xs"
                        >
                          {getAnchorTypeLabel(comment.anchorType)}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(comment.createdAt)}
                        </span>
                      </div>

                      {/* 评论内容 */}
                      <div className="mb-3">
                        <div className="text-sm whitespace-pre-wrap">
                          {comment.content}
                        </div>
                      </div>

                      {/* 互动数据 */}
                      <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                        {comment.likes !== undefined && comment.likes > 0 && (
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{comment.likes}</span>
                          </div>
                        )}
                        {comment.repliesCount !== undefined &&
                          comment.repliesCount > 0 && (
                            <div className="flex items-center gap-1">
                              <Reply className="h-3 w-3" />
                              <span>{comment.repliesCount} 条回复</span>
                            </div>
                          )}
                      </div>

                      {/* 仓库和文件信息 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{comment.snapshot.repository.name}</span>
                          {comment.filePath && (
                            <>
                              <span>/</span>
                              <span>{comment.filePath}</span>
                              {comment.lineNumber && (
                                <>
                                  <span>:</span>
                                  <span>第{comment.lineNumber}行</span>
                                </>
                              )}
                            </>
                          )}
                        </div>

                        <Button variant="outline-subtle" size="sm" asChild>
                          <Link
                            href={`/snapshots/${comment.snapshot.id}${comment.filePath ? `?file=${encodeURIComponent(comment.filePath)}${comment.lineNumber ? `&line=${comment.lineNumber}` : ''}` : ''}`}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            查看详情
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* 加载更多 */}
            {hasMore && (
              <div className="text-center py-4">
                <Button
                  variant="outline-subtle"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? '加载中...' : '加载更多'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
