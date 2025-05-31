import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './types/dtos/create-reservation.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { userId } from 'src/user/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { UpdateReservationDto } from './types/dtos/update-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ReservationTable } from './entities/reservation.entity';
import { User } from 'src/user/entities/user.entity';
import { Request } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateMealTimeDto } from 'src/plats/types/dtos/create-meal-time.dto';


interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    email: string;
    role: string;
  };
}
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
@ApiTags('reservations')



@Controller('reservations')

export class ReservationController {

  constructor(private readonly reservationService: ReservationsService,

    @InjectRepository(ReservationTable)
    private readonly reservationRepository,
  ) { }


  @Get('count-by-restaurant')
  @Roles('admin')
  async getActiveReservationCountByRestaurant() {
    return this.reservationService.countActiveReservationsByRestaurant();
  }

  @Get('dashboard/:restaurantId')
  async getStatsByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.reservationService.getDashboardStatsByRestaurant(restaurantId);
  }
  @Get('stats-customer-cancelled')
  @Roles('admin')
  async getReservationStatsByCustomerConfirmationAndCancellation() {
    return await this.reservationService.getReservationStatsByCustomerConfirmationAndCancellation();
  }



  /*@Get('availability')
@Roles('admin', 'customer', 'serveur', 'manager')
async checkAvailability(
  @Query('restaurantId') restaurantId: string,
  @Query('date') date: string,
  @Query('time') time: string
) {
  if (!restaurantId || !date || !time) {
    throw new BadRequestException('Paramètres requis manquants');
  }

  const reservedTables = await this.reservationService.getUnavailableTables(
    restaurantId,
    date,
    time
  );

  return reservedTables;
}*/


  @Get('availability')
  @Roles('admin', 'customer', 'serveur', 'manager')
  async checkAvailability(
    @Query('restaurantId') restaurantId: string,
    @Query('date') date: string,
    @Query('time') time: string,
    @Query('reservationId') reservationId?: string, // ✅ ajouté correctement
  ) {
    if (!restaurantId || !date || !time) {
      throw new BadRequestException('Paramètres requis manquants');
    }

    return this.reservationService.getUnavailableTables(
      restaurantId,
      date,
      time,
      reservationId, // ✅ passé correctement
    );
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('customer')
  @Get('client')
  async getClientReservations(@Request() req: AuthenticatedRequest) {
    console.log("👤 Utilisateur connecté:", req.user);
    return this.reservationService.getReservationsForUser(req.user.sub);
  }

  @Get('count-by-date')
  @Roles('admin')
  async getReservationsCountByDate() {
    return this.reservationService.getReservationsCountByDateAndRestaurant();
  }




  @Post()
  @Roles('admin', 'customer', 'serveur', 'manager')
  async createReservation(
    @Body() createReservationDto: CreateReservationDto,
    @userId() userId: number, // 🔥 استقبل فقط الـ ID
  ) {
    console.log("🟢 Création réservation lancée...");
    console.log("👤 userId JWT extrait:", userId);
    return this.reservationService.createReservation(createReservationDto, userId);
  }





  @Get(':id')
  @Roles('admin', 'customer', 'serveur', 'manager')
  async getReservationById(@Param('id', ParseUUIDPipe) id: string) {
    console.log("ID reçu :", id);
    return this.reservationService.getReservationById(id);
  }
  @Get()
  @Roles('admin', 'customer', 'serveur', 'manager')
  async getReservation() {
    return this.reservationService.getReservation();
  }
  @Patch(':id')
  @Roles('admin', 'customer', 'serveur', 'manager')

  async updateReservation(@Param('id') id: string, @Body() updatereservationDto: UpdateReservationDto, @userId() user: any,) {
    console.log('updateReservationDto:', updatereservationDto);
    return this.reservationService.updateReservation(id, updatereservationDto, user);
  }
  @Delete(':id')
  @Roles('admin', 'customer', 'serveur', 'manager')
  async deleteReservation(@Param('id', ParseUUIDPipe) id: string, @userId() user: User,) {
    return this.reservationService.deleteReservation(id, user);
  }




  @Get('confirm/:reservationId')
  @Roles('admin', 'customer', 'serveur')
  async confirmReservation(@Param('reservationId') reservationId: string): Promise<ReservationTable> {
    return await this.reservationService.confirmReservationByQrCode(reservationId);
  }

  @Patch(':id/confirm-by-customer')
  @Roles('admin', 'customer', 'serveur')

  async confirmByCustomer(@Param('id') id: string) {
    return this.reservationService.confirmReservationByCustomer(id);

  }


}
