import { Controller, UseGuards, Post, Param, Req, UnauthorizedException, Query, Get, Delete } from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import type { Request } from 'express';

@Controller('follow')
export class FollowController {

    constructor(
        private readonly FollowService: FollowService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post(':followingId')
    followUser(
        @Param('followingId') followingId: string,
        @Req() req: Request,
    ){
        const followerId = req.user?.sub;

        if(!followerId){
            throw new UnauthorizedException('User not found')
        }

        return this.FollowService.followUser(followerId, followingId)
    };

    @UseGuards(JwtAuthGuard)
    @Get()
    getFollowers(
        @Query('cursor') cursor: string | undefined,
        @Req() req: Request,
    ) {
        const userId = req.user?.sub;

        if(!userId){
            throw new UnauthorizedException('User not found')
        }

        return this.FollowService.showFollowers(userId, cursor)
    };

    @UseGuards(JwtAuthGuard)
    @Delete(':followingId')
    unfollowUser(
        @Param('followingId') followingId: string,
        @Req() req: Request,
    ){
        const followerId = req.user?.sub

        if(!followerId){
            throw new UnauthorizedException('User not found')
        }

        return this.FollowService.unfollowUser(followerId, followingId)
    };
}
