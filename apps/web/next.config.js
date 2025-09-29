const collectDomainInputs = (...sources) => {
  const entries = [];
  sources.forEach(source => {
    if (!source) return;
    if (Array.isArray(source)) {
      entries.push(...source);
      return;
    }
    if (typeof source === 'string') {
      entries.push(...source.split(','));
      return;
    }
    entries.push(String(source));
  });
  return entries;
};

const parseHosts = entries =>
  entries
    .map(entry => entry?.trim())
    .filter(Boolean)
    .map(entry => {
      try {
        const candidate = entry.includes('://') ? entry : `https://${entry}`;
        return new URL(candidate).hostname;
      } catch {
        return entry
          .replace(/^https?:\/\//, '')
          .split('/')[0]
          .split(':')[0];
      }
    })
    .filter(Boolean);

const imageDomains = Array.from(
  new Set(
    parseHosts(
      collectDomainInputs(
        'localhost',
        '127.0.0.1',
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.NEXT_PUBLIC_API_URL,
        process.env.NEXT_PUBLIC_UPLOAD_BASE_URL,
        process.env.NEXT_PUBLIC_IMAGE_DOMAINS,
        process.env.CDN_DOMAIN
      )
    )
  )
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 15 默认启用 App Router，无需 experimental 配置
  // 关闭 React Compiler（实验特性在某些环境下会导致编译产物运行时报 SyntaxError）
  experimental: {
    reactCompiler: false,
  },

  // Server Components 外部包配置 (移出 experimental)
  serverExternalPackages: ['@prisma/client'],

  // Turbopack 配置 (移出 experimental)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // TypeScript 配置
  typescript: {
    // 在构建时进行类型检查
    ignoreBuildErrors: false,
  },

  // ESLint 配置
  eslint: {
    // 在构建时进行 ESLint 检查
    ignoreDuringBuilds: true,
  },

  // 环境变量配置
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 图片优化配置
  images: {
    domains: imageDomains,
    formats: ['image/webp', 'image/avif'],
  },

  // 重定向配置 (暂时禁用)
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/dashboard',
  //       permanent: false,
  //     },
  //   ];
  // },

  // 头部配置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // 重写规则：将前端 /api/* 代理到后端 API 服务，便于本地联调
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*',
      },
      // 静态上传资源代理：允许前端直接访问 /uploads/*
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3001/uploads/:path*',
      },
    ];
  },

  // Webpack 配置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 自定义 webpack 配置
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
};

module.exports = nextConfig;
