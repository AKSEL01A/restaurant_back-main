import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Plat } from './entities/plat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlatsService {
  constructor(
    @InjectRepository(Plat)
    private readonly platRepository: Repository<Plat>,
  ) {}

  async getPopularPlats(): Promise<Plat[]> {
    return await this.platRepository.find({
      take: 10, // nombre limité
      order: { name: 'ASC' }, // tri simple, tu peux le changer
      relations: ['mealTimes'], // optionnel si tu veux les mealTimes aussi
    });
  }
}
