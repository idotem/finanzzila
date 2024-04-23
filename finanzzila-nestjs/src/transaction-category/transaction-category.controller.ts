import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TransactionCategoryService } from './transaction-category.service';
import { TransactionCategory } from './entity/transaction-category.entity';
import { CreateTransactionCategoryDto } from './dto/create-transaction-category-dto';
import { UpdateTransactionCategoryDto } from './dto/update-transaction-category-dto';

@Controller('transaction-categories')
export class TransactionCategoryController {
    constructor(private readonly transactionCategoryService: TransactionCategoryService) { }

    @Get()
    async findAll(): Promise<TransactionCategory[]> {
        const t = await this.transactionCategoryService.findAll();
        return t;
    }

    @Post()
    create(@Body() createTransactionCategoryDto: CreateTransactionCategoryDto) {
        return this.transactionCategoryService.create(createTransactionCategoryDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.transactionCategoryService.findById(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTransactionCategoryDto: UpdateTransactionCategoryDto) {
        return this.transactionCategoryService.update(+id, updateTransactionCategoryDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string): void {
        this.transactionCategoryService.remove(+id);
    }
}
