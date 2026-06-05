import { JwtModuleOptions } from '@nestjs/jwt';

/**
 * JWT配置
 * ⚠️ 必须配置 JWT_SECRET 环境变量
 */
export const getJwtSecret = (): string => {
  const secret = process.env['JWT_SECRET']?.trim();
  if (secret && secret !== 'dev_jwt_secret_change_me') {
    return secret;
  }

  if (process.env['NODE_ENV'] === 'production') {
    throw new Error('JWT_SECRET must be configured in production');
  }

  return 'dev_jwt_secret_change_me';
};

export const getJwtConfig = (): JwtModuleOptions => ({
  secret: getJwtSecret(),
  signOptions: {
    expiresIn: parseInt(process.env['JWT_EXPIRES_IN_SECONDS'] || '604800', 10),
  },
});
