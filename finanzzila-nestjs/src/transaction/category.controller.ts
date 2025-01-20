import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category-dto';
import { UpdateCategoryDto } from './dto/update-category-dto';
import { CategoryDto } from './dto/category-dto';
import { KeywordDto } from 'src/keyword/dto/keyword-dto';
import { TransactionService } from './transaction.service';
import { TransactionFilterDto } from './dto/filter-transaction.dto';
import { CategoryFilterDto } from './dto/filter-category-dto';

@Controller('categories')
export class CategoryController {
    constructor(private readonly transactionService: TransactionService) {}

    @Get()
    async findAll(): Promise<CategoryDto[]> {
        const t = await this.transactionService.findAllCategories();
        return t.map(
            (tc) =>
                new CategoryDto(
                    tc.id,
                    tc.name,
                    tc.keywords.map((k) => new KeywordDto(k.id, k.value)),
                    tc.isWants,
                    tc.color,
                    tc.isExpense
                )
        );
    }

    @Get('/filtered')
    async findAllFiltered(@Query() filter: CategoryFilterDto): Promise<CategoryDto[]> {
        const t = await this.transactionService.findAllFilteredCategories(filter);
        return t.map(
            (tc) =>
                new CategoryDto(
                    tc.id,
                    tc.name,
                    tc.keywords.map((k) => new KeywordDto(k.id, k.value)),
                    tc.isWants,
                    tc.color,
                    tc.isExpense
                )
        );
    }

    @Post()
    create(@Body() createTransactionCategoryDto: CreateCategoryDto) {
        return this.transactionService.createCategory(createTransactionCategoryDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.transactionService.findCategoryById(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateTransactionCategoryDto: UpdateCategoryDto) {
        return this.transactionService.updateCategory(+id, updateTransactionCategoryDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string): void {
        this.transactionService.deleteCategoryById(+id);
    }
}
