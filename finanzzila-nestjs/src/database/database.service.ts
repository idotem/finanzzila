import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Category } from 'src/transaction/entities/category.entity';
import { Keyword } from 'src/keyword/entities/keyword.entity';

export interface DumpResult {
    path: string;
    categoriesCount: number;
    keywordsCount: number;
}

@Injectable()
export class DatabaseService {
    private readonly dumpFileName = 'database-dump.txt';

    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
        @InjectRepository(Keyword)
        private readonly keywordRepository: Repository<Keyword>
    ) {}

    /**
     * Writes a human-readable snapshot of the seed data (categories and keywords)
     * to `database-dump.txt` at the Nest backend root. The file is meant to be
     * committed to the repository as the maintained seed snapshot.
     *
     * Transactions and budgets are intentionally NOT touched here: their wipe
     * is orchestrated by the caller (the FE "Reset & Dump" button) via the
     * existing `transactions/delete-all` and `DELETE /budgets` endpoints.
     */
    async dump(): Promise<DumpResult> {
        const categories = await this.categoryRepository.find({
            order: { id: 'ASC' }
        });
        const keywords = await this.keywordRepository.find({
            relations: ['category'],
            order: { id: 'ASC' }
        });

        const payload = {
            generatedAt: new Date().toISOString(),
            categories: categories.map((c) => ({
                id: c.id,
                name: c.name,
                isWants: c.isWants,
                color: c.color,
                type: c.type
            })),
            keywords: keywords.map((k) => ({
                id: k.id,
                value: k.value,
                categoryId: k.category?.id
            }))
        };

        // Resolve relative to this module's compiled location so the dump lands
        // at <backend-root>/database-dump.txt regardless of the process cwd.
        const backendRoot = path.resolve(__dirname, '..', '..');
        const dumpPath = path.join(backendRoot, this.dumpFileName);
        fs.writeFileSync(dumpPath, JSON.stringify(payload, null, 4), 'utf-8');

        return {
            path: dumpPath,
            categoriesCount: categories.length,
            keywordsCount: keywords.length
        };
    }
}