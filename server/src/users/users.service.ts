import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UpdateAvatarDto } from './dto/update-avarat.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinary: CloudinaryService,
    ) {}
    
    private readonly logger = new Logger(UsersService.name);
    
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
                avatarUrl: true,
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
            const ratingCount = ratings.length;

            if(post.ratings.length === 0){
                return {
                    ...postData,
                    averageRating: null,
                    ratingCount: 0,
                };
            }

            const sum = post.ratings.reduce((acc, rating) => acc + rating.value, 0);
            const average = sum / post.ratings.length;

            return {
                ...postData,
                averageRating: average,
                ratingCount,
            };
        });

        return {
            ...user,
            posts,
        };
    }

    async updateUsername(id: string, updateUserDto: UpdateUsernameDto){
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

    async updateAvatar(id: string, updateAvatarDto: UpdateAvatarDto){
        const { newAvatar, publicId } = updateAvatarDto;

        const oldAvatar = await this.prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                avatarPublicId: true
            },
        });

        if(!oldAvatar){
            throw new NotFoundException('User not found')
        };

        const user = await this.prisma.user.update({
            where: {
                id,
            },
            data: {
                avatarUrl: newAvatar,
                avatarPublicId: publicId,
            },
            select: {
                id: true,
                username: true,
                avatarUrl: true,
            }
        });

        if(oldAvatar?.avatarPublicId && oldAvatar.avatarPublicId !== publicId){
            await this.cloudinary.deleteImage(oldAvatar.avatarPublicId)
        };

        return user
    };

    async deleteAvatar(id: string){
        const user = await this.prisma.user.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                username: true,
                avatarPublicId: true
            }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        };

        if(!user.avatarPublicId){
            return {
                id: user.id,
                username: user.username,
                avatarUrl: null,
            };
        };
        
        const removeAvatar = await this.prisma.user.update({
            where: {
                id
            },
            data: {
                avatarUrl: null,
                avatarPublicId: null,
            },
            select: {
                id: true,
                username: true,
                avatarUrl: true,
            }
        });

        try{
            const result = await this.cloudinary.deleteImage(user.avatarPublicId);

            if(result.result !== 'ok' && result.result !== 'not found'){
                this.logger.warn(
                    `Could not delete Cloudinary avatar: ${user.avatarPublicId}`,
                );
            }
        } catch(error) {
            this.logger.error(
                `Failed to delete Cloudinary avatar: ${user.avatarPublicId}`,
                error instanceof Error ? error.stack : String(error),
            );
        };

         return removeAvatar
    }
}
