export enum SearchType {
  CONTENT = 'CONTENT',
  FILENAME = 'FILENAME',
  REGEX = 'REGEX',
}

export enum SearchStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface SearchMatch {
  filePath: string;
  lineNumber: number;
  lineContent: string;
  matchStart: number;
  matchEnd: number;
}

export interface CreateSearchRequest {
  repositoryId: string;
  snapshotId?: string;
  query: string;
  searchType?: SearchType;
  maxResults?: number;
}

export interface SearchResponse {
  id: string;
  status: SearchStatus;
  estimatedTime: number;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  status: SearchStatus;
  results: SearchMatch[];
  totalMatches: number;
  processedAt: string;
  errorMessage?: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  searchType: SearchType;
  resultsCount: number;
  repository: {
    id: string;
    name: string;
  };
  snapshot?: {
    id: string;
    title: string;
  };
  createdAt: string;
}

export interface SearchHistoryResponse {
  history: SearchHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

export interface SearchHistoryQuery {
  repositoryId?: string;
  page?: number;
  limit?: number;
}
