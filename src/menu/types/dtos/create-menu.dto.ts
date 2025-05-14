import { IsString, IsNotEmpty, IsArray, ValidateNested, IsDateString, IsOptional } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { CreatePlatDto } from 'src/plats/types/dtos/create-plat.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ImageDto } from 'src/image/types/dtos/image.dto';


export class CreateMenuDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  datecreation: string;

  @ApiProperty()
  @IsString()
  restaurantId: string;



  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlatDto)
  plats: CreatePlatDto[];




}
