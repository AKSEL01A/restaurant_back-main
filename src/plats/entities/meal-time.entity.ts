import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne } from 'typeorm';
import { MealTime } from '../enums/meal-time.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Plat } from './plat.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@Entity()
export class MealTimeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MealTime })
  mealTime: MealTime;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;


  @ManyToOne(() => Restaurant, restaurant => restaurant.mealTimes, { onDelete: 'CASCADE' })
  restaurant: Restaurant;

  @ManyToMany(() => Plat, (plat) => plat.mealTimes)
  plats: Plat[];

}
