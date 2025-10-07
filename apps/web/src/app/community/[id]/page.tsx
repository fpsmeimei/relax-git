'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { CommunityAPI, CommunityFeedItem } from '@/lib/api/community';
import {
  Eye,
  GitBranch,
  Heart,
  Loader2,
  MessageCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RepositoryComments } from '@/components/community/repository-comments';

interface CommunityDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    commentId?: string;
  }>;
}

export default function CommunityDetailPage({
  params,
  searchParams,
}: CommunityDetailPageProps) {
  const { user } = useAuth();
  const router = useRouter();

  // 解包 Promise 参数
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);

  const [repository, setRepository] = useState<CommunityFeedItem | null>(null);
  const [repositoryDetail, setRepositoryDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [comments, setComments] = useState<any[]>([]);

  // 计算评论总数（主评论 + 次评论）
  const totalCommentsCount = comments.reduce(
    (total, comment) => total + 1 + (comment.replies?.length || 0),
    0
  );

  // 加载仓库详情
  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      try {
        const detail = await CommunityAPI.getRepositoryDetail(
          resolvedParams.id
        );
        setRepository(detail);
        setRepositoryDetail(detail);

        // 记录浏览
        await CommunityAPI.recordRepositoryView(resolvedParams.id);
      } catch (error) {
        console.error('加载仓库详情失败:', error);
        toast.error('加载仓库详情失败');
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams.id) {
      loadDetail();
    }
  }, [resolvedParams.id]);

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
    } catch (error) {
      toast.error('操作失败，请重试');
    } finally {
      setIsLiking(false);
    }
  };

  // 跳转到仓库页面
  const handleViewRepository = () => {
    if (repository) {
      router.push(`/repositories/${repository.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-responsive py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-3">加载中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-responsive py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">仓库不存在</h1>
            <Button asChild variant="outline">
              <Link href="/community">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回社区
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-responsive py-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/community">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回社区
            </Link>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 仓库信息卡片 */}
          <div className="card p-8 mb-8">
            {/* 标题和操作 */}
            <div className="flex items-start justify-between mb-6">
              <h1 className="text-3xl font-bold">{repository.name}</h1>
              <Button variant="outline" onClick={handleViewRepository}>
                <GitBranch className="h-4 w-4 mr-2" />
                查看仓库
              </Button>
            </div>

            {/* 仓库信息 */}
            <div className="space-y-6">
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
                    <p className="text-lg text-muted-foreground">
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

              {/* 统计信息和点赞 */}
              <div className="flex items-center justify-between">
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
                    <span>{totalCommentsCount.toLocaleString()} 评论</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <GitBranch className="h-4 w-4" />
                    <span>多分支</span>
                  </div>
                </div>

                <Button
                  onClick={handleLike}
                  disabled={isLiking}
                  variant={repositoryDetail?.isLiked ? 'default' : 'outline'}
                  className="flex items-center space-x-2"
                >
                  {isLiking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart
                      className={`h-4 w-4 ${
                        repositoryDetail?.isLiked ? 'fill-current' : ''
                      }`}
                    />
                  )}
                  <span>{repositoryDetail?.isLiked ? '已点赞' : '点赞'}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* 评论区域 */}
          <div className="card p-8">
            <h2 className="text-xl font-semibold mb-6">
              评论 ({totalCommentsCount})
            </h2>
            <RepositoryComments
              repositoryId={repository.id}
              highlightCommentId={resolvedSearchParams.commentId}
              onCommentsChange={setComments}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
