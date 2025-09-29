export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  maxConnections?: number;
  connectionTimeout?: number;
}
export declare const getDatabaseConfig: () => DatabaseConfig;
export declare const getDatabaseUrl: () => string;
//# sourceMappingURL=database.config.d.ts.map
