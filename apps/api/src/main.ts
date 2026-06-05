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

  app
    .getHttpAdapter()
    .getInstance()
    .addHook('onRequest', async (_request, reply) => {
      reply.header('X-Content-Type-Options', 'nosniff');
      reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
      reply.header('Server', 'Relax-Git API');

      if (process.env['NODE_ENV'] === 'production') {
        reply.header(
          'Strict-Transport-Security',
          'max-age=31536000; includeSubDomains; preload'
        );
      }
    });

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
    throw new Error(
      '生产环境禁止使用 CORS_ORIGIN=*，请设置具体域名，例如 CORS_ORIGIN=https://relax-git.goodbyeri.cc'
    );
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
          return cb(new Error('Not allowed by CORS'), false);
        }

        // 开发默认：允许 localhost / 127.0.0.1 的任意端口
        if (!isProduction) {
          const ok = /^http:\/\/(localhost|127\.0\.0\.1)(:\\d+)?$/.test(origin);
          return cb(ok ? null : new Error('Not allowed by CORS'), ok);
        }

        // 生产环境：无白名单则拒绝
        return cb(new Error('Not allowed by CORS'), false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 86400,
    });
  }

  // Swagger 文档配置
  const enableSwagger =
    !isProduction || process.env['ENABLE_SWAGGER'] === 'true';
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

  const port = parseInt(process.env['API_PORT'] ?? '3001', 10);
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Relax-Git API Server is running on http://localhost:${port}`);
  if (enableSwagger) {
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  }
}

bootstrap().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
