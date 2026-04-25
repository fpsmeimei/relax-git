import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    uid: string;
    username?: string;
    avatar?: string | null;
    role?: 'ADMIN' | 'USER';
    accessToken?: string;
    refreshToken?: string;
  }

  interface Session {
    user: {
      uid: string;
      id: string;
      username?: string;
      avatar?: string | null;
      role?: 'ADMIN' | 'USER';
      accessToken?: string;
      refreshToken?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid: string;
    id: string;
    username?: string;
    avatar?: string | null;
    role?: 'ADMIN' | 'USER';
    accessToken?: string;
    refreshToken?: string;
  }
}
