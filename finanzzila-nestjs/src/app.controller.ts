import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { MonthData } from './month-data.entity';

@Controller('/expenses')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getExpenses(): MonthData {
    return this.appService.getExpenses();
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
  }
}
