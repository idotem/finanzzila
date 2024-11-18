import { DataSource, EntitySubscriberInterface, EventSubscriber, UpdateEvent } from 'typeorm';
import { TransactionCategory } from './entities/transaction-category.entity';
import { Inject, forwardRef } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@EventSubscriber()
export class CategorySubscriber implements EntitySubscriberInterface<TransactionCategory> {
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService;
    constructor(dataSource: DataSource, transactionService: TransactionService) {
        dataSource.subscribers.push(this);
        this.transactionService = transactionService;
    }

    listenTo() {
        return TransactionCategory;
    }

    async afterTransactionCommit() {
        await this.transactionService.updateTransactionsAfterCategoriesGetUpdated();
    }
    async beforeUpdate(event: UpdateEvent<TransactionCategory>) {
        console.log('EventSub: TransactionCategory before update:', event.entity);
    }

    async afterUpdate(event: UpdateEvent<TransactionCategory>) {
        console.log('EventSub: TransactionCategory after update:', event.databaseEntity);
    }
}
