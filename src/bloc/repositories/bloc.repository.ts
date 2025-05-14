import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Bloc } from '../entities/bloc.entity';
@Injectable()
export class BlocRepository extends Repository<Bloc> {
  constructor(private readonly dataSource: DataSource) {
    super(Bloc, dataSource.createEntityManager());
  }
}
