'use client';

import { useState } from 'react';
import { TrendingUp, Film, Star, Sparkles, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MovieRow } from '@/components/movie/movie-row';
import Image from 'next/image';

interface MovieDiscoverPanelProps {
  /** 显示模式 */
  mode?: 'embedded' | 'standalone';
  /** 点击电影时的回调 - 填充到输入框 */
  onAskMovie?: (title: string) => void;
  /** 点击分类时的回调 */
  onSelectGenre?: (genre: string) => void;
  /** 点击横幅按钮的回调 */
  onAskFeatured?: () => void;
}

export function MovieDiscoverPanel({
  mode = 'embedded',
  onAskMovie,
  onSelectGenre,
  onAskFeatured,
}: MovieDiscoverPanelProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // 精选电影
  const featuredMovie = {
    title: '星际穿越',
    description: 'AI推荐：这部硬核科幻巨作探讨了时间、空间与爱的永恒命题',
    rating: '9.3',
    backdrop: 'https://image.tmdb.org/t/p/w780/xu9zaAevzQ5nnrsXN6JcahLnG4i.jpg',
  };

  // 电影数据（使用真实TMDB海报）
  const dailyRecommendations = [
    {
      id: 1,
      title: '肖申克的救赎',
      rating: '9.7',
      poster: 'https://image.tmdb.org/t/p/w342/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
      year: '1994',
    },
    {
      id: 2,
      title: '盗梦空间',
      rating: '9.3',
      poster: 'https://image.tmdb.org/t/p/w342/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
      year: '2010',
    },
    {
      id: 3,
      title: '泰坦尼克号',
      rating: '9.4',
      poster: 'https://image.tmdb.org/t/p/w342/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg',
      year: '1997',
    },
    {
      id: 4,
      title: '阿甘正传',
      rating: '9.5',
      poster: 'https://image.tmdb.org/t/p/w342/saHP97rTPS5eLmrLQEcANmKrsFl.jpg',
      year: '1994',
    },
    {
      id: 5,
      title: '千与千寻',
      rating: '9.4',
      poster: 'https://image.tmdb.org/t/p/w342/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
      year: '2001',
    },
    {
      id: 6,
      title: '辛德勒的名单',
      rating: '9.5',
      poster: 'https://image.tmdb.org/t/p/w342/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
      year: '1993',
    },
  ];

  const trendingMovies = [
    {
      id: 11,
      title: '沙丘',
      rating: '8.7',
      poster: 'https://image.tmdb.org/t/p/w342/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
      year: '2021',
    },
    {
      id: 12,
      title: '奥本海默',
      rating: '8.8',
      poster: 'https://image.tmdb.org/t/p/w342/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      year: '2023',
    },
    {
      id: 13,
      title: '瞬息全宇宙',
      rating: '8.4',
      poster: 'https://image.tmdb.org/t/p/w342/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
      year: '2022',
    },
    {
      id: 14,
      title: '阿凡达：水之道',
      rating: '8.2',
      poster: 'https://image.tmdb.org/t/p/w342/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
      year: '2022',
    },
  ];

  const classicMovies = [
    {
      id: 21,
      title: '教父',
      rating: '9.3',
      poster: 'https://image.tmdb.org/t/p/w342/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      year: '1972',
    },
    {
      id: 22,
      title: '低俗小说',
      rating: '8.9',
      poster: 'https://image.tmdb.org/t/p/w342/dRfyPvGH2CkJzBKg8VqZfFZy9fV.jpg',
      year: '1994',
    },
    {
      id: 23,
      title: '搏击俱乐部',
      rating: '9.0',
      poster: 'https://image.tmdb.org/t/p/w342/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg',
      year: '1999',
    },
    {
      id: 24,
      title: '黑客帝国',
      rating: '9.0',
      poster: 'https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      year: '1999',
    },
  ];

  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre);
    onSelectGenre?.(genre);
  };

  const isEmbedded = mode === 'embedded';

  return (
    <div
      className={`bg-[#2E3440] text-[#ECEFF4] ${isEmbedded ? 'max-h-[600px] overflow-y-auto' : ''}`}
    >
      {/* 精选横幅 - embedded模式下缩小 */}
      <div
        className={`relative ${isEmbedded ? 'h-40' : 'h-64'} rounded-xl overflow-hidden mb-6 group`}
      >
        <Image
          src={featuredMovie.backdrop}
          alt={featuredMovie.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2E3440]/95 via-[#2E3440]/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center p-6">
          <div className="flex items-center gap-2 mb-1">
            <Star
              className={`${isEmbedded ? 'w-3 h-3' : 'w-4 h-4'} text-[#EBCB8B] fill-[#EBCB8B]`}
            />
            <span
              className={`${isEmbedded ? 'text-sm' : 'text-base'} text-[#EBCB8B] font-semibold`}
            >
              {featuredMovie.rating}
            </span>
          </div>
          <h2
            className={`${isEmbedded ? 'text-2xl' : 'text-4xl'} font-bold mb-2`}
          >
            {featuredMovie.title}
          </h2>
          <p
            className={`${isEmbedded ? 'text-xs' : 'text-sm'} text-[#D8DEE9]/80 max-w-md mb-3`}
          >
            {featuredMovie.description}
          </p>
          <div>
            <Button
              onClick={() => onAskFeatured?.()}
              size={isEmbedded ? 'sm' : 'default'}
              className="bg-[#88C0D0] text-[#2E3440] hover:bg-[#88C0D0]/90"
            >
              立即咨询AI
            </Button>
          </div>
        </div>
      </div>

      {/* 每日推荐 */}
      <MovieRow
        title="每日推荐"
        movies={dailyRecommendations}
        icon={<Sparkles className="w-5 h-5 text-[#EBCB8B]" />}
      />

      {/* 热门榜单 */}
      <MovieRow
        title="热门榜单"
        movies={trendingMovies}
        icon={<TrendingUp className="w-5 h-5 text-[#BF616A]" />}
      />

      {/* 经典佳作 */}
      <MovieRow
        title="经典佳作"
        movies={classicMovies}
        icon={<Award className="w-5 h-5 text-[#B48EAD]" />}
      />

      {/* 分类推荐 */}
      <section className="mb-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Film className="w-5 h-5 text-[#81A1C1]" />
            分类推荐
          </h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['科幻', '爱情', '悬疑', '动作', '喜剧', '动画'].map(genre => (
            <Button
              key={genre}
              variant="outline"
              size="sm"
              onClick={() => handleGenreClick(genre)}
              className={`border-[#4C566A] bg-[#3B4252] text-[#D8DEE9] hover:bg-[#4C566A] hover:text-[#88C0D0] hover:border-[#88C0D0]/30 ${
                selectedGenre === genre
                  ? 'bg-[#88C0D0]/20 border-[#88C0D0]/50 text-[#88C0D0]'
                  : ''
              }`}
            >
              {genre}
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
