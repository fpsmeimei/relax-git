import { buildMessagesHref } from '@/lib/messages-route';
import { redirect } from 'next/navigation';

export default async function ChatListPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  redirect(buildMessagesHref(resolvedSearchParams ?? null));
}
