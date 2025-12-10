'use client';

import { Button } from '@/components/ui/button';
import {
  BookmarkPlus,
  ExternalLink,
  Film,
  Star,
  Calendar,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export interface MovieCardProps {
  title: string;
  year?: string | undefined;
  rating?: string | undefined;
  director?: string | undefined;
  poster?: string | undefined;
  description?: string | undefined;
  onSave?: () => void;
  onViewDetails?: () => void;
  onFindSimilar?: () => void;
}

export function MovieCard({
  title,
  year,
  rating,
  director,
  poster,
  description,
  onSave,
  onViewDetails,
  onFindSimilar,
}: MovieCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group relative bg-[#3B4252] rounded-lg overflow-hidden border border-[#4C566A]/30 hover:border-[#88C0D0]/50 transition-all duration-300">
      <div className="relative flex gap-4 p-4">
        {/* 电影海报 */}
        <div className="relative w-28 h-40 flex-shrink-0 rounded-md overflow-hidden bg-[#2E3440]">
          {poster && !imageError ? (
            <>
              <Image
                src={poster}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="128px"
                onError={() => setImageError(true)}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#2E3440]">
              <Film className="w-10 h-10 text-[#4C566A]" />
            </div>
          )}

          {/* 评分徽章 */}
          {rating && (
            <div className="absolute top-2 right-2 bg-[#EBCB8B]/90 px-2 py-1 rounded-md">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-[#2E3440] fill-[#2E3440]" />
                <span className="text-xs font-semibold text-[#2E3440]">
                  {rating}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 电影信息区域 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 标题 */}
          <h3 className="text-base font-medium text-[#ECEFF4] mb-2 group-hover:text-[#88C0D0] transition-colors line-clamp-2">
            {title}
          </h3>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {year && (
              <div className="flex items-center gap-1.5 text-xs text-[#D8DEE9]/60">
                <Calendar className="w-3.5 h-3.5" />
                <span>{year}</span>
              </div>
            )}
            {director && (
              <div className="flex items-center gap-1.5 text-xs text-[#D8DEE9]/60">
                <User className="w-3.5 h-3.5" />
                <span className="truncate max-w-[150px]">{director}</span>
              </div>
            )}
          </div>

          {/* 描述 */}
          {description && (
            <p className="text-xs text-[#D8DEE9]/70 leading-relaxed mb-3 line-clamp-2 flex-1">
              {description}
            </p>
          )}

          {/* 操作按钮组 */}
          <div className="flex flex-wrap gap-2 mt-auto">
            {onSave && (
              <Button
                size="sm"
                variant="outline"
                className="border-[#4C566A] bg-[#434C5E] text-[#D8DEE9] hover:border-[#88C0D0]/50 hover:bg-[#4C566A] hover:text-[#88C0D0] transition-colors"
                onClick={onSave}
              >
                <BookmarkPlus className="w-3.5 h-3.5 mr-1.5" />
                <span className="text-xs">收藏</span>
              </Button>
            )}

            {onViewDetails && (
              <Button
                size="sm"
                variant="outline"
                className="border-[#4C566A] bg-[#434C5E] text-[#D8DEE9] hover:border-[#81A1C1]/50 hover:bg-[#4C566A] hover:text-[#81A1C1] transition-colors"
                onClick={onViewDetails}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                <span className="text-xs">详情</span>
              </Button>
            )}

            {onFindSimilar && (
              <Button
                size="sm"
                variant="outline"
                className="border-[#4C566A] bg-[#434C5E] text-[#D8DEE9] hover:border-[#B48EAD]/50 hover:bg-[#4C566A] hover:text-[#B48EAD] transition-colors"
                onClick={onFindSimilar}
              >
                <Film className="w-3.5 h-3.5 mr-1.5" />
                <span className="text-xs">相似推荐</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
