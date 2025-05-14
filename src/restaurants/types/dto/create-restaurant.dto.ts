import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { RestaurantStatus } from '../../enums/status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { RestaurantBlocDto } from './create-restaurant-bloc.dto';
import { ImageDto } from 'src/image/types/dtos/image.dto';

export class CreateRestaurantDto {
  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;

  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  speciality: string;

  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phone: string;


  @Expose()
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hourly: string;

  @Expose()
  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  isActive?: boolean;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageDto)
  @ApiProperty({ type: [ImageDto], required: false })
  images?: ImageDto[];

  @Expose()
  @ApiProperty()
  @IsString()
  categorie: string;

  @Expose()
  @ApiProperty()
  @IsString()
  description: string;
  @Expose()
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RestaurantBlocDto)
  restaurantBlocs: RestaurantBlocDto[];
}
