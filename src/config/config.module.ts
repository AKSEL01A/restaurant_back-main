import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfig } from './entities/config.entity';
import { SystemConfigService } from './config.service';
import { SystemConfigController } from './config.controller';

  
@Module({
  imports: [TypeOrmModule.forFeature([SystemConfig])],
  providers: [SystemConfigService],
  controllers: [SystemConfigController],
  exports: [SystemConfigService] 
})
export class CustomConfigModule {}
