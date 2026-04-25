export function buildMessagesHref(
  searchParams?: URLSearchParams | string | null
) {
  if (!searchParams) {
    return '/messages';
  }

  const query =
    typeof searchParams === 'string' ? searchParams : searchParams.toString();

  return query ? `/messages?${query}` : '/messages';
}

export function buildMessageThreadHref(
  chatId: string,
  searchParams?: URLSearchParams | string | null
) {
  const params =
    typeof searchParams === 'string'
      ? new URLSearchParams(searchParams)
      : new URLSearchParams(searchParams ?? undefined);

  params.set('chat', chatId);

  const query = params.toString();
  return query ? `/messages?${query}` : '/messages';
}
