import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { Plat } from '../../plats/entities/plat.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Exclude } from 'class-transformer';
import { RestaurantImage } from 'src/image/image.entity';



@Entity()
export class MenuRestaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'date', nullable: false })
  datecreation: string;


  @OneToMany(() => Plat, (plat) => plat.menu, {
    cascade: true,
  })
  plats: Plat[];


  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menuRestaurant)
  @Exclude()
  restaurant: Restaurant




}
