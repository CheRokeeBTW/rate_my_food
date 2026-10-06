import { IsString, Min, IsUrl, Max, MaxLength, IsEmail, MinLength } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(3)
    @MaxLength(30)
    readonly username!: string;


    @IsString()
    @MinLength(8)
    @MaxLength(100)
    readonly password!: string;
}
