import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { CreateRestaurantDto } from './create-restaurant.dto';
import { Type } from 'class-transformer';
import { RestaurantBlocDto } from './create-restaurant-bloc.dto';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {


    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => RestaurantBlocDto)
    @ApiProperty({ type: [RestaurantBlocDto], required: false })
    restaurantBlocs?: RestaurantBlocDto[];

}

