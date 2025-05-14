import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RestaurantImage } from '../image.entity';

@Injectable()
export class ImageRepository extends Repository<RestaurantImage> {
    constructor(private readonly dataSource: DataSource) {
        super(RestaurantImage, dataSource.createEntityManager());
    }
}
