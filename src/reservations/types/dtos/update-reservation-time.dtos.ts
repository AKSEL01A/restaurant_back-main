import { PartialType } from '@nestjs/swagger';

import { CreateReservationTimeDto } from './create-reservation-time.dto';

export class UpdateReservationTimeDto extends PartialType(CreateReservationTimeDto) {}
