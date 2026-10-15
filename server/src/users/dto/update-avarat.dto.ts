import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class UpdateAvatarDto {
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    readonly newAvatar!: string;
}