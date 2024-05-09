import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Keyword } from './entities/keyword.entity';
import { TransactionCategory } from 'src/transaction-category/entity/transaction-category.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class KeywordService {
    constructor(
        @InjectRepository(Keyword)
        private readonly keywordRepository: Repository<Keyword>,
    ) { }

    async createAllForCategory(category: TransactionCategory, createKeywordDtoList: CreateKeywordDto[]) {
        createKeywordDtoList.forEach((ckd) => {
            const keyword: Keyword = new Keyword(ckd.value, category);
            this.keywordRepository.save(keyword);
        })
    }

    findAll() {
        return this.keywordRepository.find();
    }

    findAllByCategoryId(catId: number) {
        const queryBuilder = this.keywordRepository
            .createQueryBuilder('keyword')
            .leftJoinAndSelect('keyword.category', 'category');
        queryBuilder.andWhere('keyword.category.id = :catId', { catId: catId });
        return queryBuilder.getMany();

    }

    findOne(id: number): Promise<Keyword> {
        const queryBuilder = this.keywordRepository.createQueryBuilder('keyword');
        queryBuilder.andWhere('keyword.id = :id', { id: id });
        return queryBuilder.getOne();
    }

    async updateAllForCategory(category: TransactionCategory, updateKeywordDtoList: UpdateKeywordDto[]) {
       this.removeAllForCategory(category); 
       this.createAllForCategory(category, updateKeywordDtoList);
    }

    async removeAllForCategory(category: TransactionCategory): Promise<void> {
        const entitiesToDelete = await this.findAllByCategoryId(category.id);
        await this.keywordRepository.remove(entitiesToDelete);
    }
}
