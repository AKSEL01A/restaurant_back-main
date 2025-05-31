
import { PartialType } from '@nestjs/swagger';
import { CreateMenuDto } from './create-menu.dto';
import { CreatePlatDto } from 'src/plats/types/dtos/create-plat.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
    @ValidateNested({ each: true })
    @Type(() => CreatePlatDto)
    plats?: CreatePlatDto[];
}
