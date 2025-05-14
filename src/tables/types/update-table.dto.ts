
import { PartialType } from '@nestjs/swagger';
import { CreateTableDto } from './dtos/create-table.dto';


export class UpdateTableDto extends PartialType(CreateTableDto) {}
