import { Test, TestingModule } from '@nestjs/testing';
import { PlatsController } from './plats.controller';

describe('PlatsController', () => {
  let controller: PlatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlatsController],
    }).compile();

    controller = module.get<PlatsController>(PlatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
