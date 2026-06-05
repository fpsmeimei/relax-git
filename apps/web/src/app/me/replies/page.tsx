'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';
import { Clock, ExternalLink, MessageCircle, User } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  parentComment: {
    id: string;
    content: string;
    author: {
      id: string;
      username: string;
    };
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
}

export default function MyRepliesPage() {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { toast } = useToast();

  const limit = 20;

  const loadReplies = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const response = await apiClient.get('/comments/me/replies', {
          params: {
            page: pageNum,
            limit,
          },
        });

        const data = response.data;
        const newReplies = Array.isArray(data.items) ? data.items : [];

        if (append) {
          setReplies(prev => [...prev, ...newReplies]);
        } else {
          setReplies(newReplies);
        }

        setTotal(data.total || 0);
        setHasMore(
          newReplies.length === limit && (data.total || 0) > pageNum * limit
        );
        setPage(pageNum);
      } catch (error: any) {
        toast({
          title: '加载失败',
          description: error?.response?.data?.message || '无法加载回复列表',
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
    loadReplies(1);
  }, [loadReplies]);

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
      loadReplies(page + 1, true);
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
          <h1 className="text-2xl font-bold mb-2">我的回复</h1>
          <p className="text-muted-foreground">
            查看我回复他人的所有评论 ({total} 条)
          </p>
        </div>

        {replies.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">还没有回复</h3>
              <p className="text-muted-foreground mb-4">
                当您回复他人的评论时，会在这里显示
              </p>
              <Button asChild variant="soft">
                <Link href="/repositories">去浏览仓库</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {replies.map(reply => (
              <Card key={reply.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* 回复信息 */}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          回复
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {reply.parentComment.author.username}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(reply.createdAt)}
                        </span>
                      </div>

                      {/* 原评论内容 */}
                      <div className="mb-3 p-3 bg-muted/50 rounded-md">
                        <div className="text-sm text-muted-foreground mb-1">
                          原评论：
                        </div>
                        <div className="text-sm line-clamp-2">
                          {reply.parentComment.content}
                        </div>
                      </div>

                      {/* 我的回复内容 */}
                      <div className="mb-3">
                        <div className="text-sm text-muted-foreground mb-1">
                          我的回复：
                        </div>
                        <div className="text-sm whitespace-pre-wrap">
                          {reply.content}
                        </div>
                      </div>

                      {/* 仓库和文件信息 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{reply.snapshot.repository.name}</span>
                          {reply.filePath && (
                            <>
                              <span>/</span>
                              <span>{reply.filePath}</span>
                              {reply.lineNumber && (
                                <>
                                  <span>:</span>
                                  <span>第{reply.lineNumber}行</span>
                                </>
                              )}
                            </>
                          )}
                        </div>

                        <Button variant="outline-subtle" size="sm" asChild>
                          <Link
                            href={`/snapshots/${reply.snapshot.id}${reply.filePath ? `?file=${encodeURIComponent(reply.filePath)}${reply.lineNumber ? `&line=${reply.lineNumber}` : ''}` : ''}`}
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
