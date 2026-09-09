import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        const authHeader = request.headers.authorization;

        if (!authHeader) {
            return true;
        }

        const [type, token] = authHeader.split(' ');

        if (type !== 'Bearer' || !token) {
            return true;
        }

        try {
            const payload = this.jwtService.verify(token);
            request.user = payload;
        } catch {
            throw new UnauthorizedException('Invalid or expired access token');
        }

        return true;
    }
}