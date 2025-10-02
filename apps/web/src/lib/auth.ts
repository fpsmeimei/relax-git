import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';

// 🔥 统一使用 Next.js 代理，确保 Cookie 正确传递
// SSR 环境：使用内部地址通过代理访问后端
// 客户端：通过浏览器代理访问
const getApiUrl = () => {
  // 服务端：使用 Next.js 内部地址
  if (typeof window === 'undefined') {
    return process.env['NEXTAUTH_URL'] || 'http://localhost:3000';
  }
  // 客户端：使用相对路径
  return '';
};

const API_BASE = getApiUrl();

const nextAuth = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log('[NextAuth] Missing credentials');
          return null;
        }

        try {
          // 🔥 使用 Next.js 代理路由，确保 Cookie 正确传递
          const loginUrl = `${API_BASE}/api/_auth/login`;
          console.log(
            '[NextAuth] Calling backend login API via proxy:',
            loginUrl
          );

          // 通过 Next.js 代理调用后端（SSR 环境也能正确处理 Cookie）
          const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          console.log('[NextAuth] Backend response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[NextAuth] Backend login failed:', errorData);
            return null;
          }

          const data = await response.json();
          console.log('[NextAuth] Backend login success:', data);

          // 返回用户信息和token
          // 🔥 修复：将accessToken传递给JWT callback
          const user: any = {
            id: data.user.id,
            name: data.user.username,
            uid: data.user.uid,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };

          console.log('[NextAuth] Returning user with token');
          return user;
        } catch (error) {
          console.error('[NextAuth] Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // 首次登录时，将用户信息和tokens存入 token
      if (user) {
        const u = user as any;
        token['uid'] = u.uid;
        token['id'] = u.id;
        token['accessToken'] = u.accessToken;
        token['refreshToken'] = u.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      // 将 token 中的信息添加到 session
      if (token && session.user) {
        const t = token as any;
        (session.user as any).uid = t.uid;
        (session.user as any).id = t.id;
        (session.user as any).accessToken = t.accessToken;
        (session.user as any).refreshToken = t.refreshToken;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  secret: process.env['AUTH_SECRET'] || 'relax-git-secret-change-in-production',
});

// 显式导出，避免推断类型包含不可命名类型导致 TS4111
export const handlers = nextAuth.handlers;
export const signIn: any = nextAuth.signIn;
export const signOut: any = nextAuth.signOut;
export const auth: any = nextAuth.auth;
