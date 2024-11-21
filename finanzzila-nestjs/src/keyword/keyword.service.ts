import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Keyword } from './entities/keyword.entity';
import { Injectable } from '@nestjs/common';
import { Category } from 'src/transaction/entities/category.entity';

@Injectable()
export class KeywordService {
    constructor(
        @InjectRepository(Keyword)
        private readonly keywordRepository: Repository<Keyword>
    ) {}

    async findAll(): Promise<Keyword[]> {
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

    async removeAllForCategory(category: Category): Promise<void> {
        const entitiesToDelete = await this.findAllByCategoryId(category.id);
        await this.keywordRepository.remove(entitiesToDelete);
    }
}
