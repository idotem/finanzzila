import { Test, TestingModule } from '@nestjs/testing';
import { TransactionCategoryService } from './transaction-category.service';

describe('TransactionCategoryService', () => {
  let service: TransactionCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionCategoryService],
    }).compile();

    service = module.get<TransactionCategoryService>(TransactionCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
