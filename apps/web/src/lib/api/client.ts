import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API基础配置
const API_BASE_URL =
  (process.env['NEXT_PUBLIC_API_URL'] as string | undefined) ||
  'http://localhost:3001/api';

// 创建axios实例
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  config => {
    // 在浏览器环境中获取token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理通用错误
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  error => {
    // 处理401未授权错误
    if (error.response?.status === 401) {
      // 清除本地token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // 可以在这里触发登录页面跳转
        // window.location.href = '/login';
      }
    }

    // 处理网络错误
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject(new Error('网络连接失败，请检查网络设置'));
    }

    // 处理服务器错误
    if (error.response.status >= 500) {
      console.error('Server Error:', error.response.data);
      return Promise.reject(new Error('服务器错误，请稍后重试'));
    }

    return Promise.reject(error);
  }
);

// 通用API方法
export const api = {
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => apiClient.get(url, config),

  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => apiClient.post(url, data, config),

  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => apiClient.put(url, data, config),

  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => apiClient.patch(url, data, config),

  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => apiClient.delete(url, config),
};

export default apiClient;
