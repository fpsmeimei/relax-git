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

    // 查找用户
    const user = mockUserStore.findByUsername(username);
    if (!user) {
      return NextResponse.json(
        { message: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码（在实际应用中应该使用加密比较）
    if (user.password !== password) {
      return NextResponse.json(
        { message: '用户名或密码错误' },
        { status: 401 }
      );
    }

    // 生成模拟 token
    const accessToken = `mock_access_token_${user.id}`;
    const refreshToken = `mock_refresh_token_${user.id}`;

    // 返回响应
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'USER',
        createdAt: user.createdAt,
        updatedAt: user.createdAt,
      },
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: '24h',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: '登录过程中出现错误' },
      { status: 500 }
    );
  }
}
