import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    uid: string;
    accessToken?: string;
    refreshToken?: string;
  }

  interface Session {
    user: {
      uid: string;
      id: string;
      accessToken?: string;
      refreshToken?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid: string;
    id: string;
    accessToken?: string;
    refreshToken?: string;
  }
}
