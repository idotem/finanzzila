import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common';

import { TransactionService } from './transaction.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionFilterDto } from './dto/filter-transaction.dto';
import Transaction from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transactions')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('bank') bank: string
    ): Promise<Transaction[]> {
        console.log(file);
        return this.transactionService.populateTransactions(file, bank);
    }

    @Get()
    async findAllFiltered(@Query() filter: TransactionFilterDto): Promise<Transaction[]> {
        return await this.transactionService.findAllTransactionsFiltered(filter);
    }

    @Get('uploaded-reports')
    async findAllUploadedReports() {
        return await this.transactionService.findAllUploadedReports();
    }

    @Post()
    create(@Body() createTransactionDto: CreateTransactionDto) {
        return this.transactionService.createTransaction(createTransactionDto);
    }

    @Post('bulk-delete')
    bulkDelete(@Body('ids') ids: number[]): Promise<void> {
        return this.transactionService.bulkDeleteTransactions(ids);
    }

    @Post('bulk-update-category')
    bulkUpdateCategory(
        @Body('ids') ids: number[],
        @Body('categoryId') categoryId: number
    ): Promise<Transaction[]> {
        return this.transactionService.bulkUpdateCategory(ids, categoryId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.transactionService.findTransactionById(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
        return this.transactionService.updateTransaction(+id, updateTransactionDto);
    }

    @Delete('delete-all')
    deleteAll(): Promise<void> {
        return this.transactionService.deleteAllTransactions();
    }

    @Delete(':id')
    delete(@Param('id') id: string): void {
        return this.transactionService.deleteTransactionById(+id);
    }
}
