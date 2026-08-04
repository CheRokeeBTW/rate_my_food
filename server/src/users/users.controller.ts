import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService: UsersService,
    ) {}

    @Get(':id')
    getUserId(@Param('id') id: string) {
        return this.usersService.getUserById(id);
    }

    // @Post()
    // createuser(@Body() dto: CreateUserDto) {
    //     return this.usersService.createUser(dto);
    // }
}
