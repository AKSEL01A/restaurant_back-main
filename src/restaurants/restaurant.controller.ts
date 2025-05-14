import { Controller, Get, Post, Delete, Patch, Body, Param, ParseUUIDPipe, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './types/dto/create-restaurant.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdateRestaurantDto } from './types/dto/update-restaurant.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';




// @ApiBearerAuth('access-token')

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
@ApiTags('restaurants')
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) { }


  @Get('restaurant')
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', required: false })
  @ApiQuery({ name: 'categorie', required: false })
  async getRestaurant(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('categorie') categorie?: string,
  ) {
    return this.restaurantService.getRestaurant({ search, isActive, categorie });
  }

  @Get(':id')
  async getRestaurantById(@Param('id', ParseUUIDPipe) id: string) {
    console.log("ID reçu :", id);
    return this.restaurantService.getRestaurantById(id);
  }




  @Post()
  @Roles('admin')
  async createRestaurant(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantService.createRestaurant(createRestaurantDto);
  }
  @Delete(':id')
  @Roles('admin')
  async deleteRestaurant(@Param('id') id: string) {
    return this.restaurantService.deleteRestaurant(id);
  }
  @Patch(':id')
  @Roles('admin')
  async updateRestaurant(@Param('id', ParseUUIDPipe) id: string, @Body() updaterestaurantDto: UpdateRestaurantDto) {
    console.log('updateRestaurantDto:', updaterestaurantDto);
    return this.restaurantService.updateRestaurant(id, updaterestaurantDto);
  }
  @Patch('deactivate/:id')
  @Roles('admin')
  async deactivateRestaurant(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantService.deactivateRestaurant(id);
  }
  @Patch(':id/toggle-active')
  @Roles('admin')
  async toggleRestaurantActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantService.toggleActive(id);
  }
  @Get(':id/with-menus')
  getRestaurantWithMenus(@Param('id') id: string) {
    return this.restaurantService.getRestaurantWithMenus(id);
  }


}





