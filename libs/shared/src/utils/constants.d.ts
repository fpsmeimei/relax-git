export declare const APP_CONFIG: {
  readonly NAME: 'Relax-Git';
  readonly VERSION: '0.1.0';
  readonly DESCRIPTION: '基于 Git worktree 的现代化协作平台';
};
export declare const API_CONFIG: {
  readonly PREFIX: '/api/v1';
  readonly TIMEOUT: 30000;
  readonly MAX_RETRIES: 3;
};
export declare const SNAPSHOT_CONFIG: {
  readonly MAX_CONCURRENT: 3;
  readonly DEFAULT_TTL_DAYS: 7;
  readonly MAX_SIZE_MB: 1024;
  readonly CREATION_TIMEOUT_SECONDS: 30;
};
export declare const REALTIME_CONFIG: {
  readonly MAX_EVENT_DELAY_MS: 500;
  readonly HEARTBEAT_INTERVAL_MS: 30000;
  readonly RECONNECT_ATTEMPTS: 5;
};
export declare const PERFORMANCE_TARGETS: {
  readonly SNAPSHOT_CREATION_MAX_SECONDS: 3;
  readonly EVENT_PUSH_MAX_MS: 500;
  readonly API_AVAILABILITY_PERCENT: 99.9;
  readonly FUNCTION_PASS_RATE_PERCENT: 95;
};
//# sourceMappingURL=constants.d.ts.map
