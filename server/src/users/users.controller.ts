import { Controller, Get, Param, Post, Body, UseGuards, Req, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import type { Request } from 'express';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { UpdateAvatarDto } from './dto/update-avarat.dto';

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

    @UseGuards(JwtAuthGuard)
    @Patch('/me/username')
    updateUsername(
        @Req() req: Request,
        @Body() updateUserDto: UpdateUsernameDto, 
    ){
        const userId = req.user!.sub;

        return this.usersService.updateUsername(userId, updateUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/me/avatar')
    updateAvatar(
        @Req() req: Request,
        @Body() UpdateAvatarDto: UpdateAvatarDto,
    ) {
        const userId = req.user!.sub;

        return this.usersService.updateAvatar(userId, UpdateAvatarDto);
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
