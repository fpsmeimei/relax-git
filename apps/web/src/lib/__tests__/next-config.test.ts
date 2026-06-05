import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const nextConfig = require('../../../next.config.js');

describe('next.config API proxy headers', () => {
  it('does not inject wildcard CORS headers for API proxy routes', async () => {
    const headers = (await nextConfig.headers?.()) ?? [];
    const apiHeaders = headers.find(
      (entry: any) => entry.source === '/api/:path*'
    );

    expect(apiHeaders?.headers ?? []).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'Access-Control-Allow-Origin' }),
      ])
    );
  });
});
