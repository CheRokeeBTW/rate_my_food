import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { RegisterAuthDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'crypto';
import { SessionsService } from './sessions/sessions.service';

@Injectable()
export class AuthService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly sessionService: SessionsService,
    ) {}

    async registerUser(dto: RegisterAuthDto){
        const existingEmail = await this.usersService.getUserByEmail(dto.email);

        if(existingEmail){
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

    async loginUser({
        email,
        password
    }) {
        const user = await this.usersService.getUserByEmail(email)

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user?.password); 

        if(!isMatch){
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { username: user.username, sub: user.id };

        const accessToken = this.jwtService.sign(payload);

        const refreshToken = randomBytes(64).toString('hex');

        await this.sessionService.createSession({
            refreshToken, 
            userId: user.id
        })

        return { accessToken, refreshToken }
    }

    async getMe(id: string){
        const user = await this.usersService.getUserById(id)

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const { password, ...safeUser } = user;

        return safeUser;
    }

    async refreshAccessToken(refreshToken: string){
        const session = await this.sessionService.findSession(refreshToken);

        if(session.revokedAt){
            throw new UnauthorizedException('Refresh token has been revoked')
        }

        if(session.expiresAt <= new Date()){
            throw new UnauthorizedException('Refresh token has expired')
        }

        await this.sessionService.revokeSession(session.id);

        const newRefreshToken = await this.sessionService.createSession({
            refreshToken,
            userId: session.userId,
        });

        const payload = {
            sub: session.userId,
        };

        const accessToken =
            this.jwtService.sign(payload);

        return {
            accessToken,
            refreshToken: newRefreshToken
        };
    }

    async logout(refreshToken: string) {
        await this.sessionService.revokeSession(refreshToken);
    }
}
