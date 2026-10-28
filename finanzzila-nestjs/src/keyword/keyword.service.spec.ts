import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KeywordService } from './keyword.service';
import { Keyword } from './entities/keyword.entity';
import { CategoryType } from 'src/transaction/enums/category-type.enum';

describe('KeywordService', () => {
    let service: KeywordService;
    let keywordRepository: Partial<Record<keyof Repository<Keyword>, jest.Mock>> & {
        createQueryBuilder: jest.Mock;
    };

    function buildQueryableMock(getMany: jest.Mock, getOne?: jest.Mock): any {
        return {
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            innerJoinAndSelect: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getMany,
            getOne: getOne ?? jest.fn()
        };
    }

    beforeEach(async () => {
        keywordRepository = {
            find: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                KeywordService,
                { provide: getRepositoryToken(Keyword), useValue: keywordRepository }
            ]
        }).compile();

        service = module.get<KeywordService>(KeywordService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should delegate to keywordRepository.find()', async () => {
            const all: any[] = [{ id: 1, value: 'A' }];
            keywordRepository.find!.mockResolvedValue(all);

            const result = await service.findAll();

            expect(result).toBe(all);
            expect(keywordRepository.find).toHaveBeenCalled();
        });
    });

    describe('findAllByCategoryId', () => {
        it('should build a query joining the category and filtering by category id', async () => {
            const keywords: any[] = [{ id: 1, value: 'A', category: { id: 5 } }];
            const getMany = jest.fn().mockResolvedValue(keywords);
            keywordRepository.createQueryBuilder!.mockReturnValue(buildQueryableMock(getMany));

            const result = await service.findAllByCategoryId(5);

            expect(result).toBe(keywords);
            const qb = keywordRepository.createQueryBuilder.mock.results[0].value;
            expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('keyword.category', 'category');
            expect(qb.andWhere).toHaveBeenCalledWith('keyword.category.id = :catId', { catId: 5 });
            expect(getMany).toHaveBeenCalled();
        });
    });

    describe('findAllByCategoryType', () => {
        it('should inner join category and filter by category.type', async () => {
            const keywords: any[] = [{ id: 2, value: 'B', category: { id: 3 } }];
            const getMany = jest.fn().mockResolvedValue(keywords);
            keywordRepository.createQueryBuilder!.mockReturnValue(buildQueryableMock(getMany));

            const result = await service.findAllByCategoryType(CategoryType.INCOME);

            expect(result).toBe(keywords);
            const qb = keywordRepository.createQueryBuilder.mock.results[0].value;
            expect(qb.innerJoinAndSelect).toHaveBeenCalledWith('keyword.category', 'category');
            expect(qb.andWhere).toHaveBeenCalledWith('category.type = :categoryType', {
                categoryType: CategoryType.INCOME
            });
        });

        it('should support the EXPENSE type', async () => {
            const getMany = jest.fn().mockResolvedValue([]);
            keywordRepository.createQueryBuilder!.mockReturnValue(buildQueryableMock(getMany));

            await service.findAllByCategoryType(CategoryType.EXPENSE);

            const qb = keywordRepository.createQueryBuilder.mock.results[0].value;
            expect(qb.andWhere).toHaveBeenCalledWith('category.type = :categoryType', {
                categoryType: CategoryType.EXPENSE
            });
        });
    });

    describe('findOne', () => {
        it('should build a query filtered by keyword id and call getOne', async () => {
            const keyword: any = { id: 7, value: 'C' };
            const getOne = jest.fn().mockResolvedValue(keyword);
            keywordRepository.createQueryBuilder!.mockReturnValue(buildQueryableMock(jest.fn(), getOne));

            const result = await service.findOne(7);

            expect(result).toBe(keyword);
            const qb = keywordRepository.createQueryBuilder.mock.results[0].value;
            expect(qb.andWhere).toHaveBeenCalledWith('keyword.id = :id', { id: 7 });
            expect(getOne).toHaveBeenCalled();
        });
    });

    describe('removeAllForCategory', () => {
        it('should find keywords for the category and then remove them', async () => {
            const toDelete: any[] = [{ id: 1, value: 'A' }, { id: 2, value: 'B' }];
            const getMany = jest.fn().mockResolvedValue(toDelete);
            keywordRepository.createQueryBuilder!.mockReturnValue(buildQueryableMock(getMany));
            keywordRepository.remove!.mockResolvedValue(toDelete);

            const category: any = { id: 9 };

            await service.removeAllForCategory(category);

            expect(getMany).toHaveBeenCalled();
            expect(keywordRepository.remove).toHaveBeenCalledWith(toDelete);
        });

        it('should remove an empty list when the category has no keywords', async () => {
            const getMany = jest.fn().mockResolvedValue([]);
            keywordRepository.createQueryBuilder!.mockReturnValue(buildQueryableMock(getMany));
            keywordRepository.remove!.mockResolvedValue([]);

            await service.removeAllForCategory({ id: 1 } as any);

            expect(keywordRepository.remove).toHaveBeenCalledWith([]);
        });
    });
});