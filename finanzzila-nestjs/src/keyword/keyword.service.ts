import { Injectable } from '@nestjs/common';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionCategoryService } from 'src/transaction-category/transaction-category.service';
import { Keyword } from './entities/keyword.entity';
import { TransactionCategory } from 'src/transaction-category/entity/transaction-category.entity';

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
        return `This action returns all keyword`;
    }

    findOne(id: number) {
        return `This action returns a #${id} keyword`;
    }

    update(id: number, updateKeywordDto: UpdateKeywordDto) {
        return `This action updates a #${id} keyword #${updateKeywordDto}`;
    }

    remove(id: number) {
        return `This action removes a #${id} keyword`;
    }
}
