import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AppService } from './app.service';
import { AppController } from './app.controller';

import { AuthModule } from './auth/auth.module';
import { RestaurantModule } from './restaurants/restaurant.module';
import { UserModule } from './user/user.module';
import { TablesModule } from './tables/tables.module';
import { MenuModule } from './menu/menu.module';
import { PlatsModule } from './plats/plats.module';
import { ReservationsModule } from './reservations/reservations.module';
import { CustomConfigModule } from './config/config.module';
import { BlocModule } from './bloc/bloc.module';
import { MealTimeModule } from './reservations/meal-time/meal-time.module';
import { CustomerModule } from './customer/customer.module';

import { ModuleController } from './module/module.controller';
import { BlocController } from './bloc/bloc.controller';
import { MealTimeController } from './reservations/meal-time/meal-time.controller';
import { CustomerController } from './customer/customer.controller';

import { PlatsService } from './plats/plats.service';
import { BlocService } from './bloc/bloc.service';
import { MealTimeService } from './reservations/meal-time/meal-time.service';
import { CustomerService } from './customer/customer.service';

import { ReservationTable } from './reservations/entities/reservation.entity';
import { ReservationTime } from './reservations/entities/reservation-time.entity';
import { SystemConfig } from './config/entities/config.entity';
import { TableRestaurant } from './tables/entities/table.entity';
import { MenuRestaurant } from './menu/entities/menu.entity';
import { RoleUser } from './auth/entities/role.entity';
import { User } from './user/entities/user.entity';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Plat } from './plats/entities/plat.entity';
import { Bloc } from './bloc/entities/bloc.entity';
import { RestaurantImage } from './image/image.entity';
import { RestaurantBloc } from './restaurants/entities/Restaurant-Bloc.entity';
import { MealTimeEntity } from './plats/entities/meal-time.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { Notification } from './notifications/entities/notification.entity';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,
      autoLoadEntities: true,
      synchronize: true, // passe à false en prod
      ssl: {
        rejectUnauthorized: false,
      },
    }),

    TypeOrmModule.forFeature([
      User, RoleUser, Restaurant, TableRestaurant, MenuRestaurant,
      Plat, ReservationTable, ReservationTime, SystemConfig, Bloc,
      RestaurantImage, RestaurantBloc, MealTimeEntity, Notification
    ]),

    RestaurantModule,
    AuthModule,
    UserModule,
    TablesModule,
    MenuModule,
    PlatsModule,
    ReservationsModule,
    CustomConfigModule,
    BlocModule,
    CustomerModule,
    MealTimeModule,
    NotificationsModule
  ],

  controllers: [
    AppController,
    ModuleController,
    BlocController,
    MealTimeController,
    CustomerController
  ],

  providers: [
    AppService,
    PlatsService,
    BlocService,
    MealTimeService,
    CustomerService
  ],
})
export class AppModule { }
