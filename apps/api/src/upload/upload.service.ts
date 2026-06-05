import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { MultipartFile } from '@fastify/multipart';
import { v2 as cloudinary } from 'cloudinary';

type ValidatedImage = {
  buffer: Buffer;
  mimetype: 'image/png' | 'image/jpeg' | 'image/webp';
  extension: '.png' | '.jpg' | '.webp';
};

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: S3Client | null = null;
  private readonly s3Enabled: boolean;
  private readonly cloudinaryEnabled: boolean;
  private readonly s3Config: any;

  constructor(private readonly configService: ConfigService) {
    this.s3Enabled = this.configService.get<boolean>('S3_ENABLED', false);

    // 修复环境变量解析 - 字符串 "true" 应该被识别为 boolean true
    const cloudinaryEnabledStr = this.configService.get(
      'CLOUDINARY_ENABLED',
      'false'
    );
    this.cloudinaryEnabled =
      cloudinaryEnabledStr === 'true' || cloudinaryEnabledStr === true;

    // 详细日志
    this.logger.log(
      `Storage configuration: S3=${this.s3Enabled}, Cloudinary=${this.cloudinaryEnabled}`
    );
    this.logger.log(
      `CLOUDINARY_ENABLED env: ${process.env.CLOUDINARY_ENABLED}`
    );

    // 配置 Cloudinary
    if (this.cloudinaryEnabled) {
      const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
      const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
      const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

      this.logger.log(
        `Cloudinary config: cloud_name=${cloudName}, api_key=${apiKey ? 'SET' : 'MISSING'}, api_secret=${apiSecret ? 'SET' : 'MISSING'}`
      );

      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.logger.log('Cloudinary storage enabled and configured');
    } else {
      this.logger.warn('Cloudinary storage DISABLED - using local storage');
    }

    if (this.s3Enabled) {
      this.s3Config = {
        bucket: this.configService.get<string>(
          'S3_BUCKET',
          'relax-git-uploads'
        ),
        region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
        endpoint: this.configService.get<string>('S3_ENDPOINT'),
        forcePathStyle: this.configService.get<boolean>(
          'S3_FORCE_PATH_STYLE',
          false
        ),
      };

      this.s3Client = new S3Client({
        region: this.s3Config.region,
        endpoint: this.s3Config.endpoint,
        forcePathStyle: this.s3Config.forcePathStyle,
        credentials: {
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
          secretAccessKey: this.configService.get<string>(
            'AWS_SECRET_ACCESS_KEY',
            ''
          ),
        },
      });

      this.logger.log(
        `S3 storage enabled: ${this.s3Config.endpoint}/${this.s3Config.bucket}`
      );
    } else {
      this.logger.log('Using local file storage');
    }
  }

  /**
   * 上传头像
   */
  async uploadAvatar(file: MultipartFile, userId: string): Promise<string> {
    const image = await this.validateImage(file);

    const filename = `${Date.now()}${image.extension}`;
    const key = `avatars/${userId}/${filename}`;

    if (this.cloudinaryEnabled) {
      return this.uploadToCloudinary(
        image.buffer,
        `avatars/${userId}/${filename}`
      );
    } else if (this.s3Enabled) {
      return this.uploadToS3(image.buffer, key, image.mimetype);
    } else {
      return this.uploadToLocal(
        image.buffer,
        `uploads/avatars/${userId}`,
        filename
      );
    }
  }

  /**
   * 上传仓库封面
   */
  async uploadRepositoryCover(
    file: MultipartFile,
    repositoryId: string
  ): Promise<string> {
    this.logger.log(
      `Uploading repository cover for ${repositoryId}, cloudinaryEnabled: ${this.cloudinaryEnabled}`
    );

    const image = await this.validateImage(file);

    const filename = `${Date.now()}${image.extension}`;
    const key = `repositories/${repositoryId}/${filename}`;

    if (this.cloudinaryEnabled) {
      this.logger.log(`Using Cloudinary upload for repository ${repositoryId}`);
      return this.uploadToCloudinary(
        image.buffer,
        `repositories/${repositoryId}/${filename}`
      );
    } else if (this.s3Enabled) {
      this.logger.log(`Using S3 upload for repository ${repositoryId}`);
      return this.uploadToS3(image.buffer, key, image.mimetype);
    } else {
      this.logger.log(`Using local upload for repository ${repositoryId}`);
      return this.uploadToLocal(
        image.buffer,
        `uploads/repositories/${repositoryId}`,
        filename
      );
    }
  }

  /**
   * 上传到 S3
   */
  private async uploadToS3(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.s3Config.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        Metadata: {
          uploadDate: new Date().toISOString(),
        },
      });

      await this.s3Client!.send(command);

      // 返回 S3 URL
      const s3Url = this.s3Config.forcePathStyle
        ? `${this.s3Config.endpoint}/${this.s3Config.bucket}/${key}`
        : `https://${this.s3Config.bucket}.${this.s3Config.endpoint.replace('https://', '')}/${key}`;

      this.logger.log(`File uploaded to S3: ${s3Url}`);
      return s3Url;
    } catch (error) {
      this.logger.error('S3 upload failed:', error);
      throw new Error('文件上传失败');
    }
  }

  /**
   * 上传到本地文件系统
   */
  private async uploadToLocal(
    buffer: Buffer,
    dir: string,
    filename: string
  ): Promise<string> {
    try {
      const uploadDir = join(process.cwd(), dir);
      await mkdir(uploadDir, { recursive: true });

      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);

      const publicUrl = `/${dir}/${filename}`;
      this.logger.log(`File uploaded locally: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      this.logger.error('Local upload failed:', error);
      throw new Error('文件上传失败');
    }
  }

  /**
   * 上传到 Cloudinary
   */
  private async uploadToCloudinary(
    buffer: Buffer,
    folder: string
  ): Promise<string> {
    try {
      // 使用 Promise 包装 upload_stream
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'relax-git',
            resource_type: 'image',
            transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      const cloudinaryUrl = (uploadResult as any).secure_url;
      this.logger.log(`File uploaded to Cloudinary: ${cloudinaryUrl}`);
      return cloudinaryUrl;
    } catch (error) {
      this.logger.error('Cloudinary upload failed:', error);
      throw new Error('文件上传失败');
    }
  }

  private async validateImage(file: MultipartFile): Promise<ValidatedImage> {
    const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
    if (!allowedTypes.has(file.mimetype)) {
      throw new Error('不支持的文件类型，仅支持 PNG、JPEG、WebP');
    }

    const buffer = await file.toBuffer();
    const detected = this.detectImageType(buffer);

    if (!detected) {
      throw new Error('文件内容与图片类型不匹配');
    }

    if (file.mimetype !== detected.mimetype) {
      throw new Error('文件内容与图片类型不匹配');
    }

    return {
      buffer,
      ...detected,
    };
  }

  private detectImageType(
    buffer: Buffer
  ): Omit<ValidatedImage, 'buffer'> | null {
    if (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { mimetype: 'image/png', extension: '.png' };
    }

    if (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    ) {
      return { mimetype: 'image/jpeg', extension: '.jpg' };
    }

    if (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
      return { mimetype: 'image/webp', extension: '.webp' };
    }

    return null;
  }
}
