import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class RatingHelper {

      constructor(
          private readonly prisma: PrismaService
      ) {}

    async checkRating(postId: string, userId: string){
        const rating = await this.prisma.rating.findUnique({
            where:{
                userId_postId: {
                    userId,
                    postId,
                },
            }
        })

        if(!rating){
            throw new NotFoundException('Rating not found')
        }

         return rating;
    }
}