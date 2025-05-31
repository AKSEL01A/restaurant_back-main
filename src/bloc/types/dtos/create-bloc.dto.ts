import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { BlocStatus } from "src/bloc/enums/status.enum";
import { ViewType } from "src/tables/enums/view.enums";

export class CreateBlocDto {
  @ApiProperty()
  @IsString()
  name: string;



 
}
