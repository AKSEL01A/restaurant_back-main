import { IsString, IsNotEmpty, IsUrl, IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator';
import { MealTime } from 'src/plats/enums/meal-time.enum';

export class CreatePlatDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsArray()
  @IsUUID('all', { each: true }) // chaque id dans le tableau doit être un UUID
  @IsNotEmpty()
  mealTimeIds: string[];

  @IsString()
  @IsNotEmpty()
  description: string;



  @IsNotEmpty()
  price: number;

}
