import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuRestaurant } from './entities/menu.entity';
import { Plat } from 'src/plats/entities/plat.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { MealTimeEntity } from 'src/plats/entities/meal-time.entity';


@Module({
  imports: [TypeOrmModule.forFeature([MenuRestaurant, Plat, Restaurant, MealTimeEntity])],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule { }
