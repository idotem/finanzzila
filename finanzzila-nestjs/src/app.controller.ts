import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/expenses')
  getExpenses(): string {
    const json = JSON.stringify(
      Object.fromEntries(this.appService.getExpenses()),
    );
    console.log(json);
    return JSON.stringify(Object.fromEntries(this.appService.getExpenses()));
  }
}
