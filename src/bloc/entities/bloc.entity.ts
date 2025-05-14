import { BlocStatus } from "src/bloc/enums/status.enum";
import { IBloc } from "src/bloc/interfaces/bloc.interface";
import { RestaurantBloc } from "src/restaurants/entities/Restaurant-Bloc.entity";

import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Bloc implements IBloc {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;



  @OneToMany(() => RestaurantBloc, (restaurantBloc) => restaurantBloc.bloc)
  restaurantBlocs: RestaurantBloc[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
