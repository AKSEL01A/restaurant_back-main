import { Identifiable } from "src/shared/interfaces/identifiable.interface";

export interface SystemConfig  extends Identifiable{
   
    maxNoShowAllowed: number;
    maxCancelTimeBeforeReservation: number;
    maxReportTimeBeforeReservation: number;
    maxReportAllowed: number;
    banDurationDays: number;
   
  }
  