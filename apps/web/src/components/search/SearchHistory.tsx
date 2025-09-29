import {
  Delete as DeleteIcon,
  History as HistoryIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Pagination,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
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
      <Card className="hover-lift">
        <CardContent>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            py={4}
          >
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              加载搜索历史...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (historyError) {
    return (
      <Card className="hover-lift">
        <CardContent>
          <Alert severity="error">{historyError}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (searchHistory.length === 0) {
    return (
      <Card className="hover-lift">
        <CardContent>
          <div className="empty-state">
            <HistoryIcon className="empty-state-icon" />
            <h3 className="empty-state-title"> 暂无搜索历史</h3>
            <p className="empty-state-desc">
              {' '}
              开始搜索后，历史记录将显示在这里
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-lift">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          搜索历史
        </Typography>

        <List disablePadding>
          {searchHistory.map(item => (
            <ListItem
              className="hover-lift"
              key={item.id}
              component={Paper}
              variant="outlined"
              sx={{
                mb: 1,
                cursor: onHistoryItemClick ? 'pointer' : 'default',
                '&:hover': onHistoryItemClick
                  ? { backgroundColor: 'action.hover' }
                  : {},
              }}
              onClick={() =>
                handleHistoryItemClick(item.query, item.searchType)
              }
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <SearchIcon fontSize="small" color="action" />
                    <Typography variant="body1" component="span">
                      {item.query}
                    </Typography>
                    <Chip
                      label={searchTypeLabels[item.searchType]}
                      size="small"
                      color={searchTypeColors[item.searchType]}
                      variant="outlined"
                    />
                  </Box>
                }
                secondary={
                  <Box mt={1}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component="div"
                    >
                      仓库: {item.repository.name}
                      {item.snapshot && ` • 快照: ${item.snapshot.title}`}
                    </Typography>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mt={0.5}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </Typography>
                      <Chip
                        label={`${item.resultsCount} 个结果`}
                        size="small"
                        variant="outlined"
                        color={item.resultsCount > 0 ? 'success' : 'default'}
                      />
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Tooltip title="删除历史记录">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={e => handleDeleteHistory(item.id, e)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {historyPagination.total > historyPagination.limit && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={Math.ceil(
                historyPagination.total / historyPagination.limit
              )}
              page={historyPagination.page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
