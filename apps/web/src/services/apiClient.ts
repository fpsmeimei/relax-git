import { toast } from '@/hooks/use-toast';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * API 客户端配置 - 使用 NextAuth Session
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // 请求拦截器（JWT 通过 HttpOnly Cookie 或 NextAuth session 自动携带）
    this.client.interceptors.request.use(
      async config => config,
      error => Promise.reject(error)
    );

    // 响应拦截器 - 统一错误格式 & 处理认证/权限
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const originalConfig = error?.config || {};
        const resp = error?.response;
        const data = resp?.data ?? {};

        // 后端统一错误结构: { success:false, code, message, status, details? }
        const normalized: any = new Error(
          (data?.message as string) || error?.message || '请求失败'
        );
        normalized.name = 'ApiError';
        normalized.code = data?.code || mapStatusToCode(resp?.status);
        normalized.status = data?.status || resp?.status || 0;
        normalized.details = data?.details;
        normalized.path = data?.path;
        normalized.raw = error;

        // 401：清理认证信息并跳转登录
        if (
          (normalized.status === 401 || normalized.code === 'UNAUTHORIZED') &&
          originalConfig &&
          !originalConfig.__retried
        ) {
          console.warn('[ApiClient] Unauthorized, redirecting to login');
          
          // 只在非登录页面时跳转，避免循环重定向
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
            window.location.href = '/auth/login?reason=session_expired';
          }
          return Promise.reject(normalized);
        }

        if (
          normalized.status === 403 ||
          normalized.code === 'FORBIDDEN' ||
          normalized.code === 'MEMBER_ONLY'
        ) {
          toast({
            title: '无权限',
            description: normalized.message || '该操作需要仓库成员或更高权限',
            variant: 'warning',
          });
        } else if (normalized.status === 409) {
          const conflictMessage =
            normalized.message && typeof normalized.message === 'string'
              ? normalized.message
              : '该用户已注册';

          toast({
            title: '该用户已注册',
            description: conflictMessage,
            variant: 'destructive',
          });
        } else if (normalized.code === 'VALIDATION_ERROR') {
          // 聚合校验错误提示
          const desc = Array.isArray(normalized.details)
            ? normalized.details.join('\n')
            : normalized.message;
          toast({
            title: '表单校验失败',
            description: desc,
            variant: 'destructive',
          });
        } else if (
          normalized.status >= 400 &&
          normalized.status < 500 &&
          normalized.message
        ) {
          // 不显示 401 认证错误的 toast（已经在上面处理了）
          if (normalized.status !== 401 && normalized.code !== 'UNAUTHORIZED') {
            toast({
              title: '请求错误',
              description: normalized.message,
              variant: 'destructive',
            });
          }
        } else if (normalized.status >= 500) {
          toast({
            title: '服务器错误',
            description: '请稍后重试',
            variant: 'destructive',
          });
        }

        return Promise.reject(normalized);
      }
    );
  }


  // GET 请求
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  // POST 请求
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  // PUT 请求
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  // PATCH 请求
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  // DELETE 请求
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }
}

// 导出单例实例
export const apiClient = new ApiClient();

function mapStatusToCode(status?: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 429:
      return 'RATE_LIMITED';
    default:
      return 'INTERNAL_ERROR';
  }
}
