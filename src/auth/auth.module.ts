import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { MailModule } from '../services/mail.module';
import { UserRepository } from '../user/repositories/user.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { RoleRepository } from './repositories/role.repository';
import { jwtConstants } from './constant';
import { RoleUser } from './entities/role.entity';
import { ReservationTable } from 'src/reservations/entities/reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RoleUser, ReservationTable]),
    PassportModule,

    JwtModule.register({
      global: true,
      //  secret: process.env.JWT_SECRET || 'super_secret_key', 
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '24h' },
    }),
    MailModule,
  ],
  providers: [
    AuthService,
    UserService,
    UserRepository,
    RoleRepository,
    RolesGuard,
    JwtStrategy,
    // JwtService,
  ],
  exports: [
    AuthService,
    UserService,
    UserRepository,
    RoleRepository,
    RolesGuard,
    JwtStrategy,
    JwtModule,
    // JwtService, ca nous donne un errur secretorprivatekey-must-have-a-value  

  ],
  controllers: [AuthController],
})
export class AuthModule { }