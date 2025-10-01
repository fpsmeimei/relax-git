import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuth = nextUrl.pathname.startsWith('/auth');
      
      // 允许访问认证页面
      if (isOnAuth) {
        return true;
      }
      
      // 受保护的路由需要登录
      if (!isLoggedIn) {
        return false;
      }
      
      return true;
    },
  },
  providers: [], // 在 auth.ts 中添加
} satisfies NextAuthConfig;
