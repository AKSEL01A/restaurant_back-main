import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { RestaurantStatus } from '../enums/status.enum';
import { IRestaurant } from '../interfaces/restaurant.interface';
import { RestaurantImage } from 'src/image/image.entity';
import { RestaurantBloc } from './Restaurant-Bloc.entity';
import { MenuRestaurant } from 'src/menu/entities/menu.entity';
import { Exclude } from 'class-transformer';
import { MealTimeEntity } from 'src/plats/entities/meal-time.entity';
@Entity()
export class Restaurant implements IRestaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  speciality: string;

  @Column()
  phone: string;

  @Column({ nullable: false })
  hourly: string;

  @Column({ type: 'enum', enum: RestaurantStatus })
  status: RestaurantStatus;


  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  categorie: string


  @Column({ nullable: true })
  description: string

  @OneToMany(() => RestaurantImage, image => image.restaurant, {
    cascade: true,
    eager: true
  })
  images: RestaurantImage[];

  @OneToMany(() => RestaurantBloc, (restaurantBloc) => restaurantBloc.restaurant, {
    cascade: true,

  })
  restaurantBlocs: RestaurantBloc[];

  @OneToMany(() => MenuRestaurant, (menuRestaurant) => menuRestaurant.restaurant)
  @Exclude()
  menuRestaurant: MenuRestaurant


  @OneToMany(() => MealTimeEntity, mealTime => mealTime.restaurant)
  mealTimes: MealTimeEntity[];


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
