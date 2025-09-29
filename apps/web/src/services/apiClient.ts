import { toast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/auth-store';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * API 客户端配置
 */
class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env['NEXT_PUBLIC_API_URL'] || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器 - 添加认证token
    this.client.interceptors.request.use(
      config => {
        const { token } = useAuthStore.getState();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
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

        // 401：尝试使用 refreshToken 刷新一次后重试原请求（单航班）
        if (
          (normalized.status === 401 || normalized.code === 'UNAUTHORIZED') &&
          originalConfig &&
          !originalConfig.__isRefresh &&
          !originalConfig.__retried
        ) {
          const { refreshToken, refreshAuth } = useAuthStore.getState();

          if (refreshToken) {
            try {
              const newToken = await this.refreshAccessToken(refreshToken);
              if (newToken) {
                refreshAuth(newToken.accessToken, newToken.refreshToken);
                originalConfig.__retried = true;
                originalConfig.headers = originalConfig.headers || {};
                originalConfig.headers.Authorization = `Bearer ${newToken.accessToken}`;
                return this.client.request(originalConfig);
              }
            } catch (e) {
              // fallthrough to logout below
            }
          }

          // 刷新失败或无 refreshToken：登出并跳登录
          const { logout: doLogout } = useAuthStore.getState();
          doLogout();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
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
          toast({
            title: '请求错误',
            description: normalized.message,
            variant: 'destructive',
          });
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

  private async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string } | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }
    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const resp = await this.client.post<{
          accessToken: string;
          refreshToken: string;
        }>('/auth/refresh', { refreshToken }, {
          headers: { Authorization: undefined },
          __isRefresh: true,
        } as any);
        return resp.data ?? null;
      } catch (e) {
        return null;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();
    return this.refreshPromise;
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
