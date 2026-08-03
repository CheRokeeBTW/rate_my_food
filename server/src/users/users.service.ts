import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {

    constructor(
        private readonly prisma: PrismaService,
    ) {}

    getUserId(id: string) {
        return this.prisma.user.findUnique({
            where: {
                id,
            },
        })
    }

    getUserEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {
                email,
            },
        })
    }

    createUser(dto: CreateUserDto) {
        return this.prisma.user.create({
        data: {
            email: dto.email,
            username: dto.username,
            password: dto.password,
        },
        });
    }
}
