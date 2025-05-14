import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsUUID, IsNotEmpty, IsDateString, IsOptional, IsString, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Column } from 'typeorm';
import { CreateReservationTimeDto } from './create-reservation-time.dto';

export class CreateReservationDto {


  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  tableId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty()
  @IsString()
  phone: string;


  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  platIds: string[];

  @IsOptional()
  @IsBoolean()
  isReported?: boolean;



  @Expose()
  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateReservationTimeDto)
  reservationTime: CreateReservationTimeDto;

}
