import { Exclude } from 'class-transformer';
import { MenuRestaurant } from 'src/menu/entities/menu.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class RestaurantImage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    url: string;
    @Exclude()
    @ManyToOne(() => Restaurant, restaurant => restaurant.images)
    restaurant: Restaurant;


}
