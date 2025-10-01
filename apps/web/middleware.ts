export { auth as middleware } from '@/lib/auth';
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|public).*)',
    '/repositories/:path*',
    '/dashboard/:path*',
    '/settings/:path*',
  ],
};
