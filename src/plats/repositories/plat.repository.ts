import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Plat } from '../entities/plat.entity';


@Injectable()
export class platRepository extends Repository<Plat> {
  constructor(private readonly dataSource: DataSource) {
    super(Plat, dataSource.createEntityManager());
  }
}