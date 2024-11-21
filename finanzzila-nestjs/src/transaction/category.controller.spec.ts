import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { TransactionService } from './transaction.service';

describe('CategoryController', () => {
    let controller: CategoryController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CategoryController],
            providers: [TransactionService]
        }).compile();

        controller = module.get<CategoryController>(CategoryController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
