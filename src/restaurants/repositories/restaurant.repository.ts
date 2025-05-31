import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';

@Injectable()
export class RestaurantRepository extends Repository<Restaurant> {
  constructor(private readonly dataSource: DataSource) {
    super(Restaurant, dataSource.createEntityManager());
  }
}
