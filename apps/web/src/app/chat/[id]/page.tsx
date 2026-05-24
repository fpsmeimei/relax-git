import { buildMessageThreadHref } from '@/lib/messages-route';
import { redirect } from 'next/navigation';

export default async function ChatDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id?: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const chatId = String(resolvedParams?.id ?? '');
  if (!chatId) {
    redirect('/messages');
  }

  redirect(buildMessageThreadHref(chatId, resolvedSearchParams ?? null));
}
