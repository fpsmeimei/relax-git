import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  const rawUser = session?.user as Record<string, unknown> | undefined;

  const getString = (key: string) => {
    const value = rawUser?.[key];
    return typeof value === 'string' && value.trim().length > 0
      ? value.trim()
      : undefined;
  };

  const id = getString('id');
  const uid = getString('uid') ?? id;
  const username =
    getString('username') ??
    getString('name') ??
    getString('displayName') ??
    '';

  const avatar =
    getString('image') ??
    getString('avatar') ??
    getString('photo') ??
    getString('photoURL') ??
    getString('photoUrl') ??
    null;

  const displayName =
    getString('name') ?? getString('displayName') ?? (username || undefined);

  return {
    user:
      rawUser && (id || uid)
        ? {
            id: id ?? uid ?? '',
            uid: uid ?? id ?? '',
            username,
            role: 'USER',
            avatar,
            displayName,
          }
        : null,
    loading: status === 'loading',
    isAuthenticated: !!session?.user,
    isInitialized: status !== 'loading',
  };
}
