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
        queryBuilder.andWhere('keyword.category.id = :catId', { catId: catId});
        return queryBuilder.getMany();

    }

    findOne(id: number) {
        const queryBuilder = this.keywordRepository.createQueryBuilder('keyword');
        queryBuilder.andWhere('keyword.id = :id', { id: id });
        return queryBuilder.getOne();
    }

    update(id: number, updateKeywordDto: UpdateKeywordDto) {
        return `This action updates a #${id} keyword #${updateKeywordDto}`;
    }

    remove(id: number) {
        return `This action removes a #${id} keyword`;
    }
}
