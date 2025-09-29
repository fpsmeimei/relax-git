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
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <nav className="bg-background/95 backdrop-blur-sm">
        <div className="container-responsive flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <GitBranch className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">导入仓库</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container-responsive pt-16 pb-16">
        <div className="max-w-2xl mx-auto">
          <ImportRepositoryForm onSuccess={handleSuccess} />
        </div>
      </main>
    </div>
  );
}
