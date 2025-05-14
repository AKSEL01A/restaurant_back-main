import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MenuRestaurant } from '../entities/menu.entity';

@Injectable()
export class MenuRepository extends Repository<MenuRestaurant> {
  constructor(private readonly dataSource: DataSource) {
    super(MenuRestaurant, dataSource.createEntityManager());
  }
}