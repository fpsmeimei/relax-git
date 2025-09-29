import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class ImportRepositoryDto {
  @ApiProperty({
    description: 'Git 仓库 URL（支持 GitHub 公共仓库）',
    example: 'https://github.com/owner/repo.git',
  })
  @IsString()
  gitUrl!: string;

  @ApiPropertyOptional({
    description: '仓库名称（不填则从 URL 推断）',
    example: 'my-repo',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional({
    description: '基线分支（默认使用远端 HEAD 指向的分支）',
    example: 'main',
  })
  @IsOptional()
  @IsString()
  baseBranch?: string;

  @ApiPropertyOptional({
    description: '对比分支（可选）',
    example: 'feature/login',
  })
  @IsOptional()
  @IsString()
  featureBranch?: string;

  @ApiPropertyOptional({
    description: '可见性（默认 private）',
    enum: ['public_all', 'public_readonly', 'private'],
    default: 'private',
  })
  @IsOptional()
  @IsString()
  visibility?: string;

  @ApiPropertyOptional({ description: '描述', example: 'Imported from GitHub' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}

export class ImportRepositoryResponseDto {
  @ApiProperty({ description: '仓库 ID' })
  repositoryId!: string;

  @ApiPropertyOptional({
    description:
      '基线快照 ID（如创建成功；返回后可通过 /snapshots/:id/status 轮询）',
  })
  baseSnapshotId?: string;

  @ApiPropertyOptional({
    description: '对比快照 ID（如创建成功；可能因未提供分支或排队失败缺失）',
  })
  featureSnapshotId?: string;

  // 移除 diffId 字段，不再自动创建 Diff

  @ApiProperty({ description: '使用的分支信息' })
  branches!: {
    defaultBranch: string;
    baseBranch: string;
    featureBranch?: string;
  };
}
