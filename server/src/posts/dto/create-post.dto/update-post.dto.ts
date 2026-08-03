import { IsString, IsUrl, MaxLength, IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(70)
  title?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}