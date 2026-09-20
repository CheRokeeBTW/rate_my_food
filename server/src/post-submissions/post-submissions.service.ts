import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePostSubmissionDto } from './dto/create-post-submission.dto';

@Injectable()
export class PostSubmissionsService {

    constructor(
        private readonly prisma: PrismaService,
    ) {}
    
    async createSubmission(dto: CreatePostSubmissionDto, userId: string){
        return this.prisma.postSubmission.create({
            data: {
                title: dto.title,
                imageUrl: dto.imageUrl,
                publicId: dto.publicId,
                authorId: userId,
            },
        });
    }
}
