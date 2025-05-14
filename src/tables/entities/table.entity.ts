import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { TableStatus } from '../enums/status.enums';
import { RestaurantBloc } from 'src/restaurants/entities/Restaurant-Bloc.entity';
import { ViewType } from '../enums/view.enums';
import { ReservationTable } from 'src/reservations/entities/reservation.entity';
import { Plat } from 'src/plats/entities/plat.entity';

@Entity()
export class TableRestaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string

  @ApiProperty()
  @Column()
  numChaises: number;

  @ApiProperty({ enum: TableStatus })
  @Column()
  status: TableStatus;

  @Column({ type: 'enum', enum: ViewType, nullable: true })
  view: ViewType;


  @Column({ nullable: true })
  row: number;

  @Column({ nullable: true })
  col: number;

  @Column({ default: 'circle' })
  shape: string;

  @ManyToOne(() => RestaurantBloc, (rb) => rb.tables, { eager: true, onDelete: 'CASCADE' })
  restaurantBloc: RestaurantBloc;

  @OneToMany(() => ReservationTable, (reservation) => reservation.table)
  reservations: ReservationTable[];



}
