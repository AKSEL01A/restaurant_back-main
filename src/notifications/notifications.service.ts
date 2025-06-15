import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../notifications/entities/notification.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    async getNotificationsByUser(userId: string) {
        return this.notificationRepository.find({
            where: {
                user: { id: userId },
            },
            order: {
                createdAt: 'DESC',
            },
        });


    }

    async markAllAsRead(userId: number) {
  return this.notificationRepository
    .createQueryBuilder()
    .update()
    .set({ isRead: true })
    .where("userId = :userId AND isRead = false", { userId })
    .execute();
}



}
