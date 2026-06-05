import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { GitValidationService } from '../src/repositories/services/git-validation.service';

const execFileAsync = promisify(execFile);

async function createLocalGitRepository() {
  const repoPath = await mkdtemp(join(tmpdir(), 'relax-git-local-repo-'));

  await execFileAsync('git', ['init', '-b', 'main'], { cwd: repoPath });
  await execFileAsync('git', ['config', 'user.email', 'test@example.local'], {
    cwd: repoPath,
  });
  await execFileAsync('git', ['config', 'user.name', 'Relax Git Test'], {
    cwd: repoPath,
  });
  await writeFile(join(repoPath, 'README.md'), '# Local Repo\n');
  await execFileAsync('git', ['add', 'README.md'], { cwd: repoPath });
  await execFileAsync('git', ['commit', '-m', 'initial commit'], {
    cwd: repoPath,
  });

  return repoPath;
}

describe('GitValidationService local repositories', () => {
  let repoPath: string;
  let service: GitValidationService;

  beforeEach(async () => {
    repoPath = await createLocalGitRepository();
    service = new GitValidationService();
  });

  afterEach(async () => {
    await rm(repoPath, { recursive: true, force: true });
  });

  it('accepts an absolute local Git repository path for local demos', async () => {
    const result = await service.validateGitUrl(repoPath);

    expect(result).toEqual(
      expect.objectContaining({
        isValid: true,
        defaultBranch: 'main',
        branches: ['main'],
      })
    );
  });

  it('reads the HEAD SHA from an absolute local Git repository path', async () => {
    const sha = await service.getCommitSha(repoPath, 'main');

    expect(sha).toMatch(/^[0-9a-f]{40}$/);
  });
});
