import { Expose } from "class-transformer";
import { IsNumber, IsString, IsUUID, Min } from "class-validator";

export class RestaurantBlocDto {

    @Expose()
    @IsUUID()
    blocId: string;

    @Expose()
    @Min(1)

    @IsNumber()
    maxTables: number;

    @Expose()
    @Min(1)

    @IsNumber()
    maxChaises: number;

}
