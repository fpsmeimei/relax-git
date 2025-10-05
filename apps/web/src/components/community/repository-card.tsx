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
import { formatSmartTime } from '@/lib/utils/format-time';
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
import { VisibilityBadge } from './visibility-badge';

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

  // 当外部列表中的仓库数据发生变化（例如在详情弹窗中点赞）时，同步本地显示状态
  useEffect(() => {
    setLocalStars(repository.stars);
    setLocalIsLiked(repository.isLiked || false);
  }, [repository.id, repository.stars, repository.isLiked]);

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
    return formatSmartTime(date);
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
        <CardHeader className="pb-4">
          {/* 封面图片 */}
          <div className="relative w-full h-36 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
            {repository.coverImage ? (
              <Image
                src={repository.coverImage}
                alt={repository.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            ) : (
              <GitBranch className="h-8 w-8 text-primary/40" />
            )}
            {/* 可见性徽章 */}
            <div className="absolute top-3 right-3">
              <VisibilityBadge visibility={repository.visibility} />
            </div>
          </div>

          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors mb-3">
            {repository.name}
            <ExternalLink className="inline-block ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </CardTitle>

          <CardDescription className="line-clamp-2 text-base leading-relaxed">
            {repository.description || '暂无描述'}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* 标签 */}
          <div className="flex flex-wrap gap-2">
            {repository.language && (
              <Badge variant="secondary" className="text-xs px-2.5 py-1">
                {repository.language}
              </Badge>
            )}
            {repository.tags.slice(0, 2).map(tag => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-2.5 py-1"
              >
                {tag}
              </Badge>
            ))}
            {repository.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-2.5 py-1">
                +{repository.tags.length - 2}
              </Badge>
            )}
          </div>

          {/* 作者信息 */}
          <div className="flex items-center gap-3">
            <Avatar className="h-7 w-7">
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
                <span>{(repository.commentsCount ?? 0).toLocaleString()}</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
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
