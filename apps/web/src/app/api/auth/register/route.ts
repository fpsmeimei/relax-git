import { mockUserStore } from '@/lib/mockUserStore';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        { message: '用户名和密码都是必填项' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { message: '用户名至少需要3个字符' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: '密码至少需要6个字符' },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    if (mockUserStore.usernameExists(username)) {
      return NextResponse.json({ message: '用户名已存在' }, { status: 409 });
    }

    // 创建新用户
    const newUser = {
      id: `user_${Date.now()}`,
      username,
      password, // 在实际应用中应该加密
      email: `${username}@relax-git.local`,
      createdAt: new Date().toISOString(),
    };

    mockUserStore.addUser(newUser);

    // 生成模拟 token
    const accessToken = `mock_access_token_${newUser.id}`;
    const refreshToken = `mock_refresh_token_${newUser.id}`;

    // 返回响应
    return NextResponse.json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: 'USER',
        createdAt: newUser.createdAt,
        updatedAt: newUser.createdAt,
      },
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: '24h',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: '注册过程中出现错误' },
      { status: 500 }
    );
  }
}
