import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Transaction from './entities/transaction.entity';
import { Keyword } from 'src/keyword/entities/keyword.entity';
import { KeywordService } from 'src/keyword/keyword.service';
import { Category } from './entities/category.entity';
import { CategoryController } from './category.controller';
import { Budget } from './entities/budget.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Category, Keyword, Transaction, Budget])],
    controllers: [TransactionController, CategoryController],
    providers: [TransactionService, KeywordService],
    exports: [TypeOrmModule]
})
export class TransactionModule {}
