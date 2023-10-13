import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import ExpensesCategory from './expenses.category.enum';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/expenses')
  getExpenses(): Map<ExpensesCategory, number> {
    const json = JSON.stringify(this.appService.getExpenses());
    console.log(this.appService.getExpenses());
    return this.appService.getExpenses();
  }
}
