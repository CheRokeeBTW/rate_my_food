import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  newUsername!: string;
}