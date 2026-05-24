export function buildMessagesHref(
  searchParams?:
    | URLSearchParams
    | string
    | null
    | Record<string, string | string[] | undefined>
) {
  if (!searchParams) {
    return '/messages';
  }

  const query = serializeSearchParams(searchParams);

  return query ? `/messages?${query}` : '/messages';
}

export function buildMessageThreadHref(
  chatId: string,
  searchParams?:
    | URLSearchParams
    | string
    | null
    | Record<string, string | string[] | undefined>
) {
  const params =
    typeof searchParams === 'string'
      ? new URLSearchParams(searchParams)
      : searchParams instanceof URLSearchParams
        ? new URLSearchParams(searchParams)
        : new URLSearchParams();

  if (
    searchParams &&
    typeof searchParams === 'object' &&
    !(searchParams instanceof URLSearchParams)
  ) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (typeof value === 'undefined') continue;
      if (Array.isArray(value)) {
        value.forEach(item => params.append(key, item));
      } else {
        params.set(key, value);
      }
    }
  }

  params.set('chat', chatId);

  const query = params.toString();
  return query ? `/messages?${query}` : '/messages';
}

function serializeSearchParams(
  searchParams:
    | URLSearchParams
    | string
    | Record<string, string | string[] | undefined>
) {
  if (typeof searchParams === 'string') {
    return searchParams;
  }

  if (searchParams instanceof URLSearchParams) {
    return searchParams.toString();
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'undefined') continue;
    if (Array.isArray(value)) {
      value.forEach(item => params.append(key, item));
    } else {
      params.set(key, value);
    }
  }
  return params.toString();
}
