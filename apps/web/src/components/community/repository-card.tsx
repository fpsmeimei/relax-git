'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { CommunityAPI, CommunityFeedItem } from '@/lib/api/community';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Calendar,
  ExternalLink,
  Eye,
  GitBranch,
  Heart,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface RepositoryCardProps {
  repository: CommunityFeedItem;
  onLikeChange?: (repoId: string, newStars: number, isLiked: boolean) => void;
  onView?: (repoId: string) => void;
  onClick?: () => void;
}

export function RepositoryCard({
  repository,
  onLikeChange,
  onView,
  onClick,
}: RepositoryCardProps) {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [localStars, setLocalStars] = useState(repository.stars);
  const [localIsLiked, setLocalIsLiked] = useState(repository.isLiked || false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('请先登录');
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await CommunityAPI.toggleRepositoryLike(repository.id);
      setLocalIsLiked(response.isLiked);
      setLocalStars(response.likesCount);

      toast.success(response.isLiked ? '点赞成功' : '已取消点赞');
      onLikeChange?.(repository.id, response.likesCount, response.isLiked);
    } catch (error) {
      console.error('点赞操作失败:', error);
      toast.error('操作失败，请重试');
    } finally {
      setIsLiking(false);
    }
  };

  const handleCardClick = async (e: React.MouseEvent) => {
    // 如果有自定义onClick，使用它；否则跳转到仓库页面
    if (onClick) {
      e.preventDefault();
      onClick();
    }

    // 记录浏览（点击打点），若已曝光打点则跳过重复上报
    if (!hasTrackedView) {
      try {
        await CommunityAPI.recordRepositoryView(repository.id);
        onView?.(repository.id);
        setHasTrackedView(true);
      } catch (error) {
        console.error('记录浏览失败:', error);
      }
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: zhCN,
    });
  };

  // 曝光打点：首次出现在视口中即上报一次浏览
  useEffect(() => {
    if (!cardRef.current || hasTrackedView) return;

    const el = cardRef.current;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            CommunityAPI.recordRepositoryView(repository.id)
              .then(() => onView?.(repository.id))
              .catch(err => console.warn('曝光上报失败:', err));
            setHasTrackedView(true);
            io.unobserve(el);
          }
        });
      },
      { threshold: [0, 0.5, 1] }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [cardRef, repository.id, hasTrackedView, onView]);

  return (
    <Card
      ref={cardRef}
      className="hover:shadow-md transition-all duration-200 cursor-pointer group"
    >
      <Link
        href={`/repositories/${repository.id}`}
        onClick={handleCardClick}
        className="block"
      >
        <CardHeader className="pb-3">
          {/* 封面图片 */}
          <div className="relative w-full h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-md mb-3 flex items-center justify-center overflow-hidden">
            {repository.coverImage ? (
              <Image
                src={repository.coverImage}
                alt={repository.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            ) : (
              <GitBranch className="h-8 w-8 text-primary/40" />
            )}
          </div>

          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {repository.name}
            <ExternalLink className="inline-block ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </CardTitle>

          <CardDescription className="line-clamp-2">
            {repository.description || '暂无描述'}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          {/* 标签 */}
          <div className="flex flex-wrap gap-1 mb-3">
            {repository.language && (
              <Badge variant="secondary" className="text-xs">
                {repository.language}
              </Badge>
            )}
            {repository.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {repository.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{repository.tags.length - 2}
              </Badge>
            )}
          </div>

          {/* 作者信息 */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={repository.owner.avatar || undefined} />
              <AvatarFallback className="text-xs">
                {repository.owner.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-muted-foreground">
              {repository.owner.username}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {repository.publishedAt
                ? formatTime(repository.publishedAt)
                : formatTime(repository.createdAt)}
            </div>
          </div>

          {/* 互动数据 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{repository.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>0</span> {/* 评论数暂时显示0，后续可以从API获取 */}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={`transition-colors ${
                localIsLiked
                  ? 'text-destructive hover:text-destructive'
                  : 'text-muted-foreground hover:text-destructive'
              }`}
              aria-label={localIsLiked ? '取消点赞' : '点赞'}
            >
              <Heart
                className={`h-4 w-4 mr-1 transition-all ${
                  localIsLiked ? 'fill-current' : ''
                }`}
              />
              {localStars.toLocaleString()}
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
