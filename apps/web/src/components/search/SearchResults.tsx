import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, Copy, ExternalLink, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useSearchStore } from '../../stores/searchStore';
import { SearchMatch, SearchStatus } from '../../types/search';

interface SearchResultsProps {
  onFileOpen?: (filePath: string, lineNumber?: number) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ onFileOpen }) => {
  const { currentSearch, isSearching } = useSearchStore();
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  if (!currentSearch && !isSearching) {
    return null;
  }

  if (
    isSearching ||
    currentSearch?.status === SearchStatus.QUEUED ||
    currentSearch?.status === SearchStatus.PROCESSING
  ) {
    return (
      <Card className="border-border/60 bg-card/90 shadow-sm">
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            搜索进行中...
          </div>
          <Progress value={65} className="h-2" />
          <p className="text-sm text-muted-foreground">
            正在搜索代码，请稍候...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (currentSearch?.status === SearchStatus.FAILED) {
    return (
      <Card className="border-border/60 bg-card/90 shadow-sm">
        <CardContent className="p-6">
          <Alert variant="destructive">
            搜索失败: {currentSearch.errorMessage || '未知错误'}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!currentSearch || currentSearch.results.length === 0) {
    return (
      <Card className="border-border/60 bg-card/90 shadow-sm">
        <CardContent className="p-6">
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-6 py-10 text-center">
            <h3 className="text-lg font-semibold text-foreground">
              暂无搜索结果
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              可以尝试调整关键词或搜索类型再试试
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 按文件分组搜索结果
  const groupedResults = currentSearch.results.reduce(
    (acc, match) => {
      const arr = acc[match.filePath] ?? (acc[match.filePath] = []);
      arr.push(match);
      return acc;
    },
    {} as Record<string, SearchMatch[]>
  );

  const handleFileToggle = (filePath: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(filePath)) {
      newExpanded.delete(filePath);
    } else {
      newExpanded.add(filePath);
    }
    setExpandedFiles(newExpanded);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const highlightMatch = (
    content: string,
    matchStart: number,
    matchEnd: number
  ) => {
    const before = content.substring(0, matchStart);
    const match = content.substring(matchStart, matchEnd);
    const after = content.substring(matchEnd);

    return (
      <>
        {before}
        <span className="bg-yellow-300 font-bold text-foreground">{match}</span>
        {after}
      </>
    );
  };

  return (
    <Card className="border-border/60 bg-card/90 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">搜索结果</h3>
          <Badge variant="soft">{currentSearch.totalMatches} 个匹配项</Badge>
        </div>

        <div className="space-y-3">
          {Object.entries(groupedResults).map(([filePath, matches]) => {
            const expanded = expandedFiles.has(filePath);

            return (
              <div
                key={filePath}
                className="rounded-2xl border border-border/60 bg-background/80 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => handleFileToggle(filePath)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">
                      {filePath}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {matches.length} 个匹配项
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={e => {
                        e.stopPropagation();
                        handleCopyToClipboard(filePath);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {onFileOpen ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={e => {
                          e.stopPropagation();
                          onFileOpen(filePath);
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    ) : null}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {expanded ? (
                  <div className="space-y-3 border-t border-border/60 px-4 py-4">
                    {matches.map((match, index) => (
                      <div
                        key={`${match.filePath}-${match.lineNumber}-${index}`}
                        className="rounded-xl border border-border/60 bg-secondary/20 p-3"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="outline-subtle">
                            第 {match.lineNumber} 行
                          </Badge>
                          {onFileOpen ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                onFileOpen(filePath, match.lineNumber)
                              }
                            >
                              跳转
                            </Button>
                          ) : null}
                        </div>
                        <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-foreground">
                          {highlightMatch(
                            match.lineContent,
                            match.matchStart,
                            match.matchEnd
                          )}
                        </pre>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
