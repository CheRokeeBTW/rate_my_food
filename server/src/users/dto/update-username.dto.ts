import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateUsernameDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  readonly newUsername!: string;
}