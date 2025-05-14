import { Test, TestingModule } from '@nestjs/testing';
import { PlatsService } from './plats.service';

describe('PlatsService', () => {
  let service: PlatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlatsService],
    }).compile();

    service = module.get<PlatsService>(PlatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
