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
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { CommunityAPI, CommunityFeedItem } from '@/lib/api/community';
import {
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
  highlightCommentId?: string | null;
}

export function RepositoryDetailModal({
  repository,
  open,
  onOpenChange,
  onLikeChange,
  highlightCommentId,
}: RepositoryDetailModalProps) {
  const { user } = useAuth();
  const [repositoryDetail, setRepositoryDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

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
    if (!user) {
      toast.error('请先登录');
      return;
    }

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

  // 跳转到仓库页面
  const handleViewRepository = () => {
    if (repository) {
      window.open(`/repositories/${repository.id}`, '_blank');
    }
  };

  if (!repository) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[1400px] h-[90vh] overflow-hidden flex flex-col">
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
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 概览区域 - 固定高度 */}
            <div className="flex-shrink-0 p-6 space-y-6 overflow-y-auto max-h-[300px]">
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
                      {(
                        repositoryDetail?.stars ?? repository.stars
                      ).toLocaleString()}{' '}
                      点赞
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{repository.viewCount.toLocaleString()} 浏览</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>
                      {(
                        repositoryDetail?.commentsCount ??
                        repository.commentsCount ??
                        0
                      ).toLocaleString()}{' '}
                      评论
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <GitBranch className="h-4 w-4" />
                    <span>多分支</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 评论区域 - 占据剩余空间 */}
            <div className="flex-1 flex flex-col min-h-0 px-6 border-t pt-6">
              <RepositoryComments
                repositoryId={repository.id}
                highlightCommentId={highlightCommentId}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
