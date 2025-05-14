import { Controller, Get, Post, Param, Body, ParseUUIDPipe, Patch, Delete, NotFoundException } from '@nestjs/common';
import { MealTimeService } from './meal-time.service';
import { MealTimeEntity } from 'src/plats/entities/meal-time.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('meal-times')
export class MealTimeController {
    constructor(private readonly mealTimeService: MealTimeService) { }
    @Get('count')
    async getMealTimeCounts() {
        return this.mealTimeService.countByMealTime();
    }
    @Roles('manager', 'Customer', 'serveur')
    @Get()
    findAll() {
        return this.mealTimeService.findAll();
    }
    @Roles('manager', 'Customer', 'serveur')
    @Get(':id')
    getMealTimeById(@Param('id', ParseUUIDPipe) id: string) {
        return this.mealTimeService.getMealTimeById(id);
    }
    @Roles('manager')
    @Post()
    createMealTime(
        @Body() mealTimeData: Partial<MealTimeEntity> & { restaurantId: string }
    ) {
        return this.mealTimeService.createMealTime(mealTimeData);
    }
    @Roles('manager')
    @Patch(':id')
    updateMealTime(
        @Param('id') id: string,
        @Body() updateData: Partial<MealTimeEntity>
    ) {
        return this.mealTimeService.updateMealTime(id, updateData);
    }
    @Roles('manager')
    @Delete(':mealId')
    async deleteMealTime(@Param('mealId') mealId: string) {
        return this.mealTimeService.deleteMealTime(mealId);
    }




}


