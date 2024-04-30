import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionCategory } from './entity/transaction-category.entity';
import { CreateTransactionCategoryDto } from './dto/create-transaction-category-dto';
import { UpdateTransactionCategoryDto } from './dto/update-transaction-category-dto';
import { Keyword } from 'src/keyword/entities/keyword.entity';
import { CreateKeywordDto } from 'src/keyword/dto/create-keyword.dto';

@Injectable()
export class TransactionCategoryService {
    constructor(
        @InjectRepository(TransactionCategory)
        private readonly transactionCategoryRepository: Repository<TransactionCategory>,
        @InjectRepository(Keyword)
        private readonly keywordRepository: Repository<Keyword>,

    ) { }

    findAll(): Promise<TransactionCategory[]> {
        return this.transactionCategoryRepository.find();
    }

    async create(createTransactionCategoryDto: CreateTransactionCategoryDto): Promise<TransactionCategory> {
        const category: TransactionCategory = new TransactionCategory(
            createTransactionCategoryDto.name);
        const savedCategory = await this.transactionCategoryRepository.save(category);
        this.createKeywordsForCategory(createTransactionCategoryDto.keywords, savedCategory);
        return savedCategory;
    }

    async createKeywordsForCategory(keywordsDto: CreateKeywordDto[],
        category: TransactionCategory) {
        keywordsDto.forEach((k) => {
            const keyword: Keyword = new Keyword(k.value, category);
            this.keywordRepository.save(keyword);
        })
    }

    async update(id: number, updateTransactionCategoryDto: UpdateTransactionCategoryDto) {
        const category : TransactionCategory = await this.findById(id);
        if(category) {
            category.name = updateTransactionCategoryDto.name;
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

