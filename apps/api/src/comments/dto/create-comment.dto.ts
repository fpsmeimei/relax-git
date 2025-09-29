import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommentAnchorType } from '@relax-git/shared/generated/prisma-client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';

/**
 * 创建评论请求DTO
 */
export class CreateCommentDto {
  @ApiProperty({
    description: '快照ID',
    example: 'clm1234567890abcdef',
  })
  @IsString()
  snapshotId: string;

  @ApiProperty({
    description: '评论内容（支持Markdown格式）',
    example: '这个实现看起来不错，但是建议添加错误处理。',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @Length(1, 2000, { message: '评论内容长度必须在1-2000字符之间' })
  @Transform(({ value }) => value?.trim())
  content: string;

  @ApiProperty({
    description: '锚点类型',
    enum: CommentAnchorType,
    example: CommentAnchorType.LINE,
  })
  @IsEnum(CommentAnchorType, { message: '锚点类型无效' })
  anchorType: CommentAnchorType;

  @ApiPropertyOptional({
    description: 'Git提交SHA（提交级和文件级、行级锚点必需）',
    example: 'a1b2c3d4e5f6789012345678901234567890abcd',
    minLength: 40,
    maxLength: 40,
  })
  @ValidateIf(
    o =>
      o.anchorType === CommentAnchorType.COMMIT ||
      o.anchorType === CommentAnchorType.FILE ||
      o.anchorType === CommentAnchorType.LINE
  )
  @IsString({ message: '提交SHA必须是字符串' })
  @Length(40, 40, { message: 'Git提交SHA必须是40位字符' })
  @Matches(/^[a-f0-9]{40}$/, {
    message: 'Git提交SHA必须是有效的40位十六进制字符串',
  })
  @IsOptional()
  commitSha?: string;

  @ApiPropertyOptional({
    description: '文件路径（文件级和行级锚点必需）',
    example: 'src/components/Button.tsx',
    maxLength: 500,
  })
  @ValidateIf(
    o =>
      o.anchorType === CommentAnchorType.FILE ||
      o.anchorType === CommentAnchorType.LINE
  )
  @IsString({ message: '文件路径必须是字符串' })
  @Length(1, 500, { message: '文件路径长度必须在1-500字符之间' })
  @IsOptional()
  filePath?: string;

  @ApiPropertyOptional({
    description: '行级锚点开始行号（行级锚点必需）',
    example: 15,
    minimum: 1,
  })
  @ValidateIf(o => o.anchorType === CommentAnchorType.LINE)
  @IsInt({ message: '开始行号必须是整数' })
  @Min(1, { message: '开始行号必须大于0' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  lineStart?: number;

  @ApiPropertyOptional({
    description: '行级锚点结束行号（行级锚点可选，默认等于开始行号）',
    example: 20,
    minimum: 1,
  })
  @ValidateIf(
    o => o.anchorType === CommentAnchorType.LINE && o.lineEnd !== undefined
  )
  @IsInt({ message: '结束行号必须是整数' })
  @Min(1, { message: '结束行号必须大于0' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  lineEnd?: number;

  @ApiPropertyOptional({
    description: '父评论ID（回复评论时必需）',
    example: 'clm0987654321fedcba',
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({
    description: '幂等键（可选，防重复提交，建议UUID或短随机串）',
    example: 'e7b6a1b2-3c4d-5e6f-7890-abcdef123456',
    maxLength: 64,
  })
  @IsOptional()
  @IsString({ message: '幂等键必须是字符串' })
  @Length(1, 64, { message: '幂等键长度必须在1-64字符之间' })
  idempotencyKey?: string;
}
