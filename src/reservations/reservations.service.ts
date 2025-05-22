import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ReservationRepository } from './repositories/reservation.repository';
import { CreateReservationDto } from './types/dtos/create-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RestaurantRepository } from 'src/restaurants/repositories/restaurant.repository';
import { TableRepository } from 'src/tables/repositories/table.repository';
import { Plat } from 'src/plats/entities/plat.entity';
import { platRepository } from 'src/plats/repositories/plat.repository';

import { UserRepository } from 'src/user/repositories/user.repository';

import { UpdateReservationDto } from './types/dtos/update-reservation.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TableStatus } from 'src/tables/enums/status.enums';
import { ReservationStatus } from './enums/reservation.enums';
import { TableRestaurant } from 'src/tables/entities/table.entity';
import { User } from 'src/user/entities/user.entity';
import { ReservationTable } from './entities/reservation.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { SystemConfig } from 'src/config/entities/config.entity';
import { SystemConfigRepository } from 'src/config/repositories/system-config.repository';
import { ReservationTime } from './entities/reservation-time.entity';
import { ReservationTimeRepository } from './repositories/reservation-time.repository';
import moment from 'moment';
import { SystemConfigService } from 'src/config/config.service';
import { MealTimeEntity } from 'src/plats/entities/meal-time.entity';
import { In, Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { CreateMealTimeDto } from 'src/plats/types/dtos/create-meal-time.dto';
import { MealTime } from './interfaces/mealTime-interface';

@Injectable()
export class ReservationsService {


  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: RestaurantRepository,

    @InjectRepository(TableRestaurant)
    private readonly tableRepository: TableRepository,

    @InjectRepository(User)
    private readonly userRepository: UserRepository,

    @InjectRepository(ReservationTable)
    private readonly reservationRepository: ReservationRepository,

    @InjectRepository(Plat)
    private readonly platrepository: platRepository,
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: SystemConfigRepository,

    @InjectRepository(ReservationTime)
    private readonly reservationTimeRepository: ReservationTimeRepository,
    private readonly systemconfigService: SystemConfigService,


    @InjectRepository(MealTimeEntity)
    private readonly mealTimeRepository: Repository<MealTimeEntity>
  ) { }



  async getReservationStatsByCustomerConfirmationAndCancellation() {
    const confirmedByCustomerCount = await this.reservationRepository.count({
      where: { confirmedByCustomer: true, isCancelled: false },
    });

    const notConfirmedByCustomerCount = await this.reservationRepository.count({
      where: { confirmedByCustomer: false, isCancelled: false },
    });

    const cancelledCount = await this.reservationRepository.count({
      where: { isCancelled: true },
    });

    return {
      confirmedByCustomer: confirmedByCustomerCount,
      // notConfirmedByCustomer: notConfirmedByCustomerCount,
      cancelled: cancelledCount,
    };
  }


  async countCancelled(): Promise<number> {
    return this.reservationRepository.count({ where: { isCancelled: true } });
  }

  async countReported(): Promise<number> {
    return this.reservationRepository
      .createQueryBuilder('reservation')
      .where('reservation.reportCount > 0')
      .getCount();
  }



  async getReservationsCountByDate(): Promise<{ date2: string, count: number }[]> {
    return this.reservationTimeRepository
      .createQueryBuilder('r')
      .select('r.date2', 'date2')
      .addSelect('COUNT(*)', 'count')
      .groupBy('r.date2')
      .orderBy('r.date2', 'ASC')
      .getRawMany();
  }
  async countReservations(): Promise<number> {
    return this.reservationRepository.count();
  }



  @Cron(CronExpression.EVERY_MINUTE)
  async updateReservationStatus() {
    const now = moment();

    const reservations = await this.reservationRepository.find({
      where: { status: ReservationStatus.ACTIVE },
      relations: ['reservationTime', 'table'],
    });

    const finishedReservations = reservations.filter(res => {
      if (!res.reservationTime?.date2 || !res.reservationTime?.endTime) return false;

      const finMoment = moment(`${res.reservationTime.date2}T${res.reservationTime.endTime}`);
      return now.isAfter(finMoment);
    });

    for (const reservation of finishedReservations) {
      if (reservation.table) {
        reservation.table.status = TableStatus.LIBRE;
        await this.tableRepository.save(reservation.table);
      }

      reservation.status = ReservationStatus.FINISHED;
      await this.reservationRepository.save(reservation);

      // await this.reservationRepository.delete(reservation.id);
      // console.log(`Reservation ${reservation.id} terminée et supprimée.`);


    }
  }




  @Cron(CronExpression.EVERY_MINUTE)
  async autoCancelUnconfirmedReservations() {
    const config = await this.systemConfigRepository.findOneBy({});
    if (!config || typeof config.confirmationDeadlineBeforeReservation !== 'number') return;

    const deadline = config.confirmationDeadlineBeforeReservation;
    const now = moment();

    const reservations = await this.reservationRepository.find({
      where: {
        status: ReservationStatus.ACTIVE,
        confirmedByCustomer: false,
      },
      relations: ['reservationTime'],
    });

    for (const res of reservations) {
      const { date2, startTime } = res.reservationTime || {};
      if (!date2 || !startTime) continue;

      const startMoment = moment(`${date2}T${startTime}`);
      const diff = startMoment.diff(now, 'minutes');

      if (startMoment.isAfter(now) && diff <= deadline) {
        res.status = ReservationStatus.NO_CONFIRMATION;
        res.isCancelled = true;
        await this.reservationRepository.save(res);
      }
    }
  }




  // async createReservation(createReservationDto: CreateReservationDto, user) {

  //   const { tableId, reservationDateTime, customerName, platIds } = createReservationDto;


  //   const table = await this.tableRepository.findOneBy({ id: tableId });
  //   if (!table) throw new NotFoundException('Table not found');

  //   const connectedUser = await this.userRepository.findOneBy({ id: user.userId });
  //   if (!connectedUser) throw new NotFoundException('user not found');


  //   const config = await this.systemConfigRepository.findOneBy({});
  //   if (!config) throw new NotFoundException('System config not found');

  //   const timeSlot = await this.reservationTimeRepository.findOne({
  //     where: { id: createReservationDto.timeSlotId },
  //   });
  //   if (!timeSlot) throw new NotFoundException('Time slot not found');



  //   // //bech ye7seb 9adeh min mara bech ya3mel reo 
  //   // const pastReservationsCount = await this.reservationRepository.countBy({
  //   //   restaurant: { id: restaurantId },
  //   //   user: { id: user.userId }
  //   // });

  //   //fet nombre eno mayjech lil reservation
  //   // if (pastReservationsCount >= config.maxNoShowAllowed) {
  //   //   throw new UnauthorizedException(
  //   //     `لقد تجاوزت الحد الأقصى لعدد الغيابات، الرجاء الاتصال بصاحب المطعم لإعادة التفعيل.`
  //   //   );
  //   // }
  //   //3ando wa9et m7aded mta3 cancel
  //   const parsedReservationDate = new Date(reservationDateTime);
  //   const now = new Date();
  //   const diffInMinutes = (parsedReservationDate.getTime() - now.getTime()) / (1000 * 60);
  //   if (diffInMinutes < config.maxCancelTimeBeforeReservation) {
  //     throw new UnauthorizedException(
  //       `Impossible d’annuler la réservation dans les ${config.maxCancelTimeBeforeReservation} minutes`
  //     );
  //   }

  //   const mealTime = getMealTime(parsedReservationDate.toISOString());

  //   if (!mealTime) {
  //     throw new BadRequestException('Invalid meal time');
  //   }


  //   if (!mealTime) {
  //     throw new BadRequestException('Invalid meal time');
  //   }

  //   let plats: Plat[] = [];

  //   if (platIds && platIds.length > 0) {
  //     plats = await this.platrepository.findBy({
  //       id: In(platIds),
  //       mealTime,
  //     });
  //   }

  //   const invalidPlats = plats.filter((plat) => plat.mealTime !== mealTime);

  //   if (invalidPlats.length > 0) {
  //     throw new BadRequestException(`certains plats ne correspondent pas au type de repas: ${mealTime}`);
  //   }

  //   console.log(user.userId)


  //   const reservation = this.reservationRepository.create({
  //     customerName,
  //     reservationDateTime: parsedReservationDate.toISOString(),
  //     table,
  //     user: connectedUser,
  //     plats,
  //     timeSlot
  //   });



  //   return this.reservationRepository.save(reservation);


  // }

  async createReservation(createReservationDto: CreateReservationDto, user) {
    const { tableId, customerName, phone, platIds, reservationTime } = createReservationDto;

    const table = await this.tableRepository.findOneBy({ id: tableId });
    if (!table) throw new NotFoundException('Table not found');

    const connectedUser = await this.userRepository.findOneBy({ id: user.userId });
    if (!connectedUser) throw new NotFoundException('User not found');

    const config = await this.systemConfigRepository.findOneBy({});
    if (!config) throw new NotFoundException('System config not found');
    const moment = require('moment');

    //   const overlappingReservations = await this.reservationRepository
    //     .createQueryBuilder('reservation')
    //     .where('reservation.tableId = :tableIdd', { tableIdd: tableId })
    //     .andWhere(`reservation.reservationTimeId.date2 = :date`, { date: reservationTime.date2 })
    //     .andWhere(`(
    //   (reservation.reservationTimeId.startTime) < :endTime AND
    //   (reservation.reservationTimeId.endTime) > :startTime
    // )`, {
    //       startTime: reservationTime.startTime, // format: "HH:mm"
    //       endTime: reservationTime.endTime      // format: "HH:mm"
    //     })
    //     .getCount();


    // const overlappingReservations = await this.reservationRepository.find({
    //   where: {
    //     table: tableId,
    //     reservationTime: {
    //       date2: Raw((alias) => `${alias} ->> 'date2' = :date`, { date: requestedDate }),
    //       startTime: Raw((alias) => `${alias} ->> 'endTime' > :startTime`, { startTime: requestedStartTime }),
    //       endTime: Raw((alias) => `${alias} ->> 'startTime' < :endTime`, { endTime: requestedEndTime }),
    //     },
    //   },
    // });


    // if (overlappingReservations > 0) {
    //   throw new BadRequestException('La table est déjà réservée dans ce créneau horaire.');
    // }
    const startMoment = moment(reservationTime.startTime, 'HH:mm');
    const mealTimes = await this.mealTimeRepository.find();

    const matchedMealTime = mealTimes.find(mt => {
      const mtStart = moment(mt.startTime, 'HH:mm');
      const mtEnd = moment(mt.endTime, 'HH:mm');

      // Gère les repas qui passent à minuit (ex: 18:00 → 00:00)
      if (mtEnd.isBefore(mtStart)) {
        return startMoment.isSameOrAfter(mtStart) || startMoment.isBefore(mtEnd);
      } else {
        return startMoment.isSameOrAfter(mtStart) && startMoment.isBefore(mtEnd);
      }
    });

    if (!matchedMealTime) {
      throw new BadRequestException(`Aucun créneau de repas ne correspond à l'heure de début : ${reservationTime.startTime}`);
    }

    // 🔁 Affecter automatiquement l'heure de fin selon MealTime
    reservationTime.endTime = matchedMealTime.endTime;


    const existingReservation = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoin('reservation.table', 'table')
      .leftJoin('reservation.reservationTime', 'time')
      .where('table.id = :tableId', { tableId })
      .andWhere('time.date2 = :reservationDate', { reservationDate: reservationTime.date2 })
      .andWhere(
        '(time.startTime < :endTime AND time.endTime > :startTime)',
        {
          startTime: reservationTime.startTime,
          endTime: reservationTime.endTime,
        },
      )
      .getOne();
    console.log(existingReservation)
    if (existingReservation && !existingReservation.isCancelled) {
      throw new BadRequestException('La table est déjà réservée dans ce créneau horaire.');
    }

    console.log(reservationTime.date2)
    const debutDateTime = moment(`${reservationTime.date2}T${reservationTime.startTime}`);
    const finDateTime = moment(`${reservationTime.date2}T${reservationTime.endTime}`);
    validateReservationTime(debutDateTime, finDateTime, config.maxCancelTimeBeforeReservation);
    // const startMoment = moment(reservationTime.startTime, 'HH:mm');
    const endMoment = moment(reservationTime.endTime, 'HH:mm');

    const reservationMealTime = getMealTimeForRange(startMoment, endMoment);

    if (!reservationMealTime) {
      throw new BadRequestException('Le créneau de réservation doit appartenir entièrement à un seul type de repas : breakfast, lunch ou dinner.');
    }

    let plats: Plat[] = [];
    if (platIds && platIds.length > 0) {
      plats = await this.platrepository.find({
        where: { id: In(platIds) },
        relations: ['mealTimes'],
      });
    }

    await validatePlatsCoherence(platIds, reservationTime.startTime, reservationTime.endTime, plats, this.mealTimeRepository);

    await this.reservationTimeRepository.save(reservationTime);
    const reservation = this.reservationRepository.create({
      customerName,
      phone,
      table,
      user: connectedUser,
      plats,
      reservationTime,
      confirmed: false,
    });


    await this.reservationRepository.save(reservation);


    const qrData = `Reservation ID: ${reservation.id}`;
    const qrCodeBase64 = await QRCode.toDataURL(qrData);


    reservation.qrCode = qrCodeBase64;
    await this.reservationRepository.save(reservation);
    const reservationTimeWithreservation = {
      ...reservationTime,
      reservation,
    };
    await this.reservationTimeRepository.save(reservationTimeWithreservation);




    return reservation;
  }



async getReservationsForUser(userId: string) {
  return this.reservationRepository.createQueryBuilder('reservation')
    .leftJoinAndSelect('reservation.reservationTime', 'reservationTime')
    .leftJoinAndSelect('reservation.table', 'table')
    .leftJoinAndSelect('table.restaurantBloc', 'bloc') // ⬅️ bloc
    .leftJoinAndSelect('bloc.restaurant', 'restaurant') // ⬅️ actual restaurant
    .where('reservation.user.id = :userId', { userId })
    .orderBy('reservation.createdAt', 'DESC')
    .getMany();
}





  async getReservationById(id: string) {
    const fetchedReservation = await this.reservationRepository.findOneBy({ id: id });

    if (!fetchedReservation) {
      throw new BadRequestException(`Reservation with ID ${id} not found`);
    }

    return fetchedReservation;
  }


  async getReservation() {
    return this.reservationRepository.find();
  }




async updateReservation(id: string, updateReservationDto: UpdateReservationDto, user: any) {
  const reservation = await this.reservationRepository.findOne({
    where: { id },
    relations: ['user', 'reservationTime', 'table'],
  });

  if (!reservation) {
    throw new NotFoundException(`Réservation avec l'ID ${id} introuvable`);
  }

  const config = await this.systemconfigService.getConfig();
  const now = new Date();

  const timeSlot = reservation.reservationTime;

  if (!timeSlot) {
    throw new BadRequestException('Créneau horaire de la réservation manquant.');
  }

  if (!timeSlot.date2 || !timeSlot.startTime) {
    throw new BadRequestException('Date ou heure de réservation manquante.');
  }

  const dateOnly = new Date(timeSlot.date2).toISOString().split('T')[0];
  const reservationDateTime = new Date(`${dateOnly}T${timeSlot.startTime}`);
  const diffInMinutes = Math.floor((reservationDateTime.getTime() - now.getTime()) / 60000);

  // ✅ GESTION D'ANNULATION
  if (updateReservationDto.isCancelled || updateReservationDto.status === ReservationStatus.CANCELLED) {
    if (diffInMinutes < config.maxCancelTimeBeforeReservation) {
      throw new BadRequestException(
        `Vous ne pouvez annuler qu'au moins ${config.maxCancelTimeBeforeReservation} minutes à l'avance.`
      );
    }

    const userNoShowCount = reservation.user?.noShowCount || 0;
    if (userNoShowCount >= config.maxNoShowAllowed) {
      throw new BadRequestException(
        `Vous avez atteint la limite de non-présentations (${config.maxNoShowAllowed}). Contactez le restaurant.`
      );
    }

    reservation.isCancelled = true;
    reservation.status = ReservationStatus.CANCELLED;
  }

  // ✅ GESTION DE REPORT
  if (updateReservationDto.isReported) {
    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException(`Vous ne pouvez pas reporter une réservation déjà annulée.`);
    }

    if (reservation.reportCount >= config.maxReportAllowed) {
      throw new BadRequestException(
        `Vous avez atteint le nombre maximal de reports (${config.maxReportAllowed}).`
      );
    }

    if (diffInMinutes < config.maxReportTimeBeforeReservation) {
      throw new BadRequestException(
        `Vous ne pouvez plus reporter cette réservation. Il faut au moins ${config.maxReportTimeBeforeReservation} minutes avant l'heure prévue.`
      );
    }

    reservation.reportCount += 1;
    reservation.status = ReservationStatus.REPORTED;
  }

  // ✅ MODIFICATIONS SIMPLES
  if (updateReservationDto.customerName) {
    reservation.customerName = updateReservationDto.customerName;
  }

  // ✅ MODIFICATION DU CRENEAU TEMPOREL
  if (updateReservationDto.reservationTime && reservation.reservationTime) {
    const rt = updateReservationDto.reservationTime;

    if (rt.startTime) {
      reservation.reservationTime.startTime = rt.startTime;
    }

    if (rt.date2) {
      reservation.reservationTime.date2 = new Date(rt.date2); // 🔄 conversion string → Date
    }

    if (rt.name) {
      reservation.reservationTime.name = rt.name;
    }

    await this.reservationTimeRepository.save(reservation.reservationTime);
  }

  const updated = await this.reservationRepository.save(reservation);

  return {
    id: updated.id,
    isCancelled: updated.isCancelled,
    status: updated.status,
    customerName: updated.customerName,
    reservationDate: updated.reservationTime?.date2,
    userId: updated.user?.id,
    tableId: updated.table?.id,
    reservationTimeId: updated.reservationTime?.id,
  };
}




 async getUnavailableTables(
  restaurantId: string,
  date: string,
  time: string,
  excludeReservationId?: string, // ⬅️ param optionnel
): Promise<string[]> {
  const query = this.reservationRepository
    .createQueryBuilder('reservation')
    .leftJoin('reservation.table', 'table')
    .leftJoin('reservation.reservationTime', 'timeSlot')
    .where('timeSlot.date2 = :date', { date })
    .andWhere('timeSlot.startTime <= :time AND timeSlot.endTime > :time', { time })
    .andWhere('table.restaurantBlocId = :restaurantId', { restaurantId }) 
    .andWhere('reservation.isCancelled = false');

  if (excludeReservationId) {
    query.andWhere('reservation.id != :excludeReservationId', { excludeReservationId });
  }

  const reservations = await query.getMany();

  return reservations
    .map((res) => res.table?.id)
    .filter((id): id is string => typeof id === 'string');
}

  async deleteReservation(id: string, user: User) {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['user', 'reservationTime'],
    });

    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'ID ${id} introuvable`);
    }

    // if (!reservation.user || reservation.user.id !== user.id) {
    //   throw new UnauthorizedException("Vous ne pouvez supprimer que vos propres réservations");
    // }

    const now = new Date();

    if (!reservation.reservationTime?.date2 || !reservation.reservationTime?.endTime) {
      throw new BadRequestException("Les informations de temps de réservation sont incomplètes.");
    }


    const date2 = new Date(reservation.reservationTime.date2);

    const fullEndDateTime = new Date(
      `${date2.toISOString().split('T')[0]}T${reservation.reservationTime.endTime}:00`
    );

    const isCancellable =
      reservation.status === ReservationStatus.CANCELLED ||
      reservation.status === ReservationStatus.FINISHED ||
      fullEndDateTime < now;


    if (!isCancellable) {
      throw new BadRequestException("Seules les réservations annulées ou passées peuvent être supprimées");
    }

    await this.reservationRepository.delete(id);

    return { message: `Réservation avec l'ID ${id} supprimée avec succès` };
  }



  async confirmReservationByQrCode(reservationId: string): Promise<ReservationTable> {
    const reservation = await this.reservationRepository.findOneBy({ id: reservationId });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    reservation.confirmed = true;
    await this.reservationRepository.save(reservation);
    return reservation;
  }



  async confirmReservationByCustomer(id: string): Promise<ReservationTable> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }

    if (reservation.confirmedByCustomer) {
      throw new BadRequestException('Réservation déjà confirmée par le client');
    }

    reservation.confirmedByCustomer = true;
    reservation.status = ReservationStatus.CONFIRMED;

    return this.reservationRepository.save(reservation);
  }









}


function validateReservationTime(debutDateTime, finDateTime, maxCancelTimeBeforeReservation) {
  const moment = require('moment');


  const now = moment();

  if (!debutDateTime.isValid() || !finDateTime.isValid()) {
    throw new BadRequestException('Date ou heure invalide.');
  }

  if (!debutDateTime.isBefore(finDateTime)) {
    throw new BadRequestException('L\'heure de début doit être avant l\'heure de fin.');
  }

  if (finDateTime.diff(debutDateTime, 'minutes') < 60) {
    throw new BadRequestException('La durée de la réservation doit être d\'au moins 1 heure.');
  }

  const minStartTime = now.add(maxCancelTimeBeforeReservation, 'minutes');
  if (!debutDateTime.isAfter(minStartTime)) {
    throw new BadRequestException(`La réservation doit être faite au moins ${maxCancelTimeBeforeReservation} minutes à l'avance.`);
  }



}


// async function validatePlatsCoherence(platIds: string[], startTime: string, endTime: string, plats) {
//   const moment = require('moment');
//   const reservationStart = moment(startTime, 'HH:mm');
//   const reservationEnd = moment(endTime, 'HH:mm');

//   const mealTimeRanges = {
//     breakfast: { start: moment('08:00', 'HH:mm'), end: moment('12:00', 'HH:mm') },
//     lunch: { start: moment('12:00', 'HH:mm'), end: moment('18:00', 'HH:mm') },
//     dinner: { start: moment('18:00', 'HH:mm'), end: moment('23:59', 'HH:mm') },
//   };

//   for (const plat of plats) {
//     const allowedRange = mealTimeRanges[plat.mealTime];

//     const isStartInRange = reservationStart.isSameOrAfter(allowedRange.start) && reservationStart.isBefore(allowedRange.end);
//     const isEndInRange = reservationEnd.isAfter(allowedRange.start) && reservationEnd.isSameOrBefore(allowedRange.end);

//     if (!(isStartInRange && isEndInRange)) {
//       throw new BadRequestException(
//         `Le plat "${plat.name}" est disponible uniquement pour le ${plat.mealTime}, mais la réservation est en dehors de ce créneau.`
//       );
//     }
//   }
// }










async function validatePlatsCoherence(
  platIds: string[],
  startTime: string,
  endTime: string,
  plats: Plat[],
  mealTimeRepository: Repository<MealTimeEntity>
) {
  const reservationStart = moment(startTime, 'HH:mm');
  const reservationEnd = moment(endTime, 'HH:mm');

  // Charger tous les MealTimes depuis la base
  const allMealTimes = await mealTimeRepository.find();

  if (!allMealTimes || allMealTimes.length === 0) {
    throw new BadRequestException('Aucun type de repas configuré.');
  }

  // Trouver le mealTime correspondant au créneau de réservation
  const matchingMealTime = allMealTimes.find((mealTime) => {
    const mealStart = moment(mealTime.startTime, 'HH:mm');
    const mealEnd = moment(mealTime.endTime, 'HH:mm');
    return (
      reservationStart.isSameOrAfter(mealStart) &&
      reservationEnd.isSameOrBefore(mealEnd)
    );
  });

  if (!matchingMealTime) {
    throw new BadRequestException('Le créneau de réservation ne correspond à aucun type de repas.');
  }

  // Vérifier que la liste des plats n'est pas vide
  // if (!plats || plats.length === 0) {
  //   throw new BadRequestException('Aucun plat trouvé avec les IDs fournis.');
  // }

  // Vérifier chaque plat
  if (plats.length > 0) {
    for (const plat of plats) {
      if (!plat.mealTimes || plat.mealTimes.length === 0) {
        throw new BadRequestException(`Le plat "${plat.name}" n'a pas de créneau horaire configuré.`);
      }

      const mealTimeIdsOfPlat = plat.mealTimes.map(mt => mt.id);

      if (!mealTimeIdsOfPlat.includes(matchingMealTime.id)) {
        throw new BadRequestException(
          `Le plat "${plat.name}" n'est pas disponible pour le créneau sélectionné.`
        );
      }
    }
  }
}














// function getMealTimeForRange(start: moment.Moment, end: moment.Moment): 'breakfast' | 'lunch' | 'dinner' | null {
//   const moment = require('moment');
//   const ranges = {
//     breakfast: { start: moment('08:00', 'HH:mm'), end: moment('12:00', 'HH:mm') },
//     lunch: { start: moment('12:00', 'HH:mm'), end: moment('18:00', 'HH:mm') },
//     dinner: { start: moment('18:00', 'HH:mm'), end: moment('23:59', 'HH:mm') },
//   };

//   for (const [mealTime, range] of Object.entries(ranges)) {
//     if (
//       start.isSameOrAfter(range.start) &&
//       end.isSameOrBefore(range.end)
//     ) {
//       return mealTime as 'breakfast' | 'lunch' | 'dinner';
//     }
//   }

//   return null;
// }




const mealTimeRanges = {
  breakfast: { start: '08:00', end: '12:00' },
  lunch: { start: '12:00', end: '18:00' },
  dinner: { start: '18:00', end: '23:59' },
};

export function getMealTimeForRange(start: moment.Moment, end: moment.Moment): 'breakfast' | 'lunch' | 'dinner' | null {
  for (const [mealTime, range] of Object.entries(mealTimeRanges)) {
    const rangeStart = moment(range.start, 'HH:mm');
    const rangeEnd = moment(range.end, 'HH:mm');

    if (start.isSameOrAfter(rangeStart) && end.isSameOrBefore(rangeEnd)) {
      return mealTime as 'breakfast' | 'lunch' | 'dinner';
    }
  }
  return null;
}



async function isTableAvailable(
  tableId: string,
  debutDateTime: Date,
  finDateTime: Date
): Promise<boolean> {
  const overlappingReservations = await this.reservationRepository
    .createQueryBuilder('reservation')
    .where('reservation.tableId = :tableId', { tableId })
    .andWhere('reservation.debutDateTime < :finDateTime', { finDateTime })
    .andWhere('reservation.finDateTime > :debutDateTime', { debutDateTime })
    .getCount();

  return overlappingReservations === 0;
}


