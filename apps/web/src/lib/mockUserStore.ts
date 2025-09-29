// 简单的内存用户存储，用于演示
// 在实际应用中，这应该是数据库

export interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  createdAt: string;
}

class MockUserStore {
  private users: User[] = [];

  // 添加用户
  addUser(user: User): void {
    this.users.push(user);
  }

  // 根据用户名查找用户
  findByUsername(username: string): User | undefined {
    return this.users.find(user => user.username === username);
  }

  // 检查用户名是否存在
  usernameExists(username: string): boolean {
    return this.users.some(user => user.username === username);
  }

  // 获取所有用户（调试用）
  getAllUsers(): User[] {
    return this.users;
  }

  // 清空所有用户（调试用）
  clearAll(): void {
    this.users = [];
  }
}

// 导出单例实例
export const mockUserStore = new MockUserStore();
