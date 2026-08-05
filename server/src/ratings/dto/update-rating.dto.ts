import { IsInt, Max, Min, IsUUID } from 'class-validator';

export class UpdateRatingDto {
  @IsInt()
  @Min(1)
  @Max(10)
  value!: number;
}