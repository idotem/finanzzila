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

@Module({
    imports: [TypeOrmModule.forFeature([Budget, Keyword, Category, Transaction])],
    controllers: [BudgetController],
    providers: [BudgetService, KeywordService, TransactionService]
})
export class BudgetModule {}
