import { IsInt, Max, Min, IsUUID } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @Min(1)
  @Max(10)
  value!: number;

  @IsUUID()
  postId!: string;
}