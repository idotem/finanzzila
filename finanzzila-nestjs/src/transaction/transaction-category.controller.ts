import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { TransactionCategoryService } from './transaction-category.service';
import { CreateTransactionCategoryDto } from './dto/create-transaction-category-dto';
import { UpdateTransactionCategoryDto } from './dto/update-transaction-category-dto';
import { CategoryDto } from './dto/category-dto';
import { KeywordDto } from 'src/keyword/dto/keyword-dto';

@Controller('transaction-categories')
export class TransactionCategoryController {
    constructor(private readonly transactionCategoryService: TransactionCategoryService) {}

    @Get()
    async findAll(): Promise<CategoryDto[]> {
        const t = await this.transactionCategoryService.findAll();
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
        return this.transactionCategoryService.create(createTransactionCategoryDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.transactionCategoryService.findById(+id);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateTransactionCategoryDto: UpdateTransactionCategoryDto
    ) {
        return this.transactionCategoryService.update(+id, updateTransactionCategoryDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string): void {
        this.transactionCategoryService.remove(+id);
    }
}
