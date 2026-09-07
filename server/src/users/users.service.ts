import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

    constructor(
        private readonly prisma: PrismaService,
    ) {}

    getUserById(id: string) {
        return this.prisma.user.findUnique({
            where: {
                id,
            },
        })
    }

    getUserByEmail(email: string) {
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

   async getProfile(id: string){
        const user = await this.prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                id:true,
                username: true,
                createdAt: true,
                posts: {
                    select: {
                        id: true,
                        title: true,
                        imageUrl: true,
                        createdAt: true,
                        ratings: {
                            select: {
                                value: true,
                            },
                        }  
                    }
                }
            }
        });

        if(!user){
            throw new NotFoundException('User not found');
        }

        const posts = user.posts.map(post => {
            const { ratings, ...postData } = post;

            if(post.ratings.length === 0){
                return {
                    ...postData,
                    averageRating: null,
                };
            }

            const sum = post.ratings.reduce((acc, rating) => acc + rating.value, 0);
            const average = sum / post.ratings.length;

            return {
                ...postData,
                averageRating: average,
            };
        });

        return {
            ...user,
            posts,
        };
    }

    async updateName(id: string, updateUserDto: UpdateUserDto){
        const { newUsername } = updateUserDto;

        const existingUser = await this.prisma.user.findUnique({
            where: {
                username: newUsername,
            },
        });

        if(existingUser && existingUser.id !== id){
            throw new ConflictException('Username is already taken');
        }

        const user = await this.prisma.user.update({
            where: {
                id,
            },
            data: {
                username: newUsername,
            },
        });

        return user
    }
}
