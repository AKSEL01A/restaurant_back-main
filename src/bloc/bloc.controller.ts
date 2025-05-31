
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { BlocService } from './bloc.service';
import { CreateBlocDto } from './types/dtos/create-bloc.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiBearerAuth('access-token')
@ApiTags('bloc')
@Controller('bloc')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class BlocController {
  constructor(private readonly blocService: BlocService) { }
  @Roles('admin', 'manager')
  @Post()

  create(@Body() createDto: CreateBlocDto) {
    return this.blocService.create(createDto);
  }



  @Get()

  findAll() {
    return this.blocService.findAll();
  }

  @Get(':blocId/:restaurantId')

  getBlocWithRestaurant(
    @Param('blocId') blocId: string,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.blocService.getBlocByIdFiltered(blocId, restaurantId);
  }


}
