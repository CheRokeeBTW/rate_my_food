import { IsString, IsOptional, IsNotEmpty } from "class-validator";

export class PaginationDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    cursor?: string;
}