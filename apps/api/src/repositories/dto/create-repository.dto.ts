import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RepositoryVisibility } from '@relax-git/shared/generated/prisma-client';

/**
 * 创建仓库请求DTO
 */
export class CreateRepositoryDto {
  @ApiProperty({
    description: '仓库名称',
    example: 'my-awesome-project',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: '仓库名称只能包含字母、数字、下划线和连字符',
  })
  name: string;

  @ApiProperty({
    description: 'Git仓库URL',
    example: 'https://github.com/user/repo.git',
  })
  @IsString()
  @IsUrl({}, { message: '请提供有效的Git仓库URL' })
  gitUrl: string;

  @ApiPropertyOptional({
    description: '默认分支名称',
    example: 'main',
    default: 'main',
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  defaultBranch?: string;

  @ApiPropertyOptional({
    description: '仓库可见性',
    enum: RepositoryVisibility,
    default: RepositoryVisibility.PRIVATE,
  })
  @IsOptional()
  @IsEnum(RepositoryVisibility)
  visibility?: RepositoryVisibility;

  @ApiPropertyOptional({
    description: '仓库描述',
    example: '这是一个很棒的项目',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}
