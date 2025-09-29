import { SetMetadata } from '@nestjs/common';

export type RepoAccessMode = 'read' | 'comment' | 'admin';

export const REPO_ACCESS_KEY = 'repo_access_mode';

export const RepoAccess = (mode: RepoAccessMode = 'read') =>
  SetMetadata(REPO_ACCESS_KEY, mode);
