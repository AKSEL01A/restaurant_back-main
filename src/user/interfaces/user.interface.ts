import { Identifiable } from "src/shared/interfaces/identifiable.interface";

export interface IUser extends Identifiable {
     email: string;
    password: string;
    phone: string;
    resetToken?: string;
  resetTokenExpires?: Date;
    role?: string;
  }
  