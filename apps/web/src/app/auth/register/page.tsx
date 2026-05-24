'use client';

import { useToast } from '@/hooks/use-toast';
import { GitBranch, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageInner />
    </Suspense>
  );
}

function RegisterPageInner() {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // no-op

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    if (!formData.username || !formData.password) {
      toast({
        title: '请填写完整信息',
        description: '用户名和密码都是必填项',
        variant: 'destructive',
      });
      return;
    }

    if (formData.username.length < 3) {
      toast({
        title: '用户名太短',
        description: '用户名长度至少需要3个字符',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: '密码不匹配',
        description: '请确认两次输入的密码一致',
        variant: 'destructive',
      });
      return;
    }

    // 密码长度验证
    if (formData.password.length < 6) {
      toast({
        title: '密码太短',
        description: '密码长度至少需要6个字符',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 调用后端注册接口
      // 🔥 使用 /api/_auth/* 代理路由（见 next.config.js 第148行）
      // /api/_auth/register → http://localhost:3001/auth/register
      const API_URL = process.env['NEXT_PUBLIC_API_URL'] || '/api';
      const response = await fetch(`${API_URL}/_auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '注册失败');
      }

      toast({
        title: '注册成功',
        description: `欢迎加入，${formData.username}！请使用相同的用户名和密码登录。`,
      });

      // 注册成功后跳转到登录页，并带上用户名
      router.push(
        `/auth/login?username=${encodeURIComponent(formData.username)}`
      );
    } catch (error: any) {
      toast({
        title: '注册失败',
        description: error.message || '注册过程中出现错误',
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

  // 始终展示注册页

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="w-full max-w-md space-y-8 p-8">
        {/* Logo */}
        <div className="text-center">
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 mb-6"
          >
            <GitBranch className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Relax-Git</span>
          </Link>
          <h2 className="text-3xl font-bold">创建账户</h2>
          <p className="text-muted-foreground mt-2">加入现代化协作平台</p>
        </div>

        {/* 注册表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="请输入用户名（至少3个字符）"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="请输入密码（至少6个字符）"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                确认密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="请再次输入密码"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                注册中...
              </>
            ) : (
              '注册'
            )}
          </button>
        </form>

        {/* 登录链接 */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            已有账户？{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
