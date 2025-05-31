import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationService: NotificationsService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getNotifications(@Req() req) {
        const userId = req.user.userId;
        return this.notificationService.getNotificationsByUser(userId);
    }
}
