import { describe, expect, it } from 'vitest';

import { buildMessageThreadHref, buildMessagesHref } from '../messages-route';

describe('buildMessagesHref', () => {
  it('returns the canonical messages route when there is no query', () => {
    expect(buildMessagesHref()).toBe('/messages');
    expect(buildMessagesHref(new URLSearchParams())).toBe('/messages');
  });

  it('preserves compatibility query parameters', () => {
    const params = new URLSearchParams({
      assistant: 'repo',
      createDirect: 'user-123',
    });

    expect(buildMessagesHref(params)).toBe(
      '/messages?assistant=repo&createDirect=user-123'
    );
  });

  it('builds a canonical thread link inside the messages center', () => {
    expect(buildMessageThreadHref('chat-123')).toBe('/messages?chat=chat-123');

    const params = new URLSearchParams({
      assistant: 'repo',
    });

    expect(buildMessageThreadHref('chat-123', params)).toBe(
      '/messages?assistant=repo&chat=chat-123'
    );
  });
});
