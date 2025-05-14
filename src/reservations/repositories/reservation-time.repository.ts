import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReservationTime } from '../entities/reservation-time.entity';


@Injectable()
export class ReservationTimeRepository extends Repository<ReservationTime > {
  constructor(private readonly dataSource: DataSource) {
    super(ReservationTime , dataSource.createEntityManager());
  }
}
