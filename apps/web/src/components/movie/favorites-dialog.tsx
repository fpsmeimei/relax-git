'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MovieCard } from './movie-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Trash2 } from 'lucide-react';
import { getMovieFavorites, removeMovieFavorite } from '@/lib/api/movies';

interface FavoritesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDetails?: (title: string) => void;
  onFindSimilar?: (title: string) => void;
}

export function FavoritesDialog({
  open,
  onOpenChange,
  onViewDetails,
  onFindSimilar,
}: FavoritesDialogProps) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 6;
  const totalPages = Math.ceil(total / pageSize);

  useEffect(() => {
    if (!open) return;

    const loadFavorites = async () => {
      setLoading(true);
      try {
        const data = await getMovieFavorites(page, pageSize);
        setFavorites(data.favorites);
        setTotal(data.total);
      } catch (error) {
        console.error('Failed to load favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [open, page]);

  const handleRemove = async (favoriteId: string, title: string) => {
    if (!confirm(`确定要移除《${title}》吗？`)) return;

    try {
      await removeMovieFavorite(favoriteId);
      // 重新加载当前页
      const data = await getMovieFavorites(page, pageSize);
      setFavorites(data.favorites);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      alert('移除失败，请稍后重试');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-[#2E3440] border-[#4C566A]">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#ECEFF4] flex items-center gap-2">
            📌 我的收藏 {total > 0 && `(${total})`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 收藏列表 */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#88C0D0] animate-spin" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12 text-[#D8DEE9]/50">
              <p>还没有收藏任何电影</p>
              <p className="text-xs mt-2">在 AI 对话中收藏喜欢的电影吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-2">
              {favorites.map(fav => (
                <div key={fav.id} className="relative">
                  <MovieCard
                    title={fav.title}
                    year={fav.year}
                    rating={fav.rating}
                    director={fav.director}
                    poster={fav.posterUrl}
                    {...(onViewDetails && {
                      onViewDetails: () => onViewDetails(fav.title),
                    })}
                    {...(onFindSimilar && {
                      onFindSimilar: () => onFindSimilar(fav.title),
                    })}
                  />
                  {/* 移除按钮 */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-[#BF616A]/90 hover:bg-[#BF616A] text-white border-0"
                    onClick={() => handleRemove(fav.id, fav.title)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[#4C566A]/30">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="border-[#4C566A] bg-[#434C5E] text-[#D8DEE9] hover:bg-[#4C566A] disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                上一页
              </Button>

              <span className="text-sm text-[#D8DEE9]/70">
                {page} / {totalPages}
              </span>

              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="border-[#4C566A] bg-[#434C5E] text-[#D8DEE9] hover:bg-[#4C566A] disabled:opacity-50"
              >
                下一页
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
