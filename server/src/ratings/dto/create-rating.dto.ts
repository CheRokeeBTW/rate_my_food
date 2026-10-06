import { IsInt, Max, Min, IsUUID } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  @Min(1)
  @Max(10)
  readonly value!: number;

  @IsUUID()
  readonly postId!: string;
}