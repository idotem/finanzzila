import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Keyword } from './entities/keyword.entity';
import { TransactionCategory } from 'src/transaction-category/entity/transaction-category.entity';
import { TransactionCategoryService } from 'src/transaction-category/transaction-category.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KeywordService {
    constructor(
        @InjectRepository(Keyword)
        private readonly keywordRepository: Repository<Keyword>,
        private readonly categoryService: TransactionCategoryService
    ) { }

    async create(createKeywordDto: CreateKeywordDto) {
        const category: TransactionCategory = await this.categoryService.findById(createKeywordDto.categoryId);
        const keyword: Keyword = new Keyword(createKeywordDto.value, category);
        this.keywordRepository.save(keyword);
    }

    findAll() {
        return this.keywordRepository.find();
    }

    findAllByCategoryId(catId: number) {
        const queryBuilder = this.keywordRepository
            .createQueryBuilder('keyword')
            .leftJoinAndSelect('transaction.category', 'category');
        queryBuilder.andWhere('keyword.category.id = :catId', { catId: catId });
        return queryBuilder.getMany();

    }

    findOne(id: number): Promise<Keyword> {
        const queryBuilder = this.keywordRepository.createQueryBuilder('keyword');
        queryBuilder.andWhere('keyword.id = :id', { id: id });
        return queryBuilder.getOne();
    }

    async update(id: number, updateKeywordDto: UpdateKeywordDto) {
        const keyword: Keyword = await this.findOne(id);
        const category: TransactionCategory =
            await this.categoryService.findById(updateKeywordDto.categoryId);
        if (keyword) {
            keyword.value = updateKeywordDto.value;
            if (category) {
                keyword.category = category;
            }
        } else {
            console.log("Keyword was not found, id:", id);
        }
    }

    remove(id: number): void {
        const options: any = { id: id };
        this.keywordRepository.delete(options);
    }
}
