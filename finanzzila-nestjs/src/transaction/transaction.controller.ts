import { Controller, Get, Post, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionFilterDto } from './dto/filter-transaction.dto';
import Transaction from './entities/transaction.entity';

@Controller('transactions')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Express.Multer.File): Promise<Transaction[]> {
        console.log(file);
        return this.transactionService.populateTransactions(file);
    }   

    @Get()
    async findAllFiltered(@Query() filter: TransactionFilterDto) : Promise<Transaction[]> {
        const t = await this.transactionService.findAllFiltered(filter);
        return t;
    }

    @Get('uploaded-reports')
    async findAllUploadedReports() {
        return await this.transactionService.findAllUploadedReports();
    }
}
