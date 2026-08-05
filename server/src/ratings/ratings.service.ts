import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { PrismaService } from 'prisma/prisma.service';
import { RatingHelper } from './helper/helper-functions';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly ratingHelper: RatingHelper
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

        const rating = await this.prisma.rating.create({
            data: {
                value: dto.value,
                userId,
                postId: dto.postId
            }
        })

        return rating
    }

    async getRatings(postId: string){
        const post = await this.prisma.post.findUnique({
            where: {
                id: postId,
            },
        });

        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const stats = await this.prisma.rating.aggregate({
            where: {
                postId,
            },
            _avg: {
                value: true,
            },
            _count: {
                value: true,
            },
        });


        return {
            average: stats._avg.value ?? 0,
            count: stats._count.value,
        };
    }

    async updateRating(postId: string, userId: string, dto: UpdateRatingDto){
            const rating = await this.ratingHelper.checkRating(
                postId,
                userId,
            );

        if(!rating){
            throw new NotFoundException('Rating not found')
        }

        const newRating = await this.prisma.rating.update({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
            data: {
                value: dto.value
            }
        })

        return newRating
    }

    async deleteRating(postId: string, userId: string){
            const rating = await this.ratingHelper.checkRating(
                postId,
                userId,
            );

        if(!rating){
            throw new ForbiddenException('Rating not found')
        }

        return await this.prisma.rating.delete({
             where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        })
    }
}
