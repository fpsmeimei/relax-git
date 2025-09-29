'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';

import { CommunityAPI, CommunityFeedItem } from '@/lib/api/community';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Bookmark,
  Calendar,
  ExternalLink,
  Eye,
  GitBranch,
  Heart,
  Loader2,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { RepositoryComments } from './repository-comments';

interface RepositoryDetailModalProps {
  repository: CommunityFeedItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLikeChange?: (repoId: string, likesCount: number, isLiked: boolean) => void;
  onCollectChange?: (
    repoId: string,
    collectionsCount: number,
    isCollected: boolean
  ) => void;
}

export function RepositoryDetailModal({
  repository,
  open,
  onOpenChange,
  onLikeChange,
  onCollectChange,
}: RepositoryDetailModalProps) {
  const [repositoryDetail, setRepositoryDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);

  // 加载仓库详情
  useEffect(() => {
    if (!repository || !open) return;

    const loadDetail = async () => {
      setLoading(true);
      try {
        const detail = await CommunityAPI.getRepositoryDetail(repository.id);
        setRepositoryDetail(detail);

        // 记录浏览
        await CommunityAPI.recordRepositoryView(repository.id);
      } catch (error) {
        toast.error('加载仓库详情失败');
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [repository, open]);

  // 处理点赞
  const handleLike = async () => {
    if (!repository || isLiking) return;

    setIsLiking(true);
    try {
      const response = await CommunityAPI.toggleRepositoryLike(repository.id);

      // 更新本地状态
      if (repositoryDetail) {
        setRepositoryDetail({
          ...repositoryDetail,
          isLiked: response.isLiked,
          stars: response.likesCount,
        });
      }

      toast.success(response.isLiked ? '点赞成功' : '已取消点赞');
      onLikeChange?.(repository.id, response.likesCount, response.isLiked);
    } catch (error) {
      toast.error('操作失败，请重试');
    } finally {
      setIsLiking(false);
    }
  };

  // 处理收藏
  const handleCollect = async () => {
    if (!repository || isCollecting) return;

    setIsCollecting(true);
    try {
      const response = await CommunityAPI.toggleRepositoryCollection(
        repository.id
      );

      // 更新本地状态
      if (repositoryDetail) {
        setRepositoryDetail({
          ...repositoryDetail,
          isCollected: response.isCollected,
        });
      }

      toast.success(response.isCollected ? '收藏成功' : '已取消收藏');
      onCollectChange?.(
        repository.id,
        response.collectionsCount,
        response.isCollected
      );
    } catch (error) {
      toast.error('操作失败，请重试');
    } finally {
      setIsCollecting(false);
    }
  };

  // 跳转到仓库页面
  const handleViewRepository = () => {
    if (repository) {
      window.open(`/repositories/${repository.id}`, '_blank');
    }
  };

  if (!repository) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate">{repository.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewRepository}
              className="ml-4"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              查看仓库
            </Button>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-3">加载中...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="overview" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="discussions">
                  <MessageCircle className="h-4 w-4 mr-2" /> 讨论
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="overview"
                className="flex-1 overflow-y-auto space-y-6"
              >
                {/* 仓库信息 */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={repository.owner.avatar || undefined} />
                      <AvatarFallback>
                        {repository.owner.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {repository.owner.username}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span className="font-semibold">{repository.name}</span>
                      </div>

                      {repository.description && (
                        <p className="text-muted-foreground">
                          {repository.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            创建于{' '}
                            {formatDistanceToNow(
                              new Date(repository.createdAt),
                              {
                                addSuffix: true,
                                locale: zhCN,
                              }
                            )}
                          </span>
                        </div>

                        {repository.publishedAt && (
                          <div className="flex items-center space-x-1">
                            <span>
                              发布于{' '}
                              {formatDistanceToNow(
                                new Date(repository.publishedAt),
                                {
                                  addSuffix: true,
                                  locale: zhCN,
                                }
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 标签和语言 */}
                  <div className="flex flex-wrap gap-2">
                    {repository.language && (
                      <Badge variant="secondary">{repository.language}</Badge>
                    )}
                    {repository.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* 统计信息 */}
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>
                        {repositoryDetail?.stars || repository.stars} 点赞
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{repository.viewCount} 浏览</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <GitBranch className="h-4 w-4" />
                      <span>多分支</span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex space-x-3">
                    <Button
                      variant={
                        repositoryDetail?.isLiked ? 'default' : 'outline'
                      }
                      onClick={handleLike}
                      disabled={isLiking}
                      className="flex-1"
                      aria-label={
                        repositoryDetail?.isLiked ? '取消点赞' : '点赞'
                      }
                    >
                      {isLiking ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Heart
                          className={`h-4 w-4 mr-2 ${repositoryDetail?.isLiked ? 'fill-current' : ''}`}
                        />
                      )}
                      {repositoryDetail?.isLiked ? '已点赞' : '点赞'}
                    </Button>

                    <Button
                      variant={
                        repositoryDetail?.isCollected ? 'default' : 'outline'
                      }
                      onClick={handleCollect}
                      disabled={isCollecting}
                      className="flex-1"
                      aria-label={
                        repositoryDetail?.isCollected ? '取消收藏' : '收藏'
                      }
                    >
                      {isCollecting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Bookmark
                          className={`h-4 w-4 mr-2 ${repositoryDetail?.isCollected ? 'fill-current' : ''}`}
                        />
                      )}
                      {repositoryDetail?.isCollected ? '已收藏' : '收藏'}
                    </Button>
                  </div>
                </div>

                {/* 封面图片 */}
                {repository.coverImage && (
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src={repository.coverImage}
                      alt={`${repository.name} 封面`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 768px"
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent
                value="discussions"
                className="flex-1 overflow-y-auto"
              >
                <RepositoryComments repositoryId={repository.id} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
