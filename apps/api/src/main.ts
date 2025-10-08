import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyCookie from '@fastify/cookie';
import { join } from 'path';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { mkdir } from 'fs/promises';

async function bootstrap() {
  //  调试：打印环境变量
  console.log('  Environment Variables Debug (from Node.js):');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  console.log(
    'DATABASE_URL:',
    process.env.DATABASE_URL?.substring(0, 50),
    '...'
  );
  console.log('REDIS_URL:', process.env.REDIS_URL?.substring(0, 30), '...');
  console.log('JWT_SECRET:', process.env.JWT_SECRET?.substring(0, 10), '...');
  console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        level: process.env['LOG_LEVEL'] ?? 'info',
      },
      //  代理：用于获取真实客户端 IP（X-Forwarded-For）
      //  Express 的 app.set('trust proxy', 1)
      trustProxy: true,
    })
  );

  // 文件上传（头像）与静态资源（/uploads）
  // 确保静态根目录存在
  const uploadsRoot = join(process.cwd(), 'uploads');
  await mkdir(uploadsRoot, { recursive: true });
  await app.register(
    fastifyMultipart as any,
    {
      limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2MB, 单文件
    } as any
  );
  await app.register(
    fastifyStatic as any,
    {
      root: uploadsRoot,
      prefix: '/uploads/',
      decorateReply: false,
    } as any
  );

  // Cookie 解析（用于 JWT HttpOnly Cookie）
  await app.register(
    fastifyCookie as any,
    {
      hook: 'onRequest',
    } as any
  );

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // 全局异常过滤器：统一 code/message 格式
  app.useGlobalFilters(new HttpExceptionFilter());

  // WebSocket 适配器配置 (支持 Fastify)
  app.useWebSocketAdapter(new IoAdapter(app));

  // CORS 配置（安全加固版本）
  const corsFromEnv = (process.env['CORS_ORIGIN'] || '').trim();
  const isProduction = process.env['NODE_ENV'] === 'production';

  // ⚠️ 生产环境禁止使用 CORS_ORIGIN=* (临时允许用于测试)
  if (isProduction && corsFromEnv === '*') {
    console.warn('⚠️ 安全警告: 生产环境使用 CORS_ORIGIN=*，仅用于测试！');
    console.warn(
      '生产环境请设置具体的域名，例如: CORS_ORIGIN=https://yourdomain.com'
    );
    // process.exit(1); // 临时注释掉，允许测试
  }

  if (corsFromEnv === '*') {
    // 开发环境：允许任意来源（仅限本地开发）
    console.warn(
      '⚠️  CORS 配置为通配符 (*) - 仅用于开发环境，生产环境必须指定具体域名'
    );
    app.enableCors({
      origin: true, // 反射请求来源（允许任意来源）
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 86400,
    });
  } else {
    const corsList = corsFromEnv
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    app.enableCors({
      origin: (origin, cb) => {
        // SSR/非浏览器请求（如curl/postman）无 origin
        // 生产环境拒绝，开发环境放行
        if (!origin) {
          return cb(null, !isProduction);
        }

        // 显式白名单（逗号分隔）优先
        if (corsList.length > 0) {
          if (corsList.includes(origin)) {
            return cb(null, true);
          }
          return cb(new Error('Not allowed by CORS'));
        }

        // 开发默认：允许 localhost / 127.0.0.1 的任意端口
        if (!isProduction) {
          const ok = /^http:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/.test(origin);
          return cb(ok ? null : new Error('Not allowed by CORS'), ok);
        }

        // 生产环境：无白名单则拒绝
        return cb(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 86400,
    });
  }

  // Swagger 文档配置
  // 在生产环境中也启用 Swagger 文档
  const enableSwagger = true;
  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Relax-Git API')
      .setDescription(
        '聚焦评论与社区的现代化协作平台 API（已下线 Diff/PR 审核流）'
      )
      .setVersion('0.1.0')
      .addBearerAuth()
      .addTag('auth', '认证相关')
      .addTag('users', '用户管理')
      .addTag('health', '健康检查')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // 启动服务器 - 优先使用 PORT，回退到 API_PORT
  const port = parseInt(
    process.env['PORT'] ?? process.env['API_PORT'] ?? '3001',
    10
  );
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Relax-Git API Server is running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
