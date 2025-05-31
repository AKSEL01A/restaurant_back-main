import { MealTime } from 'src/plats/enums/meal-time.enum';
import moment from 'moment';

export function getMealTime(dateTime: string): MealTime {
  const hour = moment(dateTime).hour();

  if (hour >= 8 && hour < 12) return MealTime.BREAKFAST;
  if (hour >= 12 && hour < 18) return MealTime.LUNCH;
  return MealTime.DINNER;
}
