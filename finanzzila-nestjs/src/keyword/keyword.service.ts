import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Keyword } from './entities/keyword.entity';
import { Injectable } from '@nestjs/common';
import { TransactionCategory } from 'src/transaction/entities/transaction-category.entity';

@Injectable()
export class KeywordService {
    constructor(
        @InjectRepository(Keyword)
        private readonly keywordRepository: Repository<Keyword>,
    ) { }

    /*
    async createAllForCategory(category: TransactionCategory, createKeywordDtoList: CreateKeywordDto[]) :Promise<void> {
        createKeywordDtoList.forEach(async (ckd) => {
            const keyword: Keyword = new Keyword(ckd.value, category);
            await this.keywordRepository.save(keyword);
        });
    }     
    */

    async findAll() : Promise<Keyword[]>{
        return this.keywordRepository.find();
    }

    findAllByCategoryId(catId: number) {
        const queryBuilder = this.keywordRepository
            .createQueryBuilder('keyword')
            .leftJoinAndSelect('keyword.category', 'category');
        queryBuilder.andWhere('keyword.category.id = :catId', { catId: catId });
        return queryBuilder.getMany();

    }

    async findOne(id: number): Promise<Keyword> {
        const queryBuilder = this.keywordRepository.createQueryBuilder('keyword');
        queryBuilder.andWhere('keyword.id = :id', { id: id });
        return await queryBuilder.getOne();
    }
    
    /*
    async updateAllForCategory(category: TransactionCategory, updateKeywordDtoList: UpdateKeywordDto[]) : Promise<void>{
        try{
            await this.removeAllForCategory(category); 
            return await this.createAllForCategory(category, updateKeywordDtoList);
        } catch(e) {
            console.log("UPDATE ALL FOR CATEGORY ", e.detail)
            return e;
        }
    }
    */

    async removeAllForCategory(category: TransactionCategory): Promise<void> {
        const entitiesToDelete = await this.findAllByCategoryId(category.id);
        await this.keywordRepository.remove(entitiesToDelete);
    }
}
