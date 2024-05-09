import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Transaction from './entities/transaction.entity'
import { TransactionCategoryService } from 'src/transaction-category/transaction-category.service';
import { TransactionCategory } from 'src/transaction-category/entity/transaction-category.entity';
import { Keyword } from 'src/keyword/entities/keyword.entity';
import { KeywordService } from 'src/keyword/keyword.service';

@Module({
    imports: [TypeOrmModule.forFeature([Transaction, TransactionCategory, Keyword])],
    controllers: [TransactionController],
    providers: [TransactionService, TransactionCategoryService, KeywordService],
})
export class TransactionModule { }
