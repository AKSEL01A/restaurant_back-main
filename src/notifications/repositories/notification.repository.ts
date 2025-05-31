import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class NotificationRepository extends Repository<Notification> {
    constructor(private readonly dataSource: DataSource) {
        super(Notification, dataSource.createEntityManager());
    }
}
