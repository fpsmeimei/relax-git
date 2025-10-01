import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const HOME_ROUTE = process.env['NEXT_PUBLIC_HOME_ROUTE'] || '/';

// 🔥 NextAuth middleware 包装（内联导出，避免类型推断报错）
const _mw = auth(req => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthPage = nextUrl.pathname.startsWith('/auth');
  // 🔥 公开页面：仅 首页 + 认证页面
  const isPublicPage = nextUrl.pathname === '/' || isAuthPage;

  // 已登录用户访问登录/注册页，重定向到首页（可配置）
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL(HOME_ROUTE, nextUrl));
  }

  // 未登录用户访问受保护页面，重定向到登录页
  if (!isLoggedIn && !isPublicPage) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/auth/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  return NextResponse.next();
});

// 避免默认导出类型推断错误（NextAuth 类型在构建时可用）
export default _mw as any;

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了:
     * - /api/* (API routes, 包括 NextAuth)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /robots.txt, etc.
     * - 静态文件 (.png, .jpg, .svg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
