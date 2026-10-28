import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as fs from 'fs';
import { DatabaseService, DumpResult } from './database.service';
import { Category } from 'src/transaction/entities/category.entity';
import { Keyword } from 'src/keyword/entities/keyword.entity';

jest.mock('fs');

describe('DatabaseService', () => {
    let service: DatabaseService;
    let categoryRepository: { find: jest.Mock };
    let keywordRepository: { find: jest.Mock };
    let writeFileSyncMock: jest.Mock;

    beforeEach(async () => {
        categoryRepository = { find: jest.fn() };
        keywordRepository = { find: jest.fn() };
        writeFileSyncMock = fs.writeFileSync as unknown as jest.Mock;
        writeFileSyncMock.mockReset();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DatabaseService,
                { provide: getRepositoryToken(Category), useValue: categoryRepository },
                { provide: getRepositoryToken(Keyword), useValue: keywordRepository }
            ]
        }).compile();

        service = module.get<DatabaseService>(DatabaseService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('dump', () => {
        it('should query categories ordered by id ASC', async () => {
            categoryRepository.find.mockResolvedValue([]);
            keywordRepository.find.mockResolvedValue([]);

            await service.dump();

            expect(categoryRepository.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
        });

        it('should query keywords with category relation ordered by id ASC', async () => {
            categoryRepository.find.mockResolvedValue([]);
            keywordRepository.find.mockResolvedValue([]);

            await service.dump();

            expect(keywordRepository.find).toHaveBeenCalledWith({
                relations: ['category'],
                order: { id: 'ASC' }
            });
        });

        it('should write the serialized payload to database-dump.txt and return counts', async () => {
            const categories: any[] = [
                {
                    id: 1,
                    name: 'not_mapped',
                    isWants: null,
                    color: '#fff',
                    type: 'EXPENSE'
                },
                {
                    id: 2,
                    name: 'Food',
                    isWants: 1,
                    color: '#f00',
                    type: 'EXPENSE'
                }
            ];
            const keywords: any[] = [
                { id: 10, value: 'TINEX', category: { id: 2 } },
                { id: 11, value: 'LIDL', category: null }
            ];
            categoryRepository.find.mockResolvedValue(categories);
            keywordRepository.find.mockResolvedValue(keywords);

            const result: DumpResult = await service.dump();

            expect(result.categoriesCount).toBe(2);
            expect(result.keywordsCount).toBe(2);
            expect(result.path).toMatch(/database-dump\.txt$/);

            expect(writeFileSyncMock).toHaveBeenCalledTimes(1);
            const [dumpPath, content, encoding] = writeFileSyncMock.mock.calls[0];
            expect(dumpPath).toMatch(/database-dump\.txt$/);
            expect(encoding).toBe('utf-8');

            const parsed = JSON.parse(content);
            expect(parsed.categories).toHaveLength(2);
            expect(parsed.categories[0]).toEqual({
                id: 1,
                name: 'not_mapped',
                isWants: null,
                color: '#fff',
                type: 'EXPENSE'
            });
            expect(parsed.keywords).toHaveLength(2);
            expect(parsed.keywords[0]).toEqual({ id: 10, value: 'TINEX', categoryId: 2 });
            expect(parsed.keywords[1]).toEqual({ id: 11, value: 'LIDL' });
            expect(typeof parsed.generatedAt).toBe('string');
        });

        it('should write an empty payload when there is no seed data', async () => {
            categoryRepository.find.mockResolvedValue([]);
            keywordRepository.find.mockResolvedValue([]);

            const result = await service.dump();

            expect(result.categoriesCount).toBe(0);
            expect(result.keywordsCount).toBe(0);
            const content = writeFileSyncMock.mock.calls[0][1];
            expect(JSON.parse(content).categories).toEqual([]);
            expect(JSON.parse(content).keywords).toEqual([]);
        });
    });
});