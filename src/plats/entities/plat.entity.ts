import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { MealTime } from '../enums/meal-time.enum';
import { MenuRestaurant } from 'src/menu/entities/menu.entity';
import { ReservationTable } from 'src/reservations/entities/reservation.entity';
import { MealTimeEntity } from './meal-time.entity';
import { TableRestaurant } from 'src/tables/entities/table.entity';


@Entity()
export class Plat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  price: number;

  @Column({ type: 'text', nullable: true })
  image: string;


  @Column({ nullable: true })
  description: string



  @ManyToOne(() => MenuRestaurant, (menu) => menu.plats, {
    onDelete: 'CASCADE',
    nullable: false
  })
  menu: MenuRestaurant;

  @ManyToMany(() => ReservationTable, (reservation) => reservation.plats)
  reservations: ReservationTable[];

  @ManyToMany(() => MealTimeEntity, { eager: true })
  @JoinTable()
  mealTimes: MealTimeEntity[];


}
