import { Test, TestingModule } from '@nestjs/testing';
import { TransactionCategoryController } from './transaction-category.controller';
import { TransactionCategoryService } from './transaction-category.service';

describe('TransactionCategoryController', () => {
    let controller: TransactionCategoryController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TransactionCategoryController],
            providers: [TransactionCategoryService]
        }).compile();

        controller = module.get<TransactionCategoryController>(TransactionCategoryController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
