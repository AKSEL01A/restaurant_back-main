import { Test, TestingModule } from '@nestjs/testing';
import { MealTimeController } from './meal-time.controller';

describe('MealTimeController', () => {
  let controller: MealTimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MealTimeController],
    }).compile();

    controller = module.get<MealTimeController>(MealTimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
