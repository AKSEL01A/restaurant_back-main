import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMealTimeDto {
    @IsNotEmpty()
    @IsString()
    mealTime: string; // 'BREAKFAST', 'LUNCH', 'DINNER'

    @IsNotEmpty()
    @IsString()
    startTime: string; // format 'HH:mm'

    @IsNotEmpty()
    @IsString()
    endTime: string; // format 'HH:mm'
}
