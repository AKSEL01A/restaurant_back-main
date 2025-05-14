import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bloc } from './entities/bloc.entity';
import { BlocService } from './bloc.service';
import { BlocController } from './bloc.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Bloc])],
    controllers: [BlocController],
    providers: [BlocService], 
    exports: [BlocService],
  })
export class BlocModule {}
