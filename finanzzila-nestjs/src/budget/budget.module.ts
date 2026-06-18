import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetController } from './budget.controller';
import { Budget } from './entities/budget.entity';
import { BudgetService } from './budget.service';
import { Keyword } from 'src/keyword/entities/keyword.entity';
import { KeywordService } from 'src/keyword/keyword.service';
import { Category } from 'src/transaction/entities/category.entity';
import { TransactionService } from 'src/transaction/transaction.service';
import Transaction from 'src/transaction/entities/transaction.entity';
import { BankConfigService } from 'src/bank/bank-config.service';

@Module({
    imports: [TypeOrmModule.forFeature([Budget, Keyword, Category, Transaction])],
    controllers: [BudgetController],
    providers: [BudgetService, KeywordService, TransactionService, BankConfigService]
})
export class BudgetModule {}
