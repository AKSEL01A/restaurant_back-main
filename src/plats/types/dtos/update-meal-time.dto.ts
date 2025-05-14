import { PartialType } from '@nestjs/mapped-types';
import { CreateMealTimeDto } from './create-meal-time.dto';

export class UpdateMealTimeDto extends PartialType(CreateMealTimeDto) { }
