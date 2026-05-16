import { Controller, Get } from '@nestjs/common';
import { Bank } from './bank.enum';

@Controller('banks')
export class BankController {
    @Get()
    getBanks(): string[] {
        return Object.values(Bank);
    }
}
