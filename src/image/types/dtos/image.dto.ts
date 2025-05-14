import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class ImageDto {

    @Expose()
    @ApiProperty()
    @IsString()
    url: string;
}


