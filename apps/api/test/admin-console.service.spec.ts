import { AdminConsoleService } from '../src/admin/admin-console.service';

describe('AdminConsoleService', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.WORKER_HEALTH_URL;
    delete process.env.WORKER_HOST;
    delete process.env.WORKER_PORT;
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  const createService = () =>
    new AdminConsoleService({} as any, {} as any) as any;

  it('checks the Docker Compose worker service by default', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'healthy',
        version: '0.1.0',
        uptime: '1h',
      }),
    });
    global.fetch = fetchMock as any;

    const result = await createService().checkWorkerHealth();

    expect(fetchMock).toHaveBeenCalledWith('http://worker:3002/health', {
      method: 'GET',
    });
    expect(result).toEqual({
      healthy: true,
      status: 'healthy',
      version: '0.1.0',
      uptime: '1h',
    });
  });

  it('allows overriding the worker health URL for non-Docker local runs', async () => {
    process.env.WORKER_HEALTH_URL = 'http://localhost:3002/health';
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'healthy' }),
    });
    global.fetch = fetchMock as any;

    await createService().checkWorkerHealth();

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3002/health', {
      method: 'GET',
    });
  });
});
