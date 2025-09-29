export interface CreateSnapshotRequest {
  repoId: string;
  commitSha: string;
  ttlDays?: number;
}
export interface CreateSnapshotResponse {
  id: string;
  status: 'queued' | 'processing';
  estimatedTime: number;
}
export interface CreateCommentRequest {
  snapshotId: string;
  commitSha: string;
  filePath?: string;
  lineStart?: number;
  lineEnd?: number;
  content: string;
}
export interface CreateCommentResponse {
  id: string;
  createdAt: string;
}
export interface AuthLoginRequest {
  email: string;
  password: string;
}
export interface AuthLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}
export interface AuthRegisterRequest {
  email: string;
  username: string;
  password: string;
}
export interface CreateRepositoryRequest {
  name: string;
  gitUrl: string;
  defaultBranch?: string;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'INTERNAL';
  description?: string;
}
export interface UpdateRepositoryRequest {
  name?: string;
  defaultBranch?: string;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'INTERNAL';
  description?: string;
}
export interface RepositoryResponse {
  id: string;
  name: string;
  gitUrl: string;
  ownerId: string;
  defaultBranch: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INTERNAL';
  description?: string;
  isActive: boolean;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    username: string;
    email: string;
  };
}
export interface RepositoryListResponse {
  repositories: RepositoryResponse[];
  total: number;
  page: number;
  limit: number;
}
export interface GitValidationResponse {
  isValid: boolean;
  error?: string;
  branches?: string[];
  defaultBranch?: string;
}
//# sourceMappingURL=api.d.ts.map
