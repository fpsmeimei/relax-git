import {
  ExpandMore as ExpandMoreIcon,
  FileCopy as FileCopyIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
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
      <Card className="hover-lift">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            搜索进行中...
          </Typography>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            正在搜索代码，请稍候...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (currentSearch?.status === SearchStatus.FAILED) {
    return (
      <Card className="hover-lift">
        <CardContent>
          <Alert severity="error">
            搜索失败: {currentSearch.errorMessage || '未知错误'}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!currentSearch || currentSearch.results.length === 0) {
    return (
      <Card className="hover-lift">
        <CardContent>
          <div className="empty-state">
            <h3 className="empty-state-title">暂无搜索结果</h3>
            <p className="empty-state-desc">
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
        <Box
          component="span"
          sx={{ backgroundColor: 'yellow', fontWeight: 'bold' }}
        >
          {match}
        </Box>
        {after}
      </>
    );
  };

  return (
    <Card className="hover-lift">
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">搜索结果</Typography>
          <Chip
            label={`${currentSearch.totalMatches} 个匹配项`}
            color="primary"
            size="small"
          />
        </Box>

        <List disablePadding>
          {Object.entries(groupedResults).map(([filePath, matches]) => (
            <ListItem key={filePath} disablePadding sx={{ mb: 1 }}>
              <Accordion
                expanded={expandedFiles.has(filePath)}
                onChange={() => handleFileToggle(filePath)}
                sx={{ width: '100%' }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    width="100%"
                  >
                    <Box>
                      <Typography variant="subtitle2" component="div">
                        {filePath}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {matches.length} 个匹配项
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Tooltip title="复制文件路径">
                        <IconButton
                          size="small"
                          onClick={e => {
                            e.stopPropagation();
                            handleCopyToClipboard(filePath);
                          }}
                        >
                          <FileCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {onFileOpen && (
                        <Tooltip title="打开文件">
                          <IconButton
                            size="small"
                            onClick={e => {
                              e.stopPropagation();
                              onFileOpen(filePath);
                            }}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {matches.map((match, index) => (
                      <ListItem key={index} disablePadding>
                        <Paper
                          className="hover-lift"
                          variant="outlined"
                          sx={{
                            width: '100%',
                            p: 1,
                            mb: 1,
                            backgroundColor: 'grey.50',
                          }}
                        >
                          <Box display="flex" alignItems="center" mb={0.5}>
                            <Chip
                              label={`第 ${match.lineNumber} 行`}
                              size="small"
                              variant="outlined"
                            />
                            {onFileOpen && (
                              <Tooltip title="跳转到此行">
                                <IconButton
                                  size="small"
                                  sx={{ ml: 1 }}
                                  onClick={() =>
                                    onFileOpen(filePath, match.lineNumber)
                                  }
                                >
                                  <OpenInNewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                          <Typography
                            variant="body2"
                            component="pre"
                            sx={{
                              fontFamily: 'monospace',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-all',
                            }}
                          >
                            {highlightMatch(
                              match.lineContent,
                              match.matchStart,
                              match.matchEnd
                            )}
                          </Typography>
                        </Paper>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};
