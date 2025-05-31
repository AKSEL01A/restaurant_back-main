import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantImage } from './image.entity';
import { ImageRepository } from './repositories/image.repository';
import { ImageController } from './image.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantImage])],
  controllers: [ImageController],
  providers: [ImageRepository],
  exports: [ImageRepository],
})
export class ImageModule {}
