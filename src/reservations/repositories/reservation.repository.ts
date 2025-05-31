import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReservationTable } from '../entities/reservation.entity';

@Injectable()
export class ReservationRepository extends Repository<ReservationTable> {
  constructor(private readonly dataSource: DataSource) {
    super(ReservationTable, dataSource.createEntityManager());
  }
}
