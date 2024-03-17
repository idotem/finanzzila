import { Controller, Get} from '@nestjs/common';
import { TransactionCategoryService } from './transaction-category.service';
import { TransactionCategory } from './entity/transaction-category.entity';

@Controller('transaction-categories')
export class TransactionCategoryController {
  constructor(private readonly transactionCategoryService: TransactionCategoryService) {}

    @Get()
    async findAll(): Promise<TransactionCategory[]> {
        const t = await this.transactionCategoryService.findAll();
        return t;
    }
}
