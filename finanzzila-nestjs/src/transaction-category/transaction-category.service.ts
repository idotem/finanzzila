import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionCategory } from './entity/transaction-category.entity';

@Injectable()
export class TransactionCategoryService {
  constructor(
    @InjectRepository(TransactionCategory)
    private readonly transactionCategoryRepository: Repository<TransactionCategory>,
  ) {}

  findAll(): Promise<TransactionCategory[]> {
    return this.transactionCategoryRepository.find();
  }
}
