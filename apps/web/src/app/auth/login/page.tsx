'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GitBranch, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
const HOME_ROUTE = process.env['NEXT_PUBLIC_HOME_ROUTE'] || '/';

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
  const searchParams = useSearchParams();
  const rawCallback = searchParams?.get('callbackUrl') ?? null;
  const isSafeCallback =
    !!rawCallback &&
    rawCallback.startsWith('/') &&
    !rawCallback.startsWith('/auth') &&
    !rawCallback.startsWith('/.well-known') &&
    !rawCallback.startsWith('/icon');
  const callbackUrl = isSafeCallback ? rawCallback : HOME_ROUTE;

  // 从URL参数获取用户名（注册成功后跳转时携带）
  const usernameFromUrl = searchParams?.get('username') ?? '';

  const [formData, setFormData] = useState({
    username: usernameFromUrl,
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

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

    try {
      console.log('[Login] Attempting login with username:', formData.username);

      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      console.log('[Login] SignIn result:', result);

      if (result?.error) {
        console.error('[Login] SignIn error:', result.error);

        toast({
          title: '登录失败',
          description: result.error || '用户名或密码错误',
          variant: 'destructive',
        });
        return;
      }

      // 🔥 关键修复：使用 NextAuth session 中的 token 设置浏览器 Cookie
      // 等待 NextAuth session 创建
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        console.log('[Login] Getting NextAuth session...');
        // 获取 NextAuth session（客户端）
        const { getSession } = await import('next-auth/react');
        const session = await getSession();

        const user = session?.user as any;
        if (user?.accessToken) {
          console.log('[Login] Setting cookies with session token...');
          const cookieResp = await fetch('/api/_auth/set-cookie', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
            credentials: 'include',
          });

          if (!cookieResp.ok) {
            console.warn('[Login] Failed to set JWT cookies');
          } else {
            console.log('[Login] JWT cookies set successfully');
          }
        } else {
          console.warn('[Login] No accessToken in session');
        }
      } catch (e) {
        console.warn('[Login] Cookie setup error:', e);
      }

      toast({
        title: '登录成功',
        description: `欢迎回来，${formData.username}！`,
      });

      // 登录成功，跳转（避免 refresh，且忽略不安全/无效的 callbackUrl）
      router.replace(callbackUrl);
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: '登录失败',
        description: '登录过程中出现错误',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
            href="/about"
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
