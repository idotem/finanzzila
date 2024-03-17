import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Transaction from './entities/transaction.entity'
import { TransactionCategoryService } from 'src/transaction-category/transaction-category.service';
import { TransactionCategory } from 'src/transaction-category/entity/transaction-category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Transaction]),
    TypeOrmModule.forFeature([TransactionCategory])],
    controllers: [TransactionController],
    providers: [TransactionService, TransactionCategoryService],
})
export class TransactionModule { }
