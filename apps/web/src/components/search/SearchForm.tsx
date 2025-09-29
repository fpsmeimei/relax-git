import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useSearchStore } from '../../stores/searchStore';
import { CreateSearchRequest, SearchType } from '../../types/search';

const glassCardSx = {
  position: 'relative' as const,
  overflow: 'hidden',
  padding: { xs: '2.25rem', md: '2.75rem' },
};

const fieldSx = {
  '& .MuiInputBase-root': {
    transition:
      'border-color 0.2s ease, background 0.2s ease, box-shadow 0.28s ease',
  },
};

const selectMenuProps = {
  PaperProps: {
    className: 'glass-menu',
  },
};

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
    <Card className="glass-panel glass-panel-hero" sx={glassCardSx}>
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 0 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, letterSpacing: '-0.01em', mb: 2 }}
          className="text-foreground"
        >
          代码搜索
        </Typography>

        <Box mb={2.5} display="flex" flexWrap="wrap" gap={1}>
          <Chip
            label={`仓库: ${repositoryName}`}
            size="small"
            className="glass-chip"
          />
          {snapshotId && snapshotTitle && (
            <Chip
              label={`版本: ${snapshotTitle}`}
              size="small"
              className="glass-chip"
            />
          )}
        </Box>

        {searchError && (
          <Alert severity="error" className="glass-alert glass-alert-error mb-2.5">
            {searchError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="搜索关键词"
                placeholder="输入要搜索的内容..."
                value={localQuery}
                onChange={e => setLocalQuery(e.target.value)}
                disabled={isSearching}
                sx={fieldSx}
                className="glass-field"
                InputProps={{
                  endAdornment: localQuery && (
                    <Button
                      size="small"
                      onClick={handleClear}
                      sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                      <ClearIcon fontSize="small" />
                    </Button>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={fieldSx} className="glass-field">
                <InputLabel>搜索类型</InputLabel>
                <Select
                  value={searchForm.searchType}
                  label="搜索类型"
                  onChange={e =>
                    setSearchForm({ searchType: e.target.value as SearchType })
                  }
                  disabled={isSearching}
                  MenuProps={selectMenuProps}
                >
                  {(Object.entries(searchTypeLabels) as [SearchType, string][]).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      <Box>
                        <Typography variant="body2" className="text-foreground">
                          {label}
                        </Typography>
                        <Typography variant="caption" className="text-muted-foreground">
                          {searchTypeDescriptions[value]}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="最大结果数"
                value={searchForm.maxResults}
                onChange={e =>
                  setSearchForm({ maxResults: parseInt(e.target.value) || 100 })
                }
                disabled={isSearching}
                inputProps={{ min: 1, max: 1000 }}
                sx={fieldSx}
                className="glass-field"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!localQuery.trim() || isSearching}
                startIcon={
                  isSearching ? <CircularProgress size={20} /> : <SearchIcon />
                }
                className="halo-accent halo-accent-pulse"
              >
                {isSearching ? '搜索中...' : '开始搜索'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};
