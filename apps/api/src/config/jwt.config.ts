import { JwtModuleOptions } from '@nestjs/jwt';

/**
 * JWT配置
 * ⚠️ 必须配置 JWT_SECRET 环境变量
 */
export const getJwtConfig = (): JwtModuleOptions => ({
  secret: process.env['JWT_SECRET'] || 'dev_jwt_secret_change_me',
  signOptions: {
    expiresIn: parseInt(process.env['JWT_EXPIRES_IN_SECONDS'] || '604800', 10),
  },
});
