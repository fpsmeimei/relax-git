import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(_req: NextRequest) {
  // 已取消“免登录演示”模式：不再进行任何基于开关的强制重定向
  return NextResponse.next();
}

// 仅匹配 /auth/* 路由
export const config = {
  matcher: ['/auth/:path*'],
};
