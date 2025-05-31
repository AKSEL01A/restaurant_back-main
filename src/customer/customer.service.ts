import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MealTimeEntity } from "src/plats/entities/meal-time.entity";
import { ReservationTable } from "src/reservations/entities/reservation.entity";
import { ReservationRepository } from "src/reservations/repositories/reservation.repository";
import { Repository } from "typeorm";

@Injectable()
export class CustomerService {

    constructor(
        @InjectRepository(ReservationTable)
        private readonly reservationRepository: ReservationRepository,
        @InjectRepository(MealTimeEntity)
        private readonly mealTimeRepository: Repository<MealTimeEntity>,) { }

    async checkAvailability(
        tableId: string,
        date: string,
        startTime: string
    ): Promise<{ available: boolean }> {
        const moment = require('moment');
        const startMoment = moment(startTime, 'HH:mm');

        const mealTimes = await this.mealTimeRepository.find();

        const matchedMealTime = mealTimes.find(mt => {
            const mtStart = moment(mt.startTime, 'HH:mm');
            const mtEnd = moment(mt.endTime, 'HH:mm');

            if (mtEnd.isBefore(mtStart)) {
                return startMoment.isSameOrAfter(mtStart) || startMoment.isBefore(mtEnd);
            } else {
                return startMoment.isSameOrAfter(mtStart) && startMoment.isBefore(mtEnd);
            }
        });

        if (!matchedMealTime) {
            throw new BadRequestException(`Aucun créneau de repas ne correspond à l'heure de début : ${startTime}`);
        }

        const endTime = matchedMealTime.endTime;

        const conflicting = await this.reservationRepository
            .createQueryBuilder('reservation')
            .leftJoin('reservation.reservationTime', 'time')
            .leftJoin('reservation.table', 'table')
            .where('table.id = :tableId', { tableId })
            .andWhere('time.date2 = :date', { date })
            .andWhere(
                '(time.startTime < :endTime AND time.endTime > :startTime)',
                { startTime, endTime }
            )
            .getOne();

        return { available: !conflicting };
    }

}
