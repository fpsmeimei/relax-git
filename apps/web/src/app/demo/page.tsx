'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GitBranch, Pause, Play, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function DemoPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [_currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: '代码浏览',
      description: '3秒内基于Git worktree创建代码浏览环境',
      time: '00:03',
      status: 'completed' as const,
    },
    {
      title: '实时协作',
      description: '200ms延迟的实时事件推送',
      time: '00:05',
      status: 'completed' as const,
    },
    {
      title: '智能评论',
      description: '精准锚点评论系统',
      time: '00:08',
      status: 'current' as const,
    },
    {
      title: '热力图分析',
      description: '代码变更热度可视化',
      time: '00:12',
      status: 'pending' as const,
    },
  ];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* 导航栏 */}
      <nav className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container-responsive flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span>返回首页</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <GitBranch className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Relax-Git 介绍</span>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="container-responsive py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* 标题区域 */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">产品功能预览</h1>
            <p className="text-xl text-muted-foreground">
              了解基于 Git worktree 的现代化协作平台核心功能
            </p>
          </div>

          {/* 演示控制器 */}
          <div className="card p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold">交互式预览</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  重置
                </Button>
                <Button size="sm" onClick={handlePlayPause}>
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      暂停
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      播放
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 演示步骤 */}
            <div className="space-y-4">
              {demoSteps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors ${
                    step.status === 'current'
                      ? 'bg-primary/10 border-primary'
                      : step.status === 'completed'
                        ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                        : 'bg-muted/50 border-muted'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <Badge
                      variant={
                        step.status === 'current'
                          ? 'default'
                          : step.status === 'completed'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {step.time}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {step.status === 'completed' && (
                      <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-success-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                    {step.status === 'current' && (
                      <div className="w-6 h-6 bg-primary rounded-full animate-pulse" />
                    )}
                    {step.status === 'pending' && (
                      <div className="w-6 h-6 bg-muted rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 功能特性展示 */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4">性能指标</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>快照创建时间</span>
                  <Badge variant="secondary">≤ 3秒</Badge>
                </div>
                <div className="flex justify-between">
                  <span>实时事件延迟</span>
                  <Badge variant="secondary">200-500ms</Badge>
                </div>
                <div className="flex justify-between">
                  <span>API可用性</span>
                  <Badge variant="secondary">99.9%</Badge>
                </div>
                <div className="flex justify-between">
                  <span>功能通过率</span>
                  <Badge variant="secondary">95%+</Badge>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-semibold mb-4">技术优势</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span>Git worktree 零拷贝技术</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-info rounded-full" />
                  <span>WebSocket 实时通信</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Redis 队列处理</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-warning rounded-full" />
                  <span>PostgreSQL 数据持久化</span>
                </div>
              </div>
            </div>
          </div>

          {/* 行动号召 */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">准备开始使用？</h2>
            <p className="text-muted-foreground">
              立即注册账户，体验现代化协作平台的强大功能
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg">立即注册</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg">
                  已有账户？登录
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
