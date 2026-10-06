import { IsString, IsUrl, MaxLength, IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(70)
  readonly title?: string;

  @IsOptional()
  @IsUrl()
  readonly imageUrl?: string;
}