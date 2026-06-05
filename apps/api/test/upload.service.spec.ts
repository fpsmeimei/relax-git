import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { UploadService } from '../src/upload/upload.service';

function createConfig(values: Record<string, unknown> = {}) {
  return {
    get: jest.fn((key: string, defaultValue?: unknown) =>
      key in values ? values[key] : defaultValue
    ),
  };
}

function createMultipartFile(
  buffer: Buffer,
  mimetype: string,
  filename: string
) {
  return {
    mimetype,
    filename,
    file: Readable.from(buffer),
    toBuffer: jest.fn(async () => buffer),
  };
}

describe('UploadService local image validation', () => {
  const originalCwd = process.cwd();
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'relax-git-upload-test-'));
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  });

  it('rejects a file whose bytes do not match the claimed image MIME type', async () => {
    const service = new UploadService(createConfig() as any);
    const file = createMultipartFile(
      Buffer.from('not actually an image'),
      'image/png',
      'avatar.png'
    );

    await expect(service.uploadAvatar(file as any, 'user-1')).rejects.toThrow(
      '文件内容与图片类型不匹配'
    );
  });

  it('uses a safe extension derived from verified image bytes', async () => {
    const service = new UploadService(createConfig() as any);
    const png = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
    ]);
    const file = createMultipartFile(png, 'image/png', 'avatar.svg');

    const url = await service.uploadAvatar(file as any, 'user-1');

    expect(url).toMatch(/^\/uploads\/avatars\/user-1\/\d+\.png$/);
  });
});
