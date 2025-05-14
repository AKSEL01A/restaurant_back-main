import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MealTimeEntity } from 'src/plats/entities/meal-time.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MealTimeService {
    constructor(
        @InjectRepository(MealTimeEntity)
        private readonly mealTimeRepository: Repository<MealTimeEntity>,
        @InjectRepository(Restaurant)
        private readonly restaurantRepository: Repository<Restaurant>
    ) { }
    async countByMealTime(): Promise<{ mealTime: string, count: number }[]> {

        const data = await this.mealTimeRepository
            .createQueryBuilder('meal_time')
            .select('meal_time.mealTime', 'mealTime')
            .addSelect('COUNT(*)::int', 'count')
            .groupBy('meal_time.mealTime')
            .getRawMany();

        const counts = data.map((item: any) => item.count);

        const maxIndex = counts.indexOf(Math.max(...counts));

        const targetPercentage = 60;
        const remainingPercentage = 100 - targetPercentage;


        const sumOthers = counts.reduce((sum: number, val: number, idx: number) => {
            return idx !== maxIndex ? sum + val : sum;
        }, 0);

        const adjustedData = data.map((item: any, idx: number) => ({
            mealTime: item.mealTime,
            count: idx === maxIndex
                ? targetPercentage
                : (item.count / sumOthers) * remainingPercentage
        }));

        return adjustedData;
    }

    async findAll(): Promise<MealTimeEntity[]> {
        return this.mealTimeRepository.find();
    }

    async getMealTimeById(id: string): Promise<MealTimeEntity> {
        const mealTime = await this.mealTimeRepository.findOneBy({ id });
        if (!mealTime) {
            throw new NotFoundException(`MealTime with ID ${id} not found`);
        }
        return mealTime;
    }

    async createMealTime(data: Partial<MealTimeEntity> & { restaurantId: string }): Promise<MealTimeEntity> {
        const restaurant = await this.restaurantRepository.findOneBy({ id: data.restaurantId });

        if (!restaurant) {
            throw new NotFoundException(`Restaurant with ID ${data.restaurantId} not found`);
        }

        const mealTime = this.mealTimeRepository.create({
            ...data,
            restaurant
        });

        return this.mealTimeRepository.save(mealTime);
    }
    async updateMealTime(id: string, updateData: Partial<MealTimeEntity>): Promise<MealTimeEntity> {
        const mealTime = await this.mealTimeRepository.preload({
            id,
            ...updateData,
        });

        if (!mealTime) {
            throw new NotFoundException(`MealTime with ID ${id} not found`);
        }

        return this.mealTimeRepository.save(mealTime);
    }
    async deleteMealTime(id: string) {
        const result = await this.mealTimeRepository.delete(id);

        if (result.affected === 0) {
            return null;
        }

        return { deleted: true };
    }
    async getMealTimesByRestaurant(restaurantId: string) {
        const mealTimes = await this.mealTimeRepository.find({
            where: { restaurant: { id: restaurantId } },
            relations: ['restaurant'],
        });

        return mealTimes.map(mt => ({
            id: mt.id,
            mealTime: mt.mealTime,
            startTime: mt.startTime,
            endTime: mt.endTime,
            restaurantId: mt.restaurant.id,
        }));
    }


}
