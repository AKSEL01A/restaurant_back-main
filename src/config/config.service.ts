import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from './entities/config.entity';
import { CreateSystemConfigDto } from './types/dtos/create-system-config.dto';
import { UpdateSystemConfigDto } from './types/dtos/update-system-config.dto';

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepo: Repository<SystemConfig>,
  ) {}

  async getConfig() {
    const config = await this.configRepo.findOneBy( {} );

    if (!config) {
      throw new NotFoundException('System config not found');
    }
    return config;
  }

  async createConfig(dto: CreateSystemConfigDto) {
    const created = this.configRepo.create(dto);
    return this.configRepo.save(created);
  }

  async updateConfig(id: string, dto: UpdateSystemConfigDto) {
    const config = await this.configRepo.findOneBy({ id } );
    if (!config) {
      throw new NotFoundException('System config not found');
    }
    Object.assign(config, dto);
    return this.configRepo.save(config);
  }
}
