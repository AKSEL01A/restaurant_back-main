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
import { DataSource, DeepPartial, In, Not, Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { Notification } from '../notifications/entities/notification.entity';
import { MailService } from 'src/services/mail.service';


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
    private readonly mealTimeRepository: Repository<MealTimeEntity>,
    private dataSource: DataSource,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private mailService: MailService,
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

  async getDashboardStatsByRestaurant(restaurantId: string): Promise<{
    totalTables: number;
    cancelledReservations: number;
    reportedReservations: number;
  }> {
    // ✅ Total des tables via bloc
    const totalTables = await this.tableRepository
      .createQueryBuilder('table')
      .innerJoin('table.restaurantBloc', 'bloc')
      .where('bloc.restaurantId = :restaurantId', { restaurantId })
      .getCount();

    // ✅ Réservations annulées via table → bloc
    const cancelledReservations = await this.reservationRepository
      .createQueryBuilder('reservation')
      .innerJoin('reservation.table', 'table')
      .innerJoin('table.restaurantBloc', 'bloc')
      .where('bloc.restaurantId = :restaurantId', { restaurantId })
      .andWhere('reservation.isCancelled = true')
      .getCount();

    // ✅ Réservations signalées via table → bloc
    const reportedReservations = await this.reservationRepository
      .createQueryBuilder('reservation')
      .innerJoin('reservation.table', 'table')
      .innerJoin('table.restaurantBloc', 'bloc')
      .where('bloc.restaurantId = :restaurantId', { restaurantId })
      .andWhere('reservation.reportCount > 0')
      .getCount();

    return {
      totalTables,
      cancelledReservations,
      reportedReservations,
    };
  }





  async getReservationsCountByDateAndRestaurant(): Promise<{ date2: string, restaurantId: string, count: number }[]> {
    return this.reservationTimeRepository
      .createQueryBuilder('time')
      .leftJoin('time.reservationTable', 'reservation')
      .leftJoin('reservation.table', 'table')
      .leftJoin('table.restaurantBloc', 'bloc')
      .leftJoin('bloc.restaurant', 'restaurant')
      .select('time.date2', 'date2')
      .addSelect('restaurant.id', 'restaurantId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('time.date2')
      .addGroupBy('restaurant.id')
      .orderBy('time.date2', 'ASC')
      .getRawMany();
  }

  async countActiveReservationsByRestaurant() {
    return await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoin('reservation.table', 'table')
      .leftJoin('table.restaurantBloc', 'bloc')
      .leftJoin('bloc.restaurant', 'restaurant')
      .select('restaurant.id', 'restaurantId')
      .addSelect('COUNT(*)', 'total')
      .where('reservation.status = :status', { status: 'active' })
      .groupBy('restaurant.id')
      .getRawMany();
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




    }
  }




  @Cron(CronExpression.EVERY_MINUTE)
  async notifyPendingConfirmations() {
    console.log("**********************************test")
    const config = await this.systemConfigRepository.findOneBy({});
    if (!config || typeof config.confirmationDeadlineBeforeReservation !== 'number') return;

    const deadline = config.confirmationDeadlineBeforeReservation;
    console.log(deadline);

    const now = moment();

    const reservations = await this.reservationRepository.find({

      where: {
        status: ReservationStatus.ACTIVE,
        confirmedByCustomer: false,
        reminderSent: false,
      },


      relations: ['reservationTime', 'user'],
    });
    console.log(reservations);

    for (const res of reservations) {
      const { date2, startTime } = res.reservationTime || {};
      if (!date2 || !startTime) continue;

      const startMoment = moment(`${date2}T${startTime}`);
      const diff = startMoment.diff(now, 'minutes');

      if (startMoment.isAfter(now) && diff <= deadline) {
        console.log(res.user?.email);

        if (res.user?.email) {
          await this.mailService.sendMail({
            to: res.user.email,
            subject: 'Rappel de votre réservation',
            text: `Bonjour,\n\nMerci de confirmer votre réservation prévue le ${date2} à ${startTime}.\n\nSans confirmation, elle sera automatiquement annulée.\n\nMerci pour votre compréhension.`,
          });
        }

        res.reminderSent = true;
        await this.reservationRepository.save(res);
      }
    }
  }








  async createReservation(createReservationDto: CreateReservationDto, userId: number) {
    const { tableId, customerName, phone, platIds, reservationTime } = createReservationDto;

    // 1. Trouver la table
    const table = await this.tableRepository.findOne({
      where: { id: tableId },
      relations: ['restaurantBloc', 'restaurantBloc.restaurant'],
    });
    if (!table) throw new NotFoundException('Table not found');

    const connectedUser = await this.userRepository.findOneBy({ id: userId.toString() });
    if (!connectedUser) throw new NotFoundException('User not found');


    const config = await this.systemConfigRepository.findOneBy({});
    if (!config) throw new NotFoundException('System config not found');

    const restaurantId = table.restaurantBloc.restaurant.id;

    const startMoment = moment(`${reservationTime.date2}T${reservationTime.startTime}`);
    let endMoment = reservationTime.endTime
      ? moment(`${reservationTime.date2}T${reservationTime.endTime}`)
      : null;

    const mealTimes = await this.mealTimeRepository.find({
      where: { restaurant: { id: restaurantId } },
      relations: ['restaurant'],
    });

    if (!endMoment) {
      const fallbackMealTime = mealTimes.find(mt => {
        const resTime = moment(startMoment.format('HH:mm'), 'HH:mm');
        const mtStart = moment(mt.startTime, 'HH:mm:ss');
        const mtEnd = moment(mt.endTime, 'HH:mm:ss');
        return resTime.isSameOrAfter(mtStart) && resTime.isBefore(mtEnd);
      });

      if (!fallbackMealTime) {
        throw new BadRequestException(
          `Aucun créneau de repas ne correspond à l'heure de début : ${reservationTime.startTime}`
        );
      }

      reservationTime.endTime = fallbackMealTime.endTime;
      endMoment = moment(`${reservationTime.date2}T${reservationTime.endTime}`);
    }

    if (endMoment.isBefore(startMoment)) {
      endMoment.add(1, 'day');
    }

    const existingReservation = await this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoin('reservation.table', 'table')
      .leftJoin('reservation.reservationTime', 'time')
      .where('table.id = :tableId', { tableId })
      .andWhere('time.date2 = :reservationDate', { reservationDate: reservationTime.date2 })
      .andWhere('(time.startTime < :endTime AND time.endTime > :startTime)', {
        startTime: reservationTime.startTime,
        endTime: reservationTime.endTime,
      })
      .getOne();

    if (existingReservation && !existingReservation.isCancelled) {
      throw new BadRequestException('La table est déjà réservée dans ce créneau horaire.');
    }

    validateReservationTime(startMoment, endMoment, config.maxCancelTimeBeforeReservation);

    const startOnly = moment(startMoment.format('HH:mm'), 'HH:mm');
    const endOnly = moment(endMoment.format('HH:mm'), 'HH:mm');

    const matchingMealTimes = mealTimes.filter(mt => {
      const mtStart = moment(mt.startTime, 'HH:mm:ss');
      const mtEnd = moment(mt.endTime, 'HH:mm:ss');
      return startOnly.isSameOrAfter(mtStart) && endOnly.isSameOrBefore(mtEnd);
    });

    if (matchingMealTimes.length !== 1) {
      throw new BadRequestException(
        'Le créneau doit appartenir à un seul type de repas : breakfast, lunch ou dinner.'
      );
    }

    let plats: Plat[] = [];
    if (platIds && platIds.length > 0) {
      plats = await this.platrepository.find({
        where: { id: In(platIds) },
        relations: ['mealTimes'],
      });
    }

    await validatePlatsCoherence(
      platIds,
      reservationTime.startTime,
      reservationTime.endTime,
      plats,
      this.mealTimeRepository
    );


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

    const reservationTimeWithReservation = {
      ...reservationTime,
      reservation,
    };
    await this.reservationTimeRepository.save(reservationTimeWithReservation);
    const notif = this.notificationRepository.create({
      message: `Nouvelle réservation par ${customerName} pour la table ${table.id}`,
      user: connectedUser,
      reservation: reservation,
    });
    await this.notificationRepository.save(notif);
    return reservation;
  }


  async getReservationsForUser(userId: number) {
    return this.reservationRepository.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.user', 'user') // 🛠️ هذا هو المهم
      .leftJoinAndSelect('reservation.reservationTime', 'reservationTime')
      .leftJoinAndSelect('reservation.table', 'table')
      .leftJoinAndSelect('table.restaurantBloc', 'bloc')
      .leftJoinAndSelect('bloc.restaurant', 'restaurant')
      .where('user.id = :userId', { userId }) // ✅ يخدم توا
      .orderBy('reservation.createdAt', 'DESC')
      .getMany();
  }

  async getReservationsByRestaurant(restaurantId: string): Promise<ReservationTable[]> {
    return this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.table', 'table')
      .leftJoinAndSelect('table.restaurantBloc', 'bloc')
      .leftJoinAndSelect('bloc.restaurant', 'restaurant')
      .leftJoinAndSelect('reservation.reservationTime', 'reservationTime')
      .leftJoinAndSelect('reservation.user', 'user')
      .where('restaurant.id = :restaurantId', { restaurantId })
      .orderBy('reservationTime.date2', 'DESC')
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
    if (!timeSlot || !timeSlot.date2 || !timeSlot.startTime) {
      throw new BadRequestException('Créneau horaire de la réservation manquant ou incomplet.');
    }

    const dateOnly = new Date(timeSlot.date2).toISOString().split('T')[0];
    const reservationDateTime = new Date(`${dateOnly}T${timeSlot.startTime}`);
    const diffInMinutes = Math.floor((reservationDateTime.getTime() - now.getTime()) / 60000);

    // ✅ MISE À JOUR DE LA TABLE SI FOURNIE
    if (updateReservationDto.tableId) {
      const table = await this.tableRepository.findOneBy({ id: updateReservationDto.tableId });
      if (!table) {
        throw new NotFoundException(`Table avec l'ID ${updateReservationDto.tableId} introuvable`);
      }

      const rawDate = reservation.reservationTime?.date2;
      const time = reservation.reservationTime?.startTime;

      if (!rawDate || !time) {
        throw new BadRequestException('Date ou heure de réservation manquante pour vérification de disponibilité.');
      }

      const dateOnly = new Date(rawDate).toISOString().split('T')[0];

      const existingReservation = await this.reservationRepository.findOne({
        where: {
          table: { id: updateReservationDto.tableId },
          reservationTime: {
            date2: new Date(dateOnly),
            startTime: time,
          },
          isCancelled: false,
          id: Not(id),
        },
        relations: ['reservationTime', 'table'],
      });

      if (existingReservation) {
        throw new BadRequestException('Cette table est déjà réservée pour ce créneau.');
      }


      reservation.table = table;
      (reservation as any).tableId = table.id;
      console.log("✅ Nouvelle table affectée :", reservation.table?.id);
    }



    // ✅ GESTION ANNULATION
    if (updateReservationDto.isCancelled || updateReservationDto.status === ReservationStatus.CANCELLED) {
      if (diffInMinutes < config.maxCancelTimeBeforeReservation) {
        throw new BadRequestException(
          `Vous ne pouvez annuler qu'au moins ${config.maxCancelTimeBeforeReservation} minutes à l'avance.`
        );
      }

      const userNoShowCount = reservation.user?.noShowCount || 0;
      if (userNoShowCount >= config.maxNoShowAllowed) {
        throw new BadRequestException(
          `Vous avez atteint la limite de non-présentations (${config.maxNoShowAllowed}).`
        );
      }

      reservation.isCancelled = true;
      reservation.status = ReservationStatus.CANCELLED;
      const cancelNotif = this.notificationRepository.create({
        message: `Votre réservation a été annulée.`,
        user: reservation.user,
        reservation: reservation,
      });
      await this.notificationRepository.save(cancelNotif);
    }

    // ✅ GESTION REPORT
    if (updateReservationDto.isReported) {
      if (reservation.status === ReservationStatus.CANCELLED) {
        throw new BadRequestException(`Vous ne pouvez pas reporter une réservation annulée.`);
      }

      if (reservation.reportCount >= config.maxReportAllowed) {
        throw new BadRequestException(
          `Nombre maximal de reports atteint (${config.maxReportAllowed}).`
        );
      }

      if (diffInMinutes < config.maxReportTimeBeforeReservation) {
        throw new BadRequestException(
          `Vous ne pouvez plus reporter cette réservation. Minimum requis : ${config.maxReportTimeBeforeReservation} minutes avant.`
        );
      }

      reservation.reportCount += 1;
      reservation.status = ReservationStatus.REPORTED;
      const notif = this.notificationRepository.create({
        message: `Votre réservation a été reportée.`,
        user: reservation.user,
        reservation: reservation,
      });
      await this.notificationRepository.save(notif);
    }

    // ✅ CHAMP SIMPLE
    if (updateReservationDto.customerName) {
      reservation.customerName = updateReservationDto.customerName;
    }

    // ✅ MODIFIER LE CRÉNEAU
    if (updateReservationDto.reservationTime && reservation.reservationTime) {
      const rt = updateReservationDto.reservationTime;

      if (rt.startTime) reservation.reservationTime.startTime = rt.startTime;
      if (rt.date2) reservation.reservationTime.date2 = new Date(rt.date2);
      if (rt.name) reservation.reservationTime.name = rt.name;

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
    reservation.status = ReservationStatus.CONFIRMED;

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
    reservation.status = ReservationStatus.CONFIRMED_BY_CUSTOMER;

    const saved = await this.reservationRepository.save(reservation);
    const notif: DeepPartial<Notification> = {
      message: `Réservation confirmée par ${reservation.customerName} pour la table ${reservation.table?.id}`,
      user: reservation.user,
      reservation: saved
    };

    await this.notificationRepository.save(notif);


    return saved;
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
export async function validatePlatsCoherence(
  platIds: string[],
  startTime: string,
  endTime: string,
  plats: Plat[],
  mealTimeRepository: Repository<MealTimeEntity>
) {
  const reservationStart = moment(startTime, 'HH:mm:ss');
  const reservationEnd = moment(endTime, 'HH:mm:ss');

  // Charger tous les mealTimes
  const allMealTimes = await mealTimeRepository.find();
  if (!allMealTimes || allMealTimes.length === 0) {
    throw new BadRequestException('Aucun type de repas configuré.');
  }

  // 🔍 Trouver le créneau correspondant à l'intervalle de la réservation
  const matchingMealTime = allMealTimes.find((mealTime) => {
    const mealStart = moment(mealTime.startTime, 'HH:mm:ss');
    const mealEnd = moment(mealTime.endTime, 'HH:mm:ss');

    // Cas standard (dans la même journée)
    if (mealEnd.isAfter(mealStart)) {
      return reservationStart.isSameOrAfter(mealStart) && reservationEnd.isSameOrBefore(mealEnd);
    }

    // Cas où le créneau dépasse minuit
    return (
      (reservationStart.isSameOrAfter(mealStart) && reservationStart.isBefore(moment('23:59:59', 'HH:mm:ss'))) ||
      (reservationEnd.isSameOrBefore(mealEnd) && reservationEnd.isAfter(moment('00:00:00', 'HH:mm:ss')))
    );
  });

  if (!matchingMealTime) {
    throw new BadRequestException('Le créneau de réservation ne correspond à aucun type de repas.');
  }

  // 🧠 Vérification de la disponibilité des plats pour ce créneau
  const targetMealName = matchingMealTime.mealTime; // 'BREAKFAST', 'LUNCH', etc.

  for (const plat of plats) {
    if (!plat.mealTimes || plat.mealTimes.length === 0) {
      throw new BadRequestException(`Le plat "${plat.name}" n'a pas de créneaux disponibles.`);
    }

    const availableMeals = plat.mealTimes.map(mt => mt.mealTime); // ['BREAKFAST', 'DINNER', etc.]

    if (!availableMeals.includes(targetMealName)) {
      throw new BadRequestException(
        `Le plat "${plat.name}" n'est pas disponible pour le créneau sélectionné.`
      );
    }
  }
}

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


