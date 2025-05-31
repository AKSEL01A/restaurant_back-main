
import { PartialType } from '@nestjs/swagger';
import { CreateBlocDto } from './create-bloc.dto';



export class UpdateBlocDto extends PartialType(CreateBlocDto) {}
