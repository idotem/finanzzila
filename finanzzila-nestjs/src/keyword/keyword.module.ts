import { Module } from '@nestjs/common';
import { KeywordService } from './keyword.service';
import { KeywordController } from './keyword.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Keyword } from './entities/keyword.entity';
import { TransactionCategoryService } from 'src/transaction-category/transaction-category.service';
import { TransactionCategory } from 'src/transaction-category/entity/transaction-category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Keyword, TransactionCategory])],
    controllers: [KeywordController],
    providers: [KeywordService, TransactionCategoryService],
})
export class KeywordModule { }
