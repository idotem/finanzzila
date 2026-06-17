import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionModule } from './transaction/transaction.module';
import Transaction from './transaction/entities/transaction.entity';
import { Keyword } from './keyword/entities/keyword.entity';
import { Category } from './transaction/entities/category.entity';
import { Budget } from './transaction/entities/budget.entity';
import { KeywordModule } from './keyword/keyword.module';
import { BankModule } from './bank/bank.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'finanzzila.db',
            entities: [Category, Transaction, Keyword, Budget],
            autoLoadEntities: true,
            synchronize: true,
            logging: true
        }),
        TransactionModule,
        KeywordModule,
        BankModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule { }
