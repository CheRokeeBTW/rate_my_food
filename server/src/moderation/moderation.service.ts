import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ModerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  getPendingSubmissions() {
    return this.prisma.postSubmission.findMany({
      where: {
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  }

  approveSubmission(id:string){
    return this.prisma.$transaction(async (tx) => {
      const submission = await tx.postSubmission.findUnique({
        where: {
          id,
        },
      });

      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      if (submission.status !== 'PENDING') {
        throw new BadRequestException('Submission has already been reviewed');
      }

      const post = await tx.post.create({
        data: {
          title: submission.title,
          imageUrl: submission.imageUrl,
          authorId: submission.authorId,
        },
      });

      await tx.postSubmission.update({
        where: {
          id: submission.id,
        },
        data: {
          status: 'APPROVED',
        },
      });

      return post;
    });
  }

  rejectSubmission(id:string){
    return this.prisma.$transaction(async (tx) => {
      const submission = await tx.postSubmission.findUnique({
        where: {
          id,
        },
      });

      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      if (submission.status !== 'PENDING') {
        throw new BadRequestException('Submission has already been reviewed');
      }

       await this.cloudinary.deleteImage(submission.publicId);

      return tx.postSubmission.update({
        where: {
          id: submission.id,
        },
        data: {
          status: 'REJECTED',
        },
      });
    });
  }
}