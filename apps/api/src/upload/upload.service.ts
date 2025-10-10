import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { pipeline } from 'stream/promises';
import { MultipartFile } from '@fastify/multipart';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private s3Client: S3Client | null = null;
  private readonly s3Enabled: boolean;
  private readonly cloudinaryEnabled: boolean;
  private readonly s3Config: any;

  constructor(private readonly configService: ConfigService) {
    this.s3Enabled = this.configService.get<boolean>('S3_ENABLED', false);
    this.cloudinaryEnabled = this.configService.get<boolean>(
      'CLOUDINARY_ENABLED',
      false
    );

    // 详细日志
    this.logger.log(`Storage configuration: S3=${this.s3Enabled}, Cloudinary=${this.cloudinaryEnabled}`);
    this.logger.log(`CLOUDINARY_ENABLED env: ${process.env.CLOUDINARY_ENABLED}`);

    // 配置 Cloudinary
    if (this.cloudinaryEnabled) {
      const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
      const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
      const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
      
      this.logger.log(`Cloudinary config: cloud_name=${cloudName}, api_key=${apiKey ? 'SET' : 'MISSING'}, api_secret=${apiSecret ? 'SET' : 'MISSING'}`);
      
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
    const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
    if (!allowedTypes.has(file.mimetype)) {
      throw new Error('不支持的文件类型，仅支持 PNG、JPEG、WebP');
    }

    const ext = extname(file.filename || '') || '.jpg';
    const filename = `${Date.now()}${ext}`;
    const key = `avatars/${userId}/${filename}`;

    if (this.cloudinaryEnabled) {
      return this.uploadToCloudinary(file, `avatars/${userId}/${filename}`);
    } else if (this.s3Enabled) {
      return this.uploadToS3(file, key, file.mimetype);
    } else {
      return this.uploadToLocal(file, `uploads/avatars/${userId}`, filename);
    }
  }

  /**
   * 上传仓库封面
   */
  async uploadRepositoryCover(
    file: MultipartFile,
    repositoryId: string
  ): Promise<string> {
    this.logger.log(`Uploading repository cover for ${repositoryId}, cloudinaryEnabled: ${this.cloudinaryEnabled}`);
    
    const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
    if (!allowedTypes.has(file.mimetype)) {
      throw new Error('不支持的文件类型，仅支持 PNG、JPEG、WebP');
    }

    const ext = extname(file.filename || '') || '.jpg';
    const filename = `${Date.now()}${ext}`;
    const key = `repositories/${repositoryId}/${filename}`;

    if (this.cloudinaryEnabled) {
      this.logger.log(`Using Cloudinary upload for repository ${repositoryId}`);
      return this.uploadToCloudinary(
        file,
        `repositories/${repositoryId}/${filename}`
      );
    } else if (this.s3Enabled) {
      this.logger.log(`Using S3 upload for repository ${repositoryId}`);
      return this.uploadToS3(file, key, file.mimetype);
    } else {
      this.logger.log(`Using local upload for repository ${repositoryId}`);
      return this.uploadToLocal(
        file,
        `uploads/repositories/${repositoryId}`,
        filename
      );
    }
  }

  /**
   * 上传到 S3
   */
  private async uploadToS3(
    file: MultipartFile,
    key: string,
    contentType: string
  ): Promise<string> {
    try {
      const buffer = await file.toBuffer();

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
    file: MultipartFile,
    dir: string,
    filename: string
  ): Promise<string> {
    try {
      const uploadDir = join(process.cwd(), dir);
      await mkdir(uploadDir, { recursive: true });

      const filepath = join(uploadDir, filename);
      await pipeline(file.file, createWriteStream(filepath));

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
    file: MultipartFile,
    folder: string
  ): Promise<string> {
    try {
      const buffer = await file.toBuffer();

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
}
