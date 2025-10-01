'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React 错误边界
 * 捕获子组件树中的 JavaScript 错误
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误到日志服务（如 Sentry）
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 调用自定义错误处理
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override render() {
    if (this.state.hasError) {
      // 自定义 fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误 UI
      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6 rounded-lg border border-destructive/20 bg-card p-8 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">出错了</h2>
              <p className="text-muted-foreground">
                应用遇到了一个意外错误
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="rounded-md bg-muted p-4 text-left">
                <p className="text-sm font-mono text-destructive">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="mt-2 max-h-40 overflow-auto text-xs text-muted-foreground">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                重试
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                返回首页
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 功能级错误边界（用于局部功能）
 */
export function FeatureErrorBoundary({ 
  children, 
  featureName 
}: { 
  children: ReactNode;
  featureName: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-lg border border-destructive/20 bg-card p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">
            {featureName} 加载失败
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            刷新页面
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * 使用示例：
 * 
 * // 1. 包裹整个应用（layout.tsx）
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * 
 * // 2. 包裹特定功能
 * <FeatureErrorBoundary featureName="代码查看器">
 *   <CodeViewer />
 * </FeatureErrorBoundary>
 * 
 * // 3. 自定义错误处理
 * <ErrorBoundary 
 *   onError={(error) => {
 *     // 发送到 Sentry
 *     Sentry.captureException(error);
 *   }}
 * >
 *   <App />
 * </ErrorBoundary>
 */
