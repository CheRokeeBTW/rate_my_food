import { IsString, Min, IsUrl, Max, MaxLength } from "class-validator";

export class CreatePostDto {

    @IsString()
    @MaxLength(70)
    readonly title!: string;

    @IsUrl()
    readonly imageUrl!: string;
}
