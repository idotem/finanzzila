import { Controller, Post } from '@nestjs/common';
import { DatabaseService, DumpResult } from './database.service';

@Controller('database')
export class DatabaseController {
    constructor(private readonly databaseService: DatabaseService) {}

    @Post('dump')
    async dump(): Promise<DumpResult> {
        return this.databaseService.dump();
    }
}