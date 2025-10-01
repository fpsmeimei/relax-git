import { apiClient } from './apiClient';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    uid: string;
    displayName?: string;
    avatar?: string;
    role: 'ADMIN' | 'USER';
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * 认证服务
 */
export class AuthService {
  /**
   * 用户登录
   */
  static async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', request);
    return response.data;
  }

  /**
   * 用户注册
   */
  static async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', request);
    return response.data;
  }


  /**
   * 用户登出
   */
  static async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(): Promise<AuthResponse['user']> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  }
}
