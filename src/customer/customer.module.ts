import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { ReservationTable } from 'src/reservations/entities/reservation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealTimeEntity } from 'src/plats/entities/meal-time.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ReservationTable, MealTimeEntity])],
    controllers: [CustomerController],
    providers: [CustomerService],
})
export class CustomerModule { }
