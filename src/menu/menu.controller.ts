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
  @Roles('admin', 'customer', 'serveur', 'manager')
  @Post()
  async createMenu(@Body() createMenuDto: CreateMenuDto) {
    if (!createMenuDto.datecreation) {
      throw new Error("La date de création est obligatoire !");
    }
    return this.menuService.createMenu(createMenuDto);
  }
   @Roles('admin', 'customer', 'serveur', 'manager')
  @Get()
  async getMenu() {
    return this.menuService.getMenu();
  }
  @Roles('admin', 'customer', 'serveur', 'manager')
  @Get(':id')
  async getMenuById(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuService.getMenuById(id);
  }
  @Roles('admin', 'customer', 'serveur', 'manager')
  @Patch(':id')
  async updateMenu(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.updateMenu(id, updateMenuDto);
  }
   @Roles('admin', 'customer', 'serveur', 'manager')
  @Delete(':id')
  async deleteMenu(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuService.deleteMenu(id);
  }

  @Roles('admin', 'customer', 'serveur', 'manager')
  @Get('/mealTime/:mealTime')
  async getMenuByMealTime(@Param('mealTime') mealTime: MealTime) {
    return this.menuService.getMenuByMealTime(mealTime);
  }

  @Roles('admin', 'customer', 'serveur', 'manager')
  @Get('by-restaurant/:id')
  getMenusByRestaurant(@Param('id') restaurantId: string) {
    return this.menuService.findMenusByRestaurantId(restaurantId);
  }
}
