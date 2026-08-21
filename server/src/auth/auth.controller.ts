import { Controller, Post, Body, Res, Req, UnauthorizedException, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register.dto';
import type { Response, Request } from 'express';
import { NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guards';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) {}

    @Post('register')
    registerUser(@Body() dto: RegisterAuthDto) {
        return this.authService.registerUser(dto);
    }

    @Post('login')
    async login(
        @Body() {email, password}: {email: string, password: string},
        @Res({ passthrough: true }) response: Response,
    ) {
        const { accessToken, refreshToken } = await this.authService.loginUser({
            email,
            password
        });

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
        };

        response.cookie('refresh_token', refreshToken, {
            ...cookieOptions,
            maxAge: 1000 * 60 * 60 * 24 * 7, 
        });

        return {
            accessToken,
        };
    }

    @Post('refresh')
    async refresh(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        const refreshToken = request.cookies.refresh_token;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found')
        }

        const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshAccessToken(refreshToken);

        response.cookie('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7,
            },
        );

        return { accessToken };
    }

    @Post('logout')
    async logout(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        const refreshToken = request.cookies.refresh_token;

        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }

        response.clearCookie('refresh_token');

        return {
            message: 'Logged out successfully',
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() request: Request) {
        const userId = request.user?.sub;

        if(!userId){
            throw new UnauthorizedException('User not found')
        }

        return this.authService.getMe(userId);
    }
    
}
