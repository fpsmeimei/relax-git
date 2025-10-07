'use client';

import { ImportRepositoryForm } from '@/components/repository/import-repository-form';
import { useAuth } from '@/stores/auth-store';
import { ArrowLeft, GitBranch } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ImportRepositoryPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuth();

  // 检查认证状态
  useEffect(() => {
    // 等待认证状态初始化完成后再检查
    if (isInitialized && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
  }, [isAuthenticated, isInitialized, router]);

  // 认证状态未初始化时显示加载状态
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在加载...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleSuccess = (result: { repositoryId: string }) => {
    router.push(`/repositories/${result.repositoryId}`);
  };

  return (
    <div className="bg-background">
      {/* 页面头部区域 */}
      <div className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container-responsive py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              href="/repositories"
              className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="text-base font-medium">返回仓库列表</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <GitBranch className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold mb-1">导入仓库</h1>
                <p className="text-sm text-muted-foreground">
                  从 Git 仓库导入项目，支持 GitHub、GitLab 等平台
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <main className="container-responsive py-12 pb-16">
        <div className="max-w-4xl mx-auto">
          <ImportRepositoryForm onSuccess={handleSuccess} />
        </div>
      </main>
    </div>
  );
}
