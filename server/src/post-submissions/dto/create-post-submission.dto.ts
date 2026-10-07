import { IsString, Min, IsUrl, Max, MaxLength, IsArray, ArrayMaxSize } from "class-validator";

export class CreatePostSubmissionDto {

    @IsString()
    @MaxLength(70)
    readonly title!: string;

    @IsUrl()
    readonly imageUrl!: string;

    @IsArray()
    @IsString({ each: true })
    @MaxLength(15, { each: true })
    @ArrayMaxSize(10, { message: 'The maximum amount of tags is 10' })
    readonly tags!: string[];

    @IsString()
    readonly publicId!: string;
}