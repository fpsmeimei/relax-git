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
          return null;
        }

        try {
          const loginUrl = `${API_BASE}/api/_auth/login`;

          const response = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            await response.json().catch(() => ({}));
            return null;
          }

          const data = await response.json();

          const user: any = {
            id: data.user.id,
            name: data.user.username,
            username: data.user.username,
            uid: data.user.uid,
            avatar: data.user.avatar ?? null,
            role: data.user.role,
          };

          return user;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // 首次登录时，只将非敏感用户信息存入 NextAuth token。
      if (user) {
        const u = user as any;
        token['uid'] = u.uid;
        token['id'] = u.id;
        token['username'] = u.username ?? u.name;
        token['avatar'] = u.avatar ?? null;
        token['role'] = u.role ?? 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      // 将 token 中的信息添加到 session
      if (token && session.user) {
        const t = token as any;
        (session.user as any).uid = t.uid;
        (session.user as any).id = t.id;
        (session.user as any).username = t.username;
        (session.user as any).avatar = t.avatar ?? null;
        (session.user as any).role = t.role ?? 'USER';
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
