import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ValidateGitUrlDto {
  @ApiProperty({ description: '待验证的 Git 仓库 URL' })
  @IsString()
  gitUrl!: string;
}
