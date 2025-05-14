import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, ManyToOne, JoinTable, ManyToMany, OneToOne, JoinColumn } from 'typeorm';


import { MealTime } from 'src/plats/enums/meal-time.enum';
import { ReservationTime } from './reservation-time.entity';
import { ReservationStatus } from '../enums/reservation.enums';
import { User } from 'src/user/entities/user.entity';
import { TableRestaurant } from 'src/tables/entities/table.entity';
import { Plat } from 'src/plats/entities/plat.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Exclude } from 'class-transformer';



@Entity()
export class ReservationTable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: false })
  isCancelled: boolean;
  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.ACTIVE,
  })
  status: ReservationStatus;
  @Exclude()
  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true, eager: true })
  user: User;




  @ManyToOne(() => TableRestaurant, { onDelete: 'SET NULL', eager: true, nullable: true })
  table?: TableRestaurant;

  @ManyToMany(() => Plat, { eager: true })
  @JoinTable()
  plats: Plat[];


  @Column({ default: 0 })
  reportCount: number;

  @Column({ default: false })
  confirmed: boolean;

  @Column({ default: false })
  confirmedByCustomer: boolean;

  @Column({ type: 'text', nullable: true })
  qrCode: string;


  @OneToOne(() => ReservationTime, { eager: true, nullable: true })
  @JoinColumn()
  reservationTime?: ReservationTime;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
