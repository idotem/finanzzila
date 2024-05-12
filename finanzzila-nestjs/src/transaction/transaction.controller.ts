import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionFilterDto } from './dto/filter-transaction.dto';
import Transaction from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transactions')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Express.Multer.File): Promise<Transaction[]> {
        console.log(file);
        return this.transactionService.populateTransactions(file);
    }

    @Get()
    async findAllFiltered(@Query() filter: TransactionFilterDto): Promise<Transaction[]> {
        const t = await this.transactionService.findAllFiltered(filter);
        return t;
    }

    @Get('uploaded-reports')
    async findAllUploadedReports() {
        return await this.transactionService.findAllUploadedReports();
    }

    @Post()
    create(@Body() createTransactionDto: CreateTransactionDto) {
        return this.transactionService.create(createTransactionDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.transactionService.findOne(+id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
        return this.transactionService.update(+id, updateTransactionDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string): void {
        return this.transactionService.remove(+id);
    }
}
