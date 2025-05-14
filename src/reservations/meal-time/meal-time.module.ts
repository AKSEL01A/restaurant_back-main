import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MealTimeService } from './meal-time.service';
import { MealTimeController } from './meal-time.controller';
import { MealTimeEntity } from 'src/plats/entities/meal-time.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MealTimeEntity, Restaurant])],
    controllers: [MealTimeController],
    providers: [MealTimeService],
    exports: [MealTimeService],
})
export class MealTimeModule { }
