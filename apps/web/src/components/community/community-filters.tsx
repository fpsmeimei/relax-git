'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CommunityAPI, PopularLanguage, PopularTag } from '@/lib/api/community';
import { Clock, Code, Filter, Search, Star, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface CommunityFilters {
  sort: 'latest' | 'trending' | 'popular';
  language?: string | undefined;
  tags: string[];
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
  const [popularTags, setPopularTags] = useState<PopularTag[]>([]);
  const [popularLanguages, setPopularLanguages] = useState<PopularLanguage[]>(
    []
  );
  const [tagsLoading, setTagsLoading] = useState(false);
  const [languagesLoading, setLanguagesLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  // 加载热门标签和语言
  useEffect(() => {
    loadPopularData();
  }, []);

  const loadPopularData = async () => {
    try {
      setTagsLoading(true);
      setLanguagesLoading(true);

      const [tagsResponse, languagesResponse] = await Promise.all([
        CommunityAPI.getPopularTags(20),
        CommunityAPI.getPopularLanguages(15),
      ]);

      setPopularTags(tagsResponse);
      setPopularLanguages(languagesResponse);
    } catch (error) {
      console.error('加载热门数据失败:', error);
    } finally {
      setTagsLoading(false);
      setLanguagesLoading(false);
    }
  };

  const handleSortChange = (sort: 'latest' | 'trending' | 'popular') => {
    onFiltersChange({ ...filters, sort });
  };

  const handleLanguageChange = (language: string) => {
    onFiltersChange({
      ...filters,
      language: language === 'all' ? undefined : language,
    });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];

    onFiltersChange({ ...filters, tags: newTags });
  };

  const handleTagRemove = (tag: string) => {
    onFiltersChange({
      ...filters,
      tags: filters.tags.filter(t => t !== tag),
    });
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
      tags: [],
      language: undefined,
      search: undefined,
    });
  };

  const hasActiveFilters =
    filters.language || filters.tags.length > 0 || filters.search;

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

      {/* 排序和过滤器 */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-secondary p-4">
        {/* 排序选项 */}
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

        <Separator orientation="vertical" className="h-6" />

        {/* 编程语言过滤 */}
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">语言：</Label>
          <Select
            value={filters.language || 'all'}
            onValueChange={handleLanguageChange}
            disabled={loading || languagesLoading}
          >
            <SelectTrigger className="glass-select w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-popover">
              <SelectItem value="all">全部</SelectItem>
              {popularLanguages.map(lang => (
                <SelectItem key={lang.language} value={lang.language}>
                  <div className="flex items-center justify-between w-full">
                    <span>{lang.language}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {lang.count}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 标签过滤 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || tagsLoading}
              className="h-9 rounded-full border border-border bg-secondary backdrop-blur-md transition-colors hover:bg-secondary/80"
            >
              <Filter className="h-4 w-4 mr-1" />
              标签
              {filters.tags.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {filters.tags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="glass-popover w-80" align="start">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground/90">
                选择标签
              </h4>
              <div className="flex max-h-48 flex-wrap gap-1 overflow-y-auto">
                {popularTags.map(tag => (
                  <Button
                    key={tag.tag}
                    variant={
                      filters.tags.includes(tag.tag) ? 'default' : 'outline'
                    }
                    size="sm"
                    onClick={() => handleTagToggle(tag.tag)}
                    className="text-xs h-7 rounded-full border-border bg-secondary hover:bg-secondary/80"
                  >
                    {tag.tag}
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {tag.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* 清除过滤器 */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            清除
          </Button>
        )}
      </div>

      {/* 已选择的过滤器 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              搜索: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setSearchInput('');
                  onFiltersChange({ ...filters, search: undefined });
                }}
              />
            </Badge>
          )}
          {filters.language && (
            <Badge variant="secondary" className="gap-1">
              <Code className="h-3 w-3" />
              {filters.language}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleLanguageChange('all')}
              />
            </Badge>
          )}
          {filters.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleTagRemove(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
