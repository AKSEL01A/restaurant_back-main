import { Identifiable } from 'src/shared/interfaces/identifiable.interface';
import { RestaurantStatus } from '../enums/status.enum';
export interface IRestaurant extends Identifiable {
    address: string;
    speciality: string;
    phone: string;
    hourly: string;
    status: RestaurantStatus;
  }
  