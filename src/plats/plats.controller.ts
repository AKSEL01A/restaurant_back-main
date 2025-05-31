import { Controller, Get } from '@nestjs/common';
import { PlatsService } from './plats.service';

@Controller('plats')
export class PlatsController {
  constructor(private readonly platsService: PlatsService) {}

  @Get('populaires')
  async getPopularPlats() {
    return this.platsService.getPopularPlats();
  }
}
