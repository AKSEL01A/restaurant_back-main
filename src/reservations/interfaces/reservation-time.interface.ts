import { IRestaurant } from "src/restaurants/interfaces/restaurant.interface";
import { Identifiable } from "src/shared/interfaces/identifiable.interface";


export interface IReservationTimeSlot extends Identifiable {

  startTime: string;
  endTime: string;
  date?: string;
  isActive: boolean;


}
