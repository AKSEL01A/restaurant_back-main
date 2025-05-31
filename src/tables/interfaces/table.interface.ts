import { Identifiable } from "src/shared/interfaces/identifiable.interface";
import { Shape } from "../enums/shape.enum";

export interface TableInterface extends Identifiable {

  numChaises: number;
  view: string;
  status: string;
  shape: Shape;
}
