import { IsString, IsOptional } from 'class-validator';

export class CreateMovieFavoriteDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  englishName?: string;

  @IsString()
  @IsOptional()
  year?: string;

  @IsString()
  @IsOptional()
  rating?: string;

  @IsString()
  @IsOptional()
  director?: string;

  @IsString()
  @IsOptional()
  posterUrl?: string;
}
