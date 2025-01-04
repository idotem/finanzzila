import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TransactionModule } from './transaction/transaction.module';
import Transaction from './transaction/entities/transaction.entity';
import { Keyword } from './keyword/entities/keyword.entity';
import { Category } from './transaction/entities/category.entity';
import { KeywordModule } from './keyword/keyword.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            password: 'mete5',
            username: 'postgres',
            entities: [Category, Transaction, Keyword],
            autoLoadEntities: true,
            database: 'dev_finanzzila',
            synchronize: true,
            logging: false
        }),
        UserModule,
        TransactionModule,
        KeywordModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
