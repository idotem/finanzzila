import { Module } from '@nestjs/common';
import { BankController } from './bank.controller';
import { BankConfigService } from './bank-config.service';

@Module({
    controllers: [BankController],
    providers: [BankConfigService],
    exports: [BankConfigService]
})
export class BankModule {}
