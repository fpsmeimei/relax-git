'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Search, Star, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';

export interface CommunityFilters {
  sort: 'latest' | 'trending' | 'popular';
  search?: string | undefined;
}

interface CommunityFiltersProps {
  filters: CommunityFilters;
  onFiltersChange: (filters: CommunityFilters) => void;
  loading?: boolean;
}

export function CommunityFilters({
  filters,
  onFiltersChange,
  loading,
}: CommunityFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSortChange = (sort: 'latest' | 'trending' | 'popular') => {
    onFiltersChange({ ...filters, sort });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({
      ...filters,
      search: searchInput.trim() || undefined,
    });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    onFiltersChange({
      sort: 'latest',
      search: undefined,
    });
  };

  const hasActiveFilters = !!filters.search;

  return (
    <div className="space-y-4 glass-md p-6">
      {/* 搜索栏 */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col gap-3 md:flex-row"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目名称或描述..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="glass-input pl-10"
          />
        </div>
        <Button type="submit" disabled={loading} className="md:w-auto">
          搜索
        </Button>
      </form>

      {/* 排序选项 */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-secondary p-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">排序：</Label>
          <div className="flex gap-1">
            <Button
              variant={filters.sort === 'latest' ? 'soft' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('latest')}
              disabled={loading}
              className="transition-transform hover:-translate-y-0.5"
            >
              <Clock className="h-4 w-4 mr-1" />
              最新
            </Button>
            <Button
              variant={filters.sort === 'trending' ? 'soft' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('trending')}
              disabled={loading}
              className="transition-transform hover:-translate-y-0.5"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              趋势
            </Button>
            <Button
              variant={filters.sort === 'popular' ? 'soft' : 'outline'}
              size="sm"
              onClick={() => handleSortChange('popular')}
              disabled={loading}
              className="transition-transform hover:-translate-y-0.5"
            >
              <Star className="h-4 w-4 mr-1" />
              热门
            </Button>
          </div>
        </div>

        {/* 清除搜索 */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            清除搜索
          </Button>
        )}
      </div>
    </div>
  );
}
