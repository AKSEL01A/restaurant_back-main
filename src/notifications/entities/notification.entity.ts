import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ReservationTable } from "../../reservations/entities/reservation.entity";

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    message: string;

    @Column({ default: false })
    isRead: boolean;

    @ManyToOne(() => User, { nullable: true, eager: true })
    user: User;

    @ManyToOne(() => ReservationTable, { eager: true })
    reservation: ReservationTable;

    @CreateDateColumn()
    createdAt: Date;
}
