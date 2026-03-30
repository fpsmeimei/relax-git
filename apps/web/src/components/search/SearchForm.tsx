import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, X } from 'lucide-react';
import React, { useState } from 'react';
import { useSearchStore } from '../../stores/searchStore';
import { CreateSearchRequest, SearchType } from '../../types/search';

interface SearchFormProps {
  repositoryId: string;
  repositoryName: string;
  snapshotId?: string;
  snapshotTitle?: string;
  onSearchStart?: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  repositoryId,
  repositoryName,
  snapshotId,
  snapshotTitle,
  onSearchStart,
}) => {
  const {
    searchForm,
    isSearching,
    searchError,
    setSearchForm,
    createSearch,
    clearCurrentSearch,
  } = useSearchStore();

  const [localQuery, setLocalQuery] = useState(searchForm.query);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!localQuery.trim()) {
      return;
    }

    const searchRequest: CreateSearchRequest = {
      repositoryId,
      query: localQuery.trim(),
      searchType: searchForm.searchType,
      maxResults: searchForm.maxResults,
      ...(snapshotId ? { snapshotId } : {}),
    };

    setSearchForm({ query: localQuery.trim() });
    await createSearch(searchRequest);
    onSearchStart?.();
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchForm({ query: '' });
    clearCurrentSearch();
  };

  const searchTypeLabels = {
    [SearchType.CONTENT]: '内容搜索',
    [SearchType.FILENAME]: '文件名搜索',
    [SearchType.REGEX]: '正则表达式',
  };

  const searchTypeDescriptions = {
    [SearchType.CONTENT]: '在文件内容中搜索关键词',
    [SearchType.FILENAME]: '在文件名中搜索关键词',
    [SearchType.REGEX]: '使用正则表达式进行高级搜索',
  };

  return (
    <Card className="overflow-hidden border-border/60 bg-card/90 shadow-sm backdrop-blur">
      <CardContent className="space-y-6 p-6 md:p-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            代码搜索
          </h2>
          <p className="text-sm text-muted-foreground">
            在当前仓库或快照里查找内容、文件名或正则匹配。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline-subtle">仓库: {repositoryName}</Badge>
          {snapshotId && snapshotTitle ? (
            <Badge variant="outline-subtle">版本: {snapshotTitle}</Badge>
          ) : null}
        </div>

        {searchError ? (
          <Alert variant="destructive">{searchError}</Alert>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="search-query">搜索关键词</Label>
            <div className="relative">
              <Input
                id="search-query"
                placeholder="输入要搜索的内容..."
                value={localQuery}
                onChange={e => setLocalQuery(e.target.value)}
                disabled={isSearching}
                className="pr-12"
              />
              {localQuery ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClear}
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search-type">搜索类型</Label>
              <select
                id="search-type"
                value={searchForm.searchType}
                onChange={e =>
                  setSearchForm({ searchType: e.target.value as SearchType })
                }
                disabled={isSearching}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {(
                  Object.entries(searchTypeLabels) as [SearchType, string][]
                ).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {searchTypeDescriptions[searchForm.searchType]}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-results">最大结果数</Label>
              <Input
                id="max-results"
                type="number"
                min={1}
                max={1000}
                value={searchForm.maxResults}
                onChange={e =>
                  setSearchForm({ maxResults: parseInt(e.target.value) || 100 })
                }
                disabled={isSearching}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!localQuery.trim() || isSearching}
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                搜索中...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                开始搜索
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
