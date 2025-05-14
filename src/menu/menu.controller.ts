import { Controller, Get, Post, Body, Param, Delete, Put, Patch, ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { CreateMenuDto } from './types/dtos/create-menu.dto';
import { UpdateMenuDto } from './types/dtos/update-menu.dto';
import { MenuService } from './menu.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { MealTime } from 'src/plats/enums/meal-time.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiBearerAuth('access-token')
@ApiTags('menu')
@Controller('menu')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) { }
  @Roles('manager')
  @Post()
  async createMenu(@Body() createMenuDto: CreateMenuDto) {
    if (!createMenuDto.datecreation) {
      throw new Error("La date de création est obligatoire !");
    }
    return this.menuService.createMenu(createMenuDto);
  }
  @Roles('manager', 'Customer', 'serveur')
  @Get()
  async getMenu() {
    return this.menuService.getMenu();
  }

  @Roles('manager', 'Customer', 'serveur')
  @Get(':id')
  async getMenuById(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuService.getMenuById(id);
  }
  @Roles('manager')
  @Patch(':id')
  async updateMenu(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.updateMenu(id, updateMenuDto);
  }
  @Roles('manager')
  @Delete(':id')
  async deleteMenu(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuService.deleteMenu(id);
  }

  @Roles('manager', 'Customer', 'serveur')
  @Get('/mealTime/:mealTime')
  async getMenuByMealTime(@Param('mealTime') mealTime: MealTime) {
    return this.menuService.getMenuByMealTime(mealTime);
  }

  @Roles('manager', 'Customer', 'serveur')
  @Get('by-restaurant/:id')
  getMenusByRestaurant(@Param('id') restaurantId: string) {
    return this.menuService.findMenusByRestaurantId(restaurantId);
  }
}
