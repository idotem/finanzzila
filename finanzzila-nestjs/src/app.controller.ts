import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
// import { MonthData } from './month-data.entity';
import YearData from './year-data.entity';

@Controller('/expenses')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(':year')
  getExpenses(@Param('year') year: string): YearData {
    return this.appService.getExpenses(year);
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
  }
}
