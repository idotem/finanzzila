import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import ExpensesEntity from './expenses.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/expenses')
  getExpenses(): ExpensesEntity[] {
    return this.appService.getExpenses();
  }
}
