import { Controller, Get, Param, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import type { Request } from 'express';

@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService: UsersService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get('/me')
    getProfile(@Req() req: Request) {
        const userId = req.user!.sub;

        return this.usersService.getProfile(userId);
    }

    @Get(':id')
    getUserId(@Param('id') id: string) {
        return this.usersService.getUserById(id);
    }

    // @Post()
    // createuser(@Body() dto: CreateUserDto) {
    //     return this.usersService.createUser(dto);
    // }
}
