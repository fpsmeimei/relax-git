'use client';

import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';

interface Movie {
  id: number;
  title: string;
  rating: string;
  poster: string;
  year?: string;
}

interface MovieRowProps {
  title: string;
  movies: Movie[];
  icon?: React.ReactNode;
  /** 点击电影卡片时的回调 */
  onMovieClick?: (title: string) => void;
}

export function MovieRow({ title, movies, icon, onMovieClick }: MovieRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-[#3B4252] hover:bg-[#4C566A] text-[#D8DEE9] flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-[#3B4252] hover:bg-[#4C566A] text-[#D8DEE9] flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {movies.map(movie => (
          <div
            key={movie.id}
            className="group relative flex-shrink-0 w-44 bg-[#3B4252] rounded-lg overflow-hidden border border-[#4C566A]/30 hover:border-[#88C0D0]/50 hover:shadow-lg hover:shadow-[#88C0D0]/10 transition-all cursor-pointer"
          >
            <div className="relative aspect-[2/3]">
              <Image
                src={movie.poster}
                alt={movie.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* 评分徽章 */}
              <div className="absolute top-2 right-2 bg-[#EBCB8B]/90 px-2 py-1 rounded-md">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-[#2E3440] fill-[#2E3440]" />
                  <span className="text-xs font-semibold text-[#2E3440]">
                    {movie.rating}
                  </span>
                </div>
              </div>
              {/* 悬浮遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2E3440]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="flex gap-2">
                    <button className="flex-1 bg-[#88C0D0] text-[#2E3440] text-xs py-1.5 rounded-md hover:bg-[#88C0D0]/90 transition-colors">
                      咨询
                    </button>
                    <button className="px-3 bg-[#3B4252] text-[#D8DEE9] text-xs py-1.5 rounded-md hover:bg-[#4C566A] transition-colors">
                      ♡
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm text-[#ECEFF4] truncate group-hover:text-[#88C0D0] transition-colors">
                {movie.title}
              </p>
              {movie.year && (
                <p className="text-xs text-[#D8DEE9]/50 mt-1">{movie.year}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
