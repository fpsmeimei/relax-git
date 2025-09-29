// 超简单的认证服务
export class SimpleAuth {
  static async register(username: string, password: string) {
    console.log('=== SIMPLE AUTH REGISTER ===', { username });

    const response = await fetch('http://localhost:3001/simple-auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log('=== REGISTER RESPONSE ===', data);

    if (data.success) {
      // 保存到本地存储
      localStorage.setItem('simple-user', JSON.stringify(data.user));
      localStorage.setItem('simple-token', data.token);
    }

    return data;
  }

  static async login(username: string, password: string) {
    console.log('=== SIMPLE AUTH LOGIN ===', { username });

    const response = await fetch('http://localhost:3001/simple-auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log('=== LOGIN RESPONSE ===', data);

    if (data.success) {
      // 保存到本地存储
      localStorage.setItem('simple-user', JSON.stringify(data.user));
      localStorage.setItem('simple-token', data.token);
    }

    return data;
  }

  static logout() {
    localStorage.removeItem('simple-user');
    localStorage.removeItem('simple-token');
  }

  static getCurrentUser() {
    const userStr = localStorage.getItem('simple-user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static getToken() {
    return localStorage.getItem('simple-token');
  }
}
