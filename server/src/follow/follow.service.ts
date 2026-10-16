import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class FollowService {

    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async followUser(
        followerId: string, 
        followingId: string
    ){
        const followingUser = await this.prisma.user.findUnique({
            where: {
                id: followingId,
            },
        });

        const followerUser = await this.prisma.user.findUnique({
            where: {
                id: followerId,
            },
        });

        if(!followingUser || !followerUser){
            throw new NotFoundException('User not found');
        };

        if (followerId === followingId) {
            throw new BadRequestException('You cannot follow yourself');
        };

        return this.prisma.follow.upsert({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId,
                    }
                },
                create: {
                    followerId,
                    followingId,
                },
                update: {},
        })
    }
    async unfollowUser(
        followerId: string, 
        followingId: string
    ){
        const followingUser = await this.prisma.user.findUnique({
            where: {
                id: followingId,
            },
        });

        const followerUser = await this.prisma.user.findUnique({
            where: {
                id: followerId,
            },
        });

        if(!followingUser || !followerUser){
            throw new NotFoundException('User not found');
        };

        if (followerId === followingId) {
            throw new BadRequestException('You cannot unfollow yourself');
        };

        const checkFollow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                }
            }
        })

        if(!checkFollow){
            throw new NotFoundException('You do not follow this user') 
        }

        return this.prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                }
            }
        })
    }

    async showFollowers(
        id: string,
        cursor?: string,
    ){
        const take = 20;

        const user = await this.prisma.user.findUnique({
            where: {
                id
            },
            select: {
                id: true
            },
        })

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if(cursor){
            const cursorFollow = await this.prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: cursor,
                        followingId: id,
                    },
                },
            });

            if (!cursorFollow) {
                throw new BadRequestException('Invalid pagination cursor');
            }
        }

        const follows = await this.prisma.follow.findMany({
            where: {
                followingId: id
            },
            take: take + 1,

            orderBy: [
                {
                    createdAt: "asc"
                },
                {
                    followerId: "asc"
                },
            ],
            ...(cursor ? {
                cursor: {
                    followerId_followingId: {
                        followerId: cursor,
                        followingId: id
                    },
                },
                skip: 1
            } : {}),
            select: {
                followerId: true,
                follower: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true
                    }
                }
            }
        });

        const hasMore = follows.length > take;

        const followList = hasMore
         ?  follows.slice(0, take) 
         : follows

         const items = followList.map(follow => follow.follower);

         return {
            items,
            nextCursor: hasMore
            ? items[items.length - 1].id
            : null
         }
    }
}
