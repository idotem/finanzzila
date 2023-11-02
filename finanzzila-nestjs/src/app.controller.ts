import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import ExpensesEntity from './expenses.entity';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/expenses')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getExpenses(): ExpensesEntity[] {
    const expenses: ExpensesEntity[] = this.appService.getExpenses();
    return expenses;
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
  }
}
