import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/transaction/entities/category.entity';
import { Keyword } from 'src/keyword/entities/keyword.entity';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';

@Module({
    imports: [TypeOrmModule.forFeature([Category, Keyword])],
    controllers: [DatabaseController],
    providers: [DatabaseService]
})
export class DatabaseModule {}