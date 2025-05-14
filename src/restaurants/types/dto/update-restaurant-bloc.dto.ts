import { ApiProperty, PartialType } from '@nestjs/swagger';

import { RestaurantBlocDto } from './create-restaurant-bloc.dto';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class UpdateRestaurantBlocDto extends PartialType(RestaurantBlocDto) {
    @IsUUID()
    @IsNotEmpty()
    blocId: string;

    @IsNumber()
    @IsNotEmpty()
    maxTables: number;
}

