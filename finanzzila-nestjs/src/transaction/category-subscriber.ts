
import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
} from 'typeorm';
import { TransactionCategory } from './entities/transaction-category.entity';
import { Inject, forwardRef } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@EventSubscriber()
export class CategorySubscriber implements EntitySubscriberInterface<TransactionCategory> {

    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService;
    constructor(dataSource: DataSource,  transactionService: TransactionService) {
        dataSource.subscribers.push(this);
        this.transactionService = transactionService;
    }

    listenTo() {
        return TransactionCategory;
    }

    async afterTransactionCommit() {
        await this.transactionService.updateTransactionsAfterCategoriesGetUpdated();
    }
}

