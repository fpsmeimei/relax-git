import { registerAs } from '@nestjs/config';

/**
 * S3 对象存储配置
 */
export default registerAs('s3', () => ({
  // S3 是否启用
  enabled: process.env.S3_ENABLED === 'true' || false,

  // AWS 访问密钥
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',

  // S3 端点（支持兼容S3的服务如MinIO）
  endpoint: process.env.S3_ENDPOINT || 's3.amazonaws.com',

  // 存储桶名称
  bucket: process.env.S3_BUCKET || 'relax-git-artifacts',

  // AWS 区域
  region: process.env.AWS_REGION || 'us-east-1',

  // 强制路径样式（用于MinIO等）
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true' || false,

  // 签名版本
  signatureVersion: process.env.S3_SIGNATURE_VERSION || 'v4',

  // 上传选项
  upload: {
    // 并发上传的分片数量
    partSize: parseInt(process.env.S3_UPLOAD_PART_SIZE || '10485760', 10), // 10MB
    queueSize: parseInt(process.env.S3_UPLOAD_QUEUE_SIZE || '4', 10),

    // 文件过期时间（天）
    expirationDays: parseInt(process.env.S3_EXPIRATION_DAYS || '90', 10),
  },

  // CDN 配置
  cdn: {
    enabled: process.env.CDN_ENABLED === 'true' || false,
    domain: process.env.CDN_DOMAIN || '',
  },
}));
