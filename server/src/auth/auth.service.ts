import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { RegisterAuthDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
    ) {}

    async registerUser(dto: RegisterAuthDto){
        const existingEmail = await this.usersService.getUserEmail(dto.email);

        if(!existingEmail){
            throw new ConflictException('Email already exists');
        }
        const hashedPassWord = await bcrypt.hash(dto.password, 10);

        const user = await this.usersService.createUser({
            email: dto.email,
            username: dto.username,
            password: hashedPassWord,
        });

        const { password, ...safeUser } = user;

        return safeUser
    }

    // loginUser(dto: )
}
