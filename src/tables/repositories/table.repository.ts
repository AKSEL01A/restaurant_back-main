import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TableRestaurant } from '../entities/table.entity';

@Injectable()
export class TableRepository extends Repository<TableRestaurant> {
  constructor(private readonly dataSource: DataSource) {
    super(TableRestaurant, dataSource.createEntityManager());
  }
}
