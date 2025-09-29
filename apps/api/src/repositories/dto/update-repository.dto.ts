import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RepositoryVisibility } from '@relax-git/shared/generated/prisma-client';

/**
 * 更新仓库请求DTO
 */
export class UpdateRepositoryDto {
  @ApiPropertyOptional({
    description: '仓库名称',
    example: 'my-awesome-project-v2',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: '仓库名称只能包含字母、数字、下划线和连字符',
  })
  name?: string;

  @ApiPropertyOptional({
    description: '默认分支名称',
    example: 'develop',
  })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  defaultBranch?: string;

  @ApiPropertyOptional({
    description: '仓库可见性',
    enum: RepositoryVisibility,
  })
  @IsOptional()
  @IsEnum(RepositoryVisibility)
  visibility?: RepositoryVisibility;

  @ApiPropertyOptional({
    description: '仓库描述',
    example: '这是一个更新后的项目描述',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({
    description: '是否发布到社区',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
