import { Controller, Get, Param, UseGuards, Post } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guards';
import { ModeratorGuard } from 'src/auth/guards/moderator.guard';

@Controller('moderation')
export class ModerationController {

    constructor(
        private readonly ModerationService: ModerationService,
    ) {}

    @UseGuards(JwtAuthGuard, ModeratorGuard)
    @Get()
    getPendingSubmissions(){
        return this.ModerationService.getPendingSubmissions();
    } 

    @UseGuards(JwtAuthGuard, ModeratorGuard)
    @Post('submissions/:id/approve')
    approveSubmission(@Param('id') id:string) {
        return this.ModerationService.approveSubmission(id);
    }

    @UseGuards(JwtAuthGuard, ModeratorGuard)
    @Post('submissions/:id/reject')
    rejectSubmission(@Param('id') id:string) {
        return this.ModerationService.rejectSubmission(id);
    }
}
