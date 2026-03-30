import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, History as HistoryIcon, Trash2 } from 'lucide-react';
import { formatSmartTime } from '@/lib/utils/format-time';
import React, { useEffect } from 'react';
import { useSearchStore } from '../../stores/searchStore';
import { SearchType } from '../../types/search';

interface SearchHistoryProps {
  repositoryId?: string;
  onHistoryItemClick?: (query: string, searchType: SearchType) => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  repositoryId,
  onHistoryItemClick,
}) => {
  const {
    searchHistory,
    historyLoading,
    historyError,
    historyPagination,
    loadSearchHistory,
    deleteSearchHistory,
  } = useSearchStore();

  useEffect(() => {
    loadSearchHistory(repositoryId);
  }, [repositoryId, loadSearchHistory]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    loadSearchHistory(repositoryId, page);
  };

  const handleDeleteHistory = async (
    historyId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    await deleteSearchHistory(historyId);
  };

  const handleHistoryItemClick = (query: string, searchType: SearchType) => {
    onHistoryItemClick?.(query, searchType);
  };

  const searchTypeLabels = {
    [SearchType.CONTENT]: '内容',
    [SearchType.FILENAME]: '文件名',
    [SearchType.REGEX]: '正则',
  };

  const searchTypeColors = {
    [SearchType.CONTENT]: 'primary' as const,
    [SearchType.FILENAME]: 'secondary' as const,
    [SearchType.REGEX]: 'warning' as const,
  };

  if (historyLoading) {
    return (
      <Card className="border-border/60 bg-card/90 shadow-sm">
        <CardContent className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">加载搜索历史...</span>
        </CardContent>
      </Card>
    );
  }

  if (historyError) {
    return (
      <Card className="border-border/60 bg-card/90 shadow-sm">
        <CardContent className="p-6">
          <Alert variant="destructive">{historyError}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (searchHistory.length === 0) {
    return (
      <Card className="border-border/60 bg-card/90 shadow-sm">
        <CardContent className="p-6">
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-10 text-center">
            <HistoryIcon className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              暂无搜索历史
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              开始搜索后，历史记录将显示在这里
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.max(
    1,
    Math.ceil(historyPagination.total / historyPagination.limit)
  );

  return (
    <Card className="border-border/60 bg-card/90 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <h3 className="text-lg font-semibold text-foreground">搜索历史</h3>

        <div className="space-y-3">
          {searchHistory.map(item => {
            const clickable = Boolean(onHistoryItemClick);

            return (
              <div
                key={item.id}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={() =>
                  handleHistoryItemClick(item.query, item.searchType)
                }
                onKeyDown={event => {
                  if (
                    clickable &&
                    (event.key === 'Enter' || event.key === ' ')
                  ) {
                    event.preventDefault();
                    handleHistoryItemClick(item.query, item.searchType);
                  }
                }}
                className={`rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm transition-colors ${clickable ? 'cursor-pointer hover:bg-accent/30' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate text-sm font-medium text-foreground">
                        {item.query}
                      </span>
                      <Badge variant="outline-subtle">
                        {searchTypeLabels[item.searchType]}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>
                        仓库: {item.repository.name}
                        {item.snapshot ? ` • 快照: ${item.snapshot.title}` : ''}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span>{formatSmartTime(item.createdAt)}</span>
                        <Badge
                          variant={
                            item.resultsCount > 0 ? 'success' : 'outline-subtle'
                          }
                        >
                          {item.resultsCount} 个结果
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={e => handleDeleteHistory(item.id, e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {historyPagination.total > historyPagination.limit ? (
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={historyPagination.page <= 1}
              onClick={event => {
                event.stopPropagation();
                loadSearchHistory(repositoryId, historyPagination.page - 1);
              }}
            >
              上一页
            </Button>

            <span className="text-sm text-muted-foreground">
              第 {historyPagination.page} / {totalPages} 页
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={historyPagination.page >= totalPages}
              onClick={event => {
                event.stopPropagation();
                loadSearchHistory(repositoryId, historyPagination.page + 1);
              }}
            >
              下一页
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
