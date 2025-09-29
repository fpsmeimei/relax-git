// 数据库配置

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

export const getDatabaseConfig = (): DatabaseConfig => {
  return {
    host: process.env['DATABASE_HOST'] ?? 'localhost',
    port: parseInt(process.env['DATABASE_PORT'] ?? '5432', 10),
    database: process.env['DATABASE_NAME'] ?? 'relax_git_dev',
    username: process.env['DATABASE_USER'] ?? 'postgres',
    password: process.env['DATABASE_PASSWORD'] ?? 'postgres',
    ssl: process.env['DATABASE_SSL'] === 'true',
    maxConnections: parseInt(
      process.env['DATABASE_MAX_CONNECTIONS'] ?? '20',
      10
    ),
    connectionTimeout: parseInt(process.env['DATABASE_TIMEOUT'] ?? '30000', 10),
  };
};

export const getDatabaseUrl = (): string => {
  const config = getDatabaseConfig();
  const sslParam = config.ssl ? '?sslmode=require' : '';
  return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}${sslParam}`;
};
