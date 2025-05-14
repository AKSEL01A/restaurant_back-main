import { Module } from '@nestjs/common';
import { ReservationController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationTable } from './entities/reservation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { TableRestaurant } from 'src/tables/entities/table.entity';
import { User } from 'src/user/entities/user.entity';
import { ReservationRepository } from './repositories/reservation.repository';
import { Plat } from 'src/plats/entities/plat.entity';
import { MenuRestaurant } from 'src/menu/entities/menu.entity';

import { ReservationTime } from './entities/reservation-time.entity';
import { ReservationTimeRepository } from './repositories/reservation-time.repository';
import { RestaurantModule } from 'src/restaurants/restaurant.module';
import { SystemConfig } from 'src/config/entities/config.entity';
import { SystemConfigRepository } from 'src/config/repositories/system-config.repository';
import { SystemConfigService } from 'src/config/config.service';
import { MealTimeEntity } from 'src/plats/entities/meal-time.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReservationTable, Restaurant, TableRestaurant, User, MenuRestaurant, Plat, ReservationTime, SystemConfig, MealTimeEntity]), RestaurantModule,],
  controllers: [ReservationController],
  providers: [ReservationsService, ReservationRepository, ReservationTimeRepository, SystemConfigRepository, SystemConfigService],
  exports: [ReservationsService, ReservationRepository, ReservationTimeRepository, SystemConfigRepository, SystemConfigService],
})
export class ReservationsModule { }
