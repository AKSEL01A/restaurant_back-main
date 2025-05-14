import { Plat } from '../entities/plat.entity';
import { MealTime } from '../enums/meal-time.enum';


export interface MealTimeInterface {
    id: string;
    mealTime: MealTime;
    startTime: string;
    endTime: string;
    plats: Plat[];
}
