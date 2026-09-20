import { IsString, Min, IsUrl, Max, MaxLength } from "class-validator";

export class CreatePostSubmissionDto {

    @IsString()
    @MaxLength(70)
    title!: string;

    @IsUrl()
    imageUrl!: string;

    @IsString()
    publicId!: string;
}