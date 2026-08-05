import { Controller, Post, Req, Body, UnauthorizedException, UseGuards, Patch, Param, Delete, Get } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import type { Request } from 'express';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';

@Controller('ratings')
export class RatingsController {

    constructor(
        private readonly ratingsService: RatingsService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createRating(
        @Body() dto: CreateRatingDto,
        @Req() request: Request,
    ) {
        const userId = request.user?.sub;

        if(!userId){
            throw new UnauthorizedException('User not found')
        }
        
        return this.ratingsService.createRating(dto, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('post/:postId')
    async updateRating(
        @Param('postId') postId: string,
        @Body() dto: UpdateRatingDto,
        @Req() request: Request,
    ) {
        const userId = request.user?.sub;

        if(!userId){
            throw new UnauthorizedException('User not found')
        }

        return this.ratingsService.updateRating(
            postId,
            userId,
            dto,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete('post/:postId')
    async deleteRating(
        @Param('postId') postId: string,
        @Req() request: Request,
    ) {
        const userId = request.user?.sub;

        if(!userId){
            throw new UnauthorizedException('User not found')
        }

        return this.ratingsService.deleteRating(
            postId,
            userId,
        );
    }

    @Get('post/:postId/stats')
    async getRatingStats(
        @Param('postId') postId: string,
    ) {
        return this.ratingsService.getRatings(postId);
    }
}
