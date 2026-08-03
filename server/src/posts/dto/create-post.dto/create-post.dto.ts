import { IsString, Min, IsUrl, Max, MaxLength } from "class-validator";
import { PostsService } from "src/posts/posts.service";

export class CreatePostDto {

    @IsString()
    @MaxLength(70)
    title!: string;

    @IsUrl()
    imageUrl!: string;
}
