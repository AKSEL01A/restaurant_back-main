import { Identifiable } from "src/shared/interfaces/identifiable.interface";
export interface IReservation extends Identifiable {
  tableId: string;
  customerName?: string;
  createdBy?: string;
  reservationDateTime: Date;
  isCancelled: boolean;
  createdAt: Date;
}
