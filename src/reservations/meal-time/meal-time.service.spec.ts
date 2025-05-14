import { Test, TestingModule } from '@nestjs/testing';
import { MealTimeService } from './meal-time.service';

describe('MealTimeService', () => {
  let service: MealTimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MealTimeService],
    }).compile();

    service = module.get<MealTimeService>(MealTimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
