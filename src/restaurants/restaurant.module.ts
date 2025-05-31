import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantRepository } from './repositories/restaurant.repository';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { AuthModule } from 'src/auth/auth.module';
import { RestaurantBloc } from './entities/Restaurant-Bloc.entity';
import { Bloc } from 'src/bloc/entities/bloc.entity';
import { RestaurantImage } from 'src/image/image.entity';
import { MealTimeModule } from 'src/reservations/meal-time/meal-time.module';
import { TablesService } from 'src/tables/tables.service';
import { TablesModule } from 'src/tables/tables.module';
import { TableRepository } from 'src/tables/repositories/table.repository';
import { TableRestaurant } from 'src/tables/entities/table.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, Bloc, RestaurantBloc, RestaurantImage, TableRestaurant]),
    forwardRef(() => AuthModule),
    MealTimeModule,

  ],
  controllers: [RestaurantController],
  providers: [RestaurantService, RestaurantRepository],
  exports: [RestaurantService, RestaurantRepository, TypeOrmModule],
})
export class RestaurantModule { }
