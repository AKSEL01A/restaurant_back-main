import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';
import { AuthModule } from 'src/auth/auth.module';
import { RoleUser } from 'src/auth/entities/role.entity';
import { User } from './entities/user.entity';
import { ReservationTable } from 'src/reservations/entities/reservation.entity';
import { MailModule } from 'src/services/mail.module';
import { RestaurantModule } from 'src/restaurants/restaurant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RoleUser, ReservationTable]),
    AuthModule,MailModule,RestaurantModule
  ],
  providers: [UserService, UserRepository],
  exports: [UserService, UserRepository],
  controllers: [UserController],
})
export class UserModule { }
