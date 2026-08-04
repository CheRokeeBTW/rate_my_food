import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { PrismaService } from 'prisma/prisma.service';
import { error } from 'console';

@Injectable()
export class RatingsService {

    constructor(
        private readonly prisma: PrismaService
    ) {}

    async createRating(dto: CreateRatingDto, userId: string){
        const post = await this.prisma.post.findUnique({
            where: {
                id: dto.postId
            }
        }) 

        if(!post){
            throw new NotFoundException('post not found');
        }

        const isPostRated = await this.prisma.rating.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId: dto.postId,
                },
            }
        })

        if(isPostRated){
            throw new ConflictException('Post already rated')
        }

        return dto.value
    }
}
