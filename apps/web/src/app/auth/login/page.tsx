'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/services/authService';
import { useAuthActions } from '@/stores/auth-store';
import { GitBranch, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, setLoading } = useAuthActions();
  const searchParams = useSearchParams();
  const forceShow = searchParams?.get('intent') === 'login';

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // no-op

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast({
        title: '请填写完整信息',
        description: '用户名和密码都是必填项',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      const response = await AuthService.login(formData);

      // 更新认证状态
      login(response.user, response.accessToken, response.refreshToken);

      toast({
        title: '登录成功',
        description: `欢迎回来，${response.user.username}！`,
      });

      // 重定向：优先使用 redirect 参数，否则进入“主页面”
      const redirectTo = searchParams?.get('redirect');
      if (redirectTo && redirectTo.startsWith('/')) {
        router.push(redirectTo);
      } else {
        router.push('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      const errorMessage =
        error.response?.data?.message || '登录失败，请检查邮箱和密码';
      toast({
        title: '登录失败',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 始终展示登录页

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="w-full max-w-md space-y-8 p-8 card rounded-2xl hover-lift">
        {/* Logo */}
        <div className="text-center">
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 mb-6"
          >
            <GitBranch className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Relax-Git</span>
          </Link>
          <h2 className="text-3xl font-bold">欢迎回来</h2>
          <p className="text-muted-foreground mt-2">登录您的账户以继续使用</p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="请输入用户名"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="请输入密码"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                登录中...
              </>
            ) : (
              '登录'
            )}
          </Button>
        </form>

        {/* 注册链接 */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            还没有账户？{' '}
            <Link
              href="/auth/register"
              className="text-primary smooth-underline"
            >
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
