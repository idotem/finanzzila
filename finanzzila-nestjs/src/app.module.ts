import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TransactionModule } from './transaction/transaction.module';
import { TransactionCategoryModule } from './transaction-category/transaction-category.module';
import { TransactionCategory } from './transaction-category/entity/transaction-category.entity';
import Transaction from './transaction/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      password: 'mete5',
      username: 'postgres',
      entities: [TransactionCategory, Transaction],
      database: 'finazzila',
      synchronize: true,
      logging: true,
    }),
    UserModule,
    TransactionModule,
    TransactionCategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
