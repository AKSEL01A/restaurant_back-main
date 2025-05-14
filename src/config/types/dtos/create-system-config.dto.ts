import { IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSystemConfigDto {
  @ApiProperty({ default: 3 })
  @IsInt()
  maxNoShowAllowed: number;

  @ApiProperty({ default: 120 }) // بالدقائق
  @IsInt()
  maxCancelTimeBeforeReservation: number;

  @ApiProperty({ default: 180 }) // بالدقائق
  @IsInt()
  maxReportTimeBeforeReservation: number;

  @ApiProperty({ default: 2 })
  @IsInt()
  maxReportAllowed: number;

  
}
