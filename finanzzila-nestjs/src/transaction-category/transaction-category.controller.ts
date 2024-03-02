import { Controller } from '@nestjs/common';
import { TransactionCategoryService } from './transaction-category.service';

@Controller('transaction-category')
export class TransactionCategoryController {
  constructor(private readonly transactionCategoryService: TransactionCategoryService) {}
}
