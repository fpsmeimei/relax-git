import { NextResponse } from 'next/server';

// Railway 健康检查路由
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'relax-git-web',
    timestamp: new Date().toISOString(),
  });
}
