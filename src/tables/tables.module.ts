import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { TableRepository } from './repositories/table.repository';
import { TableRestaurant } from './entities/table.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

import { RestaurantBloc } from 'src/restaurants/entities/Restaurant-Bloc.entity';
import { ReservationTable } from 'src/reservations/entities/reservation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TableRestaurant, RestaurantBloc, ReservationTable]), AuthModule, UserModule],
  controllers: [TablesController],
  providers: [TablesService, TableRepository],
  exports: [TablesService, TableRepository],
})
export class TablesModule { }
