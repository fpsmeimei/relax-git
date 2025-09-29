'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/apiClient';
import { useAuth } from '@/stores/auth-store';
import { AlertCircle, GitBranch, Loader2, Lock, Globe, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ImportRepositoryFormData {
  name: string;
  gitUrl: string;
  baseBranch: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INTERNAL';
  description: string;
}

interface ImportRepositoryResponse {
  repositoryId: string;
  baseSnapshotId?: string;
  branches: {
    defaultBranch: string;
    baseBranch: string;
  };
}

interface ImportRepositoryFormProps {
  onSuccess?: (result: ImportRepositoryResponse) => void;
  className?: string;
}

export function ImportRepositoryForm({
  onSuccess,
  className = '',
}: ImportRepositoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<ImportRepositoryFormData>({
    name: '',
    gitUrl: '',
    baseBranch: '',
    visibility: 'PRIVATE',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 提取仓库名称（支持 GitHub、镜像、SSH、本地路径）。尽力而为，不强制。
  const extractRepoName = (url: string): string => {
    const raw = url.trim();
    if (!raw) return '';

    // 1) SSH: git@host:owner/repo(.git)
    const ssh = raw.match(/^git@[^:]+:([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (ssh) return ssh[2] ?? '';

    // 2) Windows 本地路径: C:\path\to\repo 或 C:/path/to/repo
    if (/^[a-zA-Z]:[\\/]/.test(raw)) {
      const parts = raw.replace(/[\\/]+$/, '').split(/[\\/]/);
      return parts[parts.length - 1] || '';
    }

    // 3) file:// 协议
    if (raw.startsWith('file://')) {
      try {
        const u = new URL(raw);
        const segs = u.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
        return segs[segs.length - 1] || '';
      } catch {
        /* ignore */
      }
    }

    // 4) http/https，包括镜像。优先尝试从 github.com 片段中提取
    try {
      const u = new URL(raw);
      const path = u.pathname;
      const nested = path.match(/github\.com\/[^/]+\/([^/]+?)(?:\.git)?(\b|$)/);
      if (nested) return nested[1] ?? '';
      const segs = path
        .replace(/\.git$/, '')
        .split('/')
        .filter(Boolean);
      return segs[segs.length - 1] || '';
    } catch {
      return '';
    }
  };

  // 验证 Git URL（放宽：支持镜像/SSH/本地路径）
  const validateGitUrl = async (url: string) => {
    const raw = url.trim();
    if (!raw) return;

    setValidating(true);
    try {
      let ok = false;

      // 1) SSH 形式
      if (/^git@[^:]+:.+\.git$/.test(raw)) {
        ok = true;
      }

      // 2) 本地路径或 file://
      if (
        !ok &&
        (/^[a-zA-Z]:[\\/]/.test(raw) ||
          raw.startsWith('file://') ||
          raw.startsWith('/'))
      ) {
        ok = true;
      }

      // 3) http/https，包括镜像地址
      if (!ok) {
        try {
          const u = new URL(raw);
          const host = u.hostname;
          const path = u.pathname;
          const segments = path
            .replace(/\.git$/, '')
            .split('/')
            .filter(Boolean);
          const endsWithGit = path.endsWith('.git');
          const isGithub = host === 'github.com' && segments.length >= 2; // 允许无 .git
          const looksLikeMirror = endsWithGit; // 泛化处理：凡是以 .git 结尾的 https 链接都视为有效
          ok = isGithub || looksLikeMirror;
        } catch {
          // 非 URL 的情形已在前两种分支处理
        }
      }

      if (ok) {
        const repoName = extractRepoName(raw);
        if (repoName && !formData['name']) {
          setFormData(prev => ({ ...prev, ['name']: repoName }));
        }
        setErrors(prev => ({ ...prev, ['gitUrl']: '' }));
        // 进一步调用后端验证，尝试探测远程默认分支用于预填
        try {
          const { data } = await apiClient.post(
            '/repositories/validate-url',
            { gitUrl: raw },
            { timeout: 20000 }
          );
          const def = (data as any)?.defaultBranch as string | undefined;
          if (def && def.trim()) {
            setFormData(prev =>
              prev.baseBranch.trim() ? prev : { ...prev, baseBranch: def }
            );
          }
        } catch {
          // 静默失败，不影响本地校验结果
        }
      } else {
        setErrors(prev => ({
          ...prev,
          ['gitUrl']: '请输入有效的 Git 仓库地址（支持镜像/SSH/本地路径）',
        }));
      }
    } catch {
      setErrors(prev => ({
        ...prev,
        ['gitUrl']: '无法验证仓库地址，请检查输入格式',
      }));
    } finally {
      setValidating(false);
    }
  };
  // 轮询快照直至 READY/FAILED，带超时
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const pollSnapshotReady = async (snapshotId: string, timeoutMs = 90000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const { data } = await apiClient.get<{ id: string; status: string }>(
          `/snapshots/${snapshotId}/status`
        );
        const st = (data as any)?.status;
        if (st === 'READY') return true;
        if (st === 'FAILED' || st === 'EXPIRED') return false;
      } catch {
        // ignore and retry
      }
      await sleep(2000);
    }
    return false; // 超时视为失败
  };

  const pollSnapshots = async (ids: string[]) => {
    if (ids.length === 0) return true;
    const results = await Promise.all(ids.map(id => pollSnapshotReady(id)));
    return results.every(Boolean);
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: '请先登录',
        description: '您需要登录后才能导入仓库',
        variant: 'destructive',
      });
      return;
    }

    // 表单验证
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors['name'] = '仓库名称不能为空';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.name)) {
      newErrors['name'] = '仓库名称只能包含字母、数字、下划线和连字符';
    }

    if (!formData.gitUrl.trim()) {
      newErrors['gitUrl'] = 'Git 仓库 URL 不能为空';
    }

    // baseBranch 可留空：留空=使用仓库默认分支的 HEAD
    // 不再强制校验 baseBranch

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // 调用后端 API：导入仓库
      const payload: any = {
        gitUrl: formData.gitUrl.trim(),
        visibility: formData.visibility,
        description: formData.description.trim() || undefined,
        // 仅当用户填写了主干分支时才发送，否则后端使用默认分支
        ...(formData.baseBranch.trim()
          ? { baseBranch: formData.baseBranch.trim() }
          : {}),
      };
      if (formData.name.trim()) payload.name = formData.name.trim();

      const { data: result } = await apiClient.post<ImportRepositoryResponse>(
        `/repositories/import`,
        payload,
        { timeout: 120000 }
      );

      toast({
        title: '导入成功',
        description: `仓库 "${formData.name}" 已成功导入`,
      });

      // 重置表单
      setFormData({
        name: '',
        gitUrl: '',
        baseBranch: '',
        visibility: 'PRIVATE',
        description: '',
      });

      const snapshotIds = [result.baseSnapshotId].filter(Boolean) as string[];

      // 回调或导航（带快照状态轮询与失败提示）
      if (onSuccess) {
        onSuccess(result);
      } else if (snapshotIds.length > 0) {
        let cancelled = false;
        const t = toast({
          title: '正在准备快照…',
          description: (
            <div className="flex items-center gap-2">
              <span>我们正在为你准备快照，这可能需要几十秒。</span>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                onClick={() => {
                  cancelled = true;
                  t.dismiss();
                  router.push(`/repositories/${result.repositoryId}`);
                }}
              >
                后台进行，进入仓库
              </button>
            </div>
          ),
        } as any);

        const ok = await pollSnapshots(snapshotIds);
        if (!cancelled) {
          t.dismiss();
          if (ok) {
            toast({ title: '快照已准备就绪', description: '已为你跳转至仓库' });
          } else {
            toast({
              title: '部分快照生成失败',
              description: '你可以在仓库页面稍后重试或查看详情',
              variant: 'destructive',
            });
          }
          router.push(`/repositories/${result.repositoryId}`);
        }
      } else {
        // 无快照ID则直接跳转
        router.push(`/repositories/${result.repositoryId}`);
      }
    } catch (error) {
      console.error('Failed to import repository:', error);
      toast({
        title: '导入失败',
        description:
          (error as any)?.response?.data?.message ??
          (error as Error)?.message ??
          '无法导入仓库，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="glass-panel glass-panel-hero p-8 border-0">
        {/* 表单内容 - 取消内层标题，避免与页面标题重复 */}
        <form
          onSubmit={handleSubmit}
          className="glass-panel-body space-y-6"
        >
          {/* Git URL 输入 */}
          <div className="space-y-2">
            <Label
              htmlFor="gitUrl"
              className="text-sm font-medium text-foreground/80"
            >
              仓库 URL <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="gitUrl"
                type="text"
                value={formData.gitUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const url = e.target.value;
                  setFormData(prev => ({ ...prev, ['gitUrl']: url }));
                  if (errors['gitUrl']) {
                    setErrors(prev => ({ ...prev, ['gitUrl']: '' }));
                  }
                  setTimeout(() => validateGitUrl(url), 500);
                }}
                placeholder="https://github.com/owner/repo.git 或 SSH/本地/镜像地址"
                disabled={loading}
                className={`glass-input placeholder:text-muted-foreground/60 ${errors['gitUrl'] ? 'border-red-500/70 shadow-[0_0_25px_rgba(248,113,113,0.18)]' : ''}`}
              />
              {validating && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            {errors['gitUrl'] && (
              <div className="flex items-center gap-1 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>{errors['gitUrl']}</span>
              </div>
            )}
          </div>

          {/* 基本信息：名称与主干分支（两列排版） */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-foreground/80"
              >
                仓库名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData(prev => ({ ...prev, ['name']: e.target.value }));
                  if (errors['name']) {
                    setErrors(prev => ({ ...prev, ['name']: '' }));
                  }
                }}
                placeholder="my-awesome-project"
                disabled={loading}
                className={`glass-input placeholder:text-muted-foreground/60 ${errors['name'] ? 'border-red-500/70 shadow-[0_0_25px_rgba(248,113,113,0.18)]' : ''}`}
              />
              {errors['name'] && (
                <div className="flex items-center gap-1 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors['name']}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="baseBranch"
                className="text-sm font-medium text-foreground/80"
              >
                基线分支名
              </Label>
              <Input
                id="baseBranch"
                type="text"
                value={formData.baseBranch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData(prev => ({
                    ...prev,
                    ['baseBranch']: e.target.value,
                  }));
                  if (errors['baseBranch']) {
                    setErrors(prev => ({ ...prev, ['baseBranch']: '' }));
                  }
                }}
                placeholder="留空使用默认分支"
                disabled={loading}
                className={`glass-input placeholder:text-muted-foreground/60 ${errors['baseBranch'] ? 'border-red-500/70' : ''}`}
              />
              {errors['baseBranch'] && (
                <div className="flex items-center gap-1 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors['baseBranch']}</span>
                </div>
              )}
            </div>
          </div>

          {/* 仓库可见性 */}
          <div className="space-y-2">
            <Label
              htmlFor="visibility"
              className="text-sm font-medium text-foreground/80"
            >
              仓库可见性
            </Label>
            {/* 保留隐藏字段以维持表单语义与 label 关联 */}
            <input type="hidden" id="visibility" value={formData.visibility} readOnly />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 私有 */}
              <button
                type="button"
                onClick={() =>
                  setFormData(prev => ({ ...prev, visibility: 'PRIVATE' }))
                }
                aria-pressed={formData.visibility === 'PRIVATE'}
                className={
                  `rounded-xl border px-4 py-3 text-left transition-colors ` +
                  (formData.visibility === 'PRIVATE'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border hover:bg-accent/5')
                }
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-foreground/80" />
                  <div className="text-sm font-medium">私有</div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">仅自己可访问</div>
              </button>

              {/* 公开 */}
              <button
                type="button"
                onClick={() =>
                  setFormData(prev => ({ ...prev, visibility: 'PUBLIC' }))
                }
                aria-pressed={formData.visibility === 'PUBLIC'}
                className={
                  `rounded-xl border px-4 py-3 text-left transition-colors ` +
                  (formData.visibility === 'PUBLIC'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border hover:bg-accent/5')
                }
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-foreground/80" />
                  <div className="text-sm font-medium">公开</div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">所有人可访问</div>
              </button>

              {/* 内部 */}
              <button
                type="button"
                onClick={() =>
                  setFormData(prev => ({ ...prev, visibility: 'INTERNAL' }))
                }
                aria-pressed={formData.visibility === 'INTERNAL'}
                className={
                  `rounded-xl border px-4 py-3 text-left transition-colors ` +
                  (formData.visibility === 'INTERNAL'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border hover:bg-accent/5')
                }
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-foreground/80" />
                  <div className="text-sm font-medium">内部</div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">组织成员可访问</div>
              </button>
            </div>
          </div>

          {/* 仓库描述 */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-foreground/80"
            >
              仓库描述（可选）
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder="简要描述这个仓库的用途..."
              disabled={loading}
              rows={3}
              className="glass-input w-full min-h-[116px] rounded-xl px-4 py-3 text-sm"
            />
          </div>

          <div className="glass-panel-footer sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:pt-4 flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline-subtle"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1 border border-border bg-secondary text-foreground hover:bg-secondary/80"
            >
              取消
            </Button>
            <Button
              variant="soft"
              type="submit"
              disabled={loading || validating}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  导入中...
                </>
              ) : (
                <>
                  <GitBranch className="mr-2 h-4 w-4" />
                  导入
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
