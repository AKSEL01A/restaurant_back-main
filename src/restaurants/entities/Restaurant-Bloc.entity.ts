import { Bloc } from "src/bloc/entities/bloc.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Restaurant } from "./restaurant.entity";
import { TableRestaurant } from "src/tables/entities/table.entity";
import { Exclude } from 'class-transformer';


@Entity('restaurant_bloc')
export class RestaurantBloc {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.restaurantBlocs, {
        eager: true,
    })
    @Exclude()
    restaurant: Restaurant;

    @ManyToOne(() => Bloc, (bloc) => bloc.restaurantBlocs, { eager: true })
    bloc: Bloc;

    @OneToMany(() => TableRestaurant, table => table.restaurantBloc, { cascade: true })
    tables: TableRestaurant[];

    @Column()
    maxTables: number;

    @Column({ nullable: true })
    maxChaises: number;

}