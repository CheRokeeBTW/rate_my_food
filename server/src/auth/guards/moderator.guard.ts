import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ModeratorGuard implements CanActivate {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const userId = request.user?.sub

    if (!userId) {
      throw new ForbiddenException('Access denied');
    }

    const user = await this.prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            role: true,
        },
    });

    if(!user){
      throw new NotFoundException('User not found')
    }

    if(user.role === 'USER'){
      throw new ForbiddenException('Moderator access required')
    }

    return true
  }
}