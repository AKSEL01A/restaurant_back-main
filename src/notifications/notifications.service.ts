import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../notifications/entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

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

  async createAndSendNotification(userId: string, message: string) {
    const notification = await this.notificationRepository.save({
      message,
      user: { id: userId },
    });

    this.notificationsGateway.sendNotificationToUser(userId, notification);
    return notification;
  }
}
