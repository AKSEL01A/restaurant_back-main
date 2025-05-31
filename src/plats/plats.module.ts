import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatsController } from './plats.controller';
import { PlatsService } from './plats.service';
import { Plat } from './entities/plat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plat])], // <-- très important
  controllers: [PlatsController],
  providers: [PlatsService],
})
export class PlatsModule {}
