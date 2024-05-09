import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionCategory } from './entity/transaction-category.entity';
import { CreateTransactionCategoryDto } from './dto/create-transaction-category-dto';
import { UpdateTransactionCategoryDto } from './dto/update-transaction-category-dto';
import { KeywordService } from 'src/keyword/keyword.service';

@Injectable()
export class TransactionCategoryService {
    constructor(
        @InjectRepository(TransactionCategory)
        private readonly transactionCategoryRepository: Repository<TransactionCategory>,
        private readonly keywordService: KeywordService,
    ) { }

    findAll(): Promise<TransactionCategory[]> {
        const queryBuilder = this.transactionCategoryRepository
            .createQueryBuilder('transaction-category')
            .leftJoinAndSelect('transaction-category.keywords', 'keywords');
        return queryBuilder.getMany();
    }

    async create(createTransactionCategoryDto: CreateTransactionCategoryDto): Promise<TransactionCategory> {
        const category: TransactionCategory = new TransactionCategory(
            createTransactionCategoryDto.name);
        const savedCategory = await this.transactionCategoryRepository.save(category);
        this.keywordService.createAllForCategory(savedCategory, createTransactionCategoryDto.keywords);
        return savedCategory;
    }

    async update(id: number, updateTransactionCategoryDto: UpdateTransactionCategoryDto) {
        const category : TransactionCategory = await this.findById(id);
        if(category) {
            category.name = updateTransactionCategoryDto.name;
            this.keywordService.updateAllForCategory(category, updateTransactionCategoryDto.keywords);
            return this.transactionCategoryRepository.save(category);
        } else {
            console.log("Category not found");
        }
    }

    findById(id: number): Promise<TransactionCategory> {
        return this.transactionCategoryRepository.findOne({where: {id}});
    }

    remove(id: number) : void {
        const options: any = { id: id };
        this.transactionCategoryRepository.delete(options);
    }
}

