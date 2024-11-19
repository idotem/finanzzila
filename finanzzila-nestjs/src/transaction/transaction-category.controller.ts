import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateTransactionCategoryDto } from './dto/create-transaction-category-dto';
import { UpdateTransactionCategoryDto } from './dto/update-transaction-category-dto';
import { CategoryDto } from './dto/category-dto';
import { KeywordDto } from 'src/keyword/dto/keyword-dto';
import { TransactionService } from './transaction.service';

@Controller('transaction-categories')
export class TransactionCategoryController {
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
<<<<<<< HEAD
                    tc.isWants,
                    tc.color
=======
<<<<<<< HEAD
                    tc.isWants,
                    tc.color
=======
                    tc.isWants
>>>>>>> main
>>>>>>> 0a1f6ad2fd262f08f6a7f46965a588ec49648af0
                )
        );
    }

    @Post()
    create(@Body() createTransactionCategoryDto: CreateTransactionCategoryDto) {
        return this.transactionService.createCategory(createTransactionCategoryDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.transactionService.findCategoryById(+id);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateTransactionCategoryDto: UpdateTransactionCategoryDto
    ) {
        return this.transactionService.updateCategory(+id, updateTransactionCategoryDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string): void {
        this.transactionService.deleteCategoryById(+id);
    }
}
