import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RestaurantBloc } from '../entities/Restaurant-Bloc.entity';

@Injectable()
export class RestaurantBlocRepository extends Repository<RestaurantBloc> {
    constructor(private readonly dataSource: DataSource) {
        super(RestaurantBloc, dataSource.createEntityManager());
    }
}
