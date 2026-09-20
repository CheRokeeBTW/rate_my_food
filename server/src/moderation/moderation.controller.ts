import { Controller, Get, UseGuards } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';

@Controller('moderation')
export class ModerationController {

    constructor(
        private readonly ModerationService: ModerationService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    getPendingSubmissions(){
        return this.ModerationService.getPendingSubmissions();
    } 
}
