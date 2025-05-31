import { Entity, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ReservationTable } from './reservation.entity';
import { Plat } from 'src/plats/entities/plat.entity';

@Entity('reservation_table_plats_plat')
export class ReservationPlat {
  @PrimaryColumn('uuid')
  reservationTableId: string;

  @PrimaryColumn('uuid')
  platId: string;

  @ManyToOne(() => ReservationTable, (reservation) => reservation.plats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservationTableId' })
  reservation: ReservationTable;

  @ManyToOne(() => Plat, (plat) => plat.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'platId' })
  plat: Plat;


  @OneToMany(() => ReservationPlat, (rp) => rp.plat)
reservations: ReservationPlat[];
}
