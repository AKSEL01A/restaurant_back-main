import { Identifiable } from 'src/shared/interfaces/identifiable.interface';
import { IPlat } from '../../plats/interfaces/plat.interface';
import { ImageDto } from 'src/image/types/dtos/image.dto';

export interface IMen extends Identifiable {
  datedecreation: string;
  plats: IPlat[];

}
