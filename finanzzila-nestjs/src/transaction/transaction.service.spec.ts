import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, FindOperator } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import Transaction from './entities/transaction.entity';
import { Category } from './entities/category.entity';
import { Keyword } from 'src/keyword/entities/keyword.entity';
import { KeywordService } from 'src/keyword/keyword.service';
import { BankConfigService } from 'src/bank/bank-config.service';
import { TransactionService } from './transaction.service';
import { CategoryType } from './enums/category-type.enum';
import { TransactionFilterDto } from './dto/filter-transaction.dto';
import { CategoryFilterDto } from './dto/filter-category-dto';
import { CreateCategoryDto } from './dto/create-category-dto';
import { UpdateCategoryDto } from './dto/update-category-dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { KeywordDto } from 'src/keyword/dto/keyword-dto';

jest.mock('xlsx', () => {
    const read = jest.fn();
    const sheet_to_json = jest.fn();
    return { read, utils: { sheet_to_json } };
});

jest.mock('exceljs', () => {
    const eachRow = jest.fn();
    const load = jest.fn().mockResolvedValue(undefined);
    class Workbook {
        xlsx = { load };
        worksheets = [{ eachRow }];
    }
    return { Workbook };
});

import * as xlsx from 'xlsx';
import { Workbook } from 'exceljs';

function buildQueryableMock(getMany: jest.Mock, getOne? : jest.Mock): any {
    return {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany,
        getOne: getOne ?? jest.fn()
    };
}

function makeCategory(overrides: Partial<Category> = {}): Category {
    const c = new Category('name', [], 0, '#000', CategoryType.EXPENSE);
    Object.assign(c, overrides);
    return c;
}

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
    const t = new Transaction(new Date(), 'place', 0, makeCategory());
    Object.assign(t, overrides);
    return t;
}

describe('TransactionService', () => {
    let service: TransactionService;
    let transactionRepository: any;
    let transactionCategoryRepository: any;
    let keywordService: { findAllByCategoryType: jest.Mock; findAllByCategoryId: jest.Mock; findOne: jest.Mock };
    let bankConfigService: { getConfig: jest.Mock };
    let xlsxReadMock: jest.Mock;
    let xlsxSheetToJsonMock: jest.Mock;
    let excelEachRowMock: jest.Mock;

    beforeEach(async () => {
        transactionRepository = {
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
            clear: jest.fn(),
            createQueryBuilder: jest.fn()
        };
        transactionCategoryRepository = {
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn()
        };
        keywordService = {
            findAllByCategoryType: jest.fn(),
            findAllByCategoryId: jest.fn(),
            findOne: jest.fn()
        };
        bankConfigService = { getConfig: jest.fn() };

        xlsxReadMock = xlsx.read as unknown as jest.Mock;
        xlsxSheetToJsonMock = (xlsx.utils as any).sheet_to_json as jest.Mock;
        xlsxReadMock.mockReset();
        xlsxSheetToJsonMock.mockReset();
        excelEachRowMock = new Workbook().worksheets[0].eachRow as jest.Mock;
        excelEachRowMock.mockReset();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransactionService,
                { provide: getRepositoryToken(Transaction), useValue: transactionRepository },
                { provide: getRepositoryToken(Category), useValue: transactionCategoryRepository },
                { provide: KeywordService, useValue: keywordService },
                { provide: BankConfigService, useValue: bankConfigService }
            ]
        }).compile();

        service = module.get<TransactionService>(TransactionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('checkIfNameOfTransactionContainsGivenWord', () => {
        it('should return true when the word is contained', () => {
            expect(service.checkIfNameOfTransactionContainsGivenWord('TINEX KAUF', 'TINEX')).toBe(true);
        });
        it('should return false when the word is not contained', () => {
            expect(service.checkIfNameOfTransactionContainsGivenWord('LIDL', 'TINEX')).toBe(false);
        });
        it('should return false for an empty name', () => {
            expect(service.checkIfNameOfTransactionContainsGivenWord('', 'TINEX')).toBe(false);
        });
    });

    describe('checkIfCategoryTypeMatchesTransactionAmount', () => {
        it('should allow SAVING_ACCOUNT with any positive amount', () => {
            expect(() =>
                service.checkIfCategoryTypeMatchesTransactionAmount(
                    makeCategory({ type: CategoryType.SAVING_ACCOUNT }),
                    100
                )
            ).not.toThrow();
        });
        it('should allow SAVING_ACCOUNT with negative amount', () => {
            expect(() =>
                service.checkIfCategoryTypeMatchesTransactionAmount(
                    makeCategory({ type: CategoryType.SAVING_ACCOUNT }),
                    -100
                )
            ).not.toThrow();
        });
        it('should allow EXPENSE with negative amount', () => {
            expect(() =>
                service.checkIfCategoryTypeMatchesTransactionAmount(
                    makeCategory({ type: CategoryType.EXPENSE }),
                    -50
                )
            ).not.toThrow();
        });
        it('should allow EXPENSE with zero amount', () => {
            expect(() =>
                service.checkIfCategoryTypeMatchesTransactionAmount(
                    makeCategory({ type: CategoryType.EXPENSE }),
                    0
                )
            ).not.toThrow();
        });
        it('should throw BadRequestException for EXPENSE with positive amount', () => {
            expect(() =>
                service.checkIfCategoryTypeMatchesTransactionAmount(
                    makeCategory({ type: CategoryType.EXPENSE }),
                    50
                )
            ).toThrow(BadRequestException);
        });
        it('should allow INCOME with positive amount', () => {
            expect(() =>
                service.checkIfCategoryTypeMatchesTransactionAmount(
                    makeCategory({ type: CategoryType.INCOME }),
                    50
                )
            ).not.toThrow();
        });
        it('should allow INCOME with zero amount', () => {
            expect(() =>
                service.checkIfCategoryTypeMatchesTransactionAmount(
                    makeCategory({ type: CategoryType.INCOME }),
                    0
                )
            ).not.toThrow();
        });
        it('should throw BadRequestException for INCOME with negative amount', () => {
            expect(() =>
                service.checkIfCategoryTypeMatchesTransactionAmount(
                    makeCategory({ type: CategoryType.INCOME }),
                    -50
                )
            ).toThrow(BadRequestException);
        });
    });

    describe('categoryKeywordsGotUpdated', () => {
        const keywords: any[] = [{ id: 1, value: 'A' }, { id: 2, value: 'B' }];

        it('should return true when the lengths differ', () => {
            expect(service.categoryKeywordsGotUpdated(keywords, [new KeywordDto(1, 'A')])).toBe(true);
        });
        it('should return true when an existing keyword id is missing in the updated list', () => {
            expect(
                service.categoryKeywordsGotUpdated(keywords, [
                    new KeywordDto(1, 'A'),
                    new KeywordDto(3, 'C')
                ])
            ).toBe(true);
        });
        it('should return false when the ids match exactly (length and ids)', () => {
            expect(
                service.categoryKeywordsGotUpdated(keywords, [
                    new KeywordDto(1, 'A'),
                    new KeywordDto(2, 'B')
                ])
            ).toBe(false);
        });
        it('should return true when both lists are empty? (lengths equal, no missing ids)', () => {
            expect(service.categoryKeywordsGotUpdated([], [])).toBe(false);
        });
        it('should return true when existing has keywords but updated is empty', () => {
            expect(service.categoryKeywordsGotUpdated(keywords, [])).toBe(true);
        });
        it('should return true for updated keywords without ids (new keyword added)', () => {
            expect(
                service.categoryKeywordsGotUpdated(keywords, [
                    new KeywordDto(1, 'A'),
                    new KeywordDto(undefined as any, 'NEW')
                ])
            ).toBe(true);
        });
    });

    describe('findCategoryById', () => {
        it('should return the category when found', async () => {
            const category = makeCategory({ id: 5 } as any);
            transactionCategoryRepository.findOne.mockResolvedValue(category);

            const result = await service.findCategoryById(5);

            expect(result).toBe(category);
            expect(transactionCategoryRepository.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
        });
        it('should throw NotFoundException when the category does not exist', async () => {
            transactionCategoryRepository.findOne.mockResolvedValue(null);

            await expect(service.findCategoryById(99)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findTransactionById', () => {
        it('should return the transaction when found', async () => {
            const transaction = makeTransaction({ id: 7 } as any);
            transactionRepository.findOne.mockResolvedValue(transaction);

            const result = await service.findTransactionById(7);

            expect(result).toBe(transaction);
            expect(transactionRepository.findOne).toHaveBeenCalledWith({ where: { id: 7 } });
        });
        it('should return null when not found', async () => {
            transactionRepository.findOne.mockResolvedValue(null);
            const result = await service.findTransactionById(404);
            expect(result).toBeNull();
        });
    });

    describe('findAllCategories', () => {
        it('should build a query joining keywords and return getMany result', async () => {
            const categories: any[] = [makeCategory({ id: 1 } as any)];
            const getMany = jest.fn().mockResolvedValue(categories);
            transactionCategoryRepository.createQueryBuilder.mockReturnValue(buildQueryableMock(getMany));

            const result = await service.findAllCategories();

            expect(result).toBe(categories);
            const qb = transactionCategoryRepository.createQueryBuilder.mock.results[0].value;
            expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('transaction-category.keywords', 'keywords');
            expect(getMany).toHaveBeenCalled();
        });
    });

    describe('findAllFilteredCategories', () => {
        function setup(): any {
            const getMany = jest.fn().mockResolvedValue([]);
            const qb = buildQueryableMock(getMany);
            transactionCategoryRepository.createQueryBuilder.mockReturnValue(qb);
            return qb;
        }

        it('should apply only the name filter when name provided', async () => {
            const qb = setup();
            await service.findAllFilteredCategories(
                new CategoryFilterDto('Food', undefined as any, undefined as any)
            );
            expect(qb.andWhere).toHaveBeenCalledWith('category.name LIKE :name', { name: '%Food%' });
            expect(qb.andWhere).toHaveBeenCalledTimes(1);
        });
        it('should apply the isWants filter when provided', async () => {
            const qb = setup();
            await service.findAllFilteredCategories(
                new CategoryFilterDto(undefined as any, 1, undefined as any)
            );
            expect(qb.andWhere).toHaveBeenCalledWith('category.isWants = :isWants', { isWants: 1 });
            expect(qb.andWhere).toHaveBeenCalledTimes(1);
        });
        it('should apply the type filter when provided', async () => {
            const qb = setup();
            await service.findAllFilteredCategories(
                new CategoryFilterDto(undefined as any, undefined as any, CategoryType.INCOME)
            );
            expect(qb.andWhere).toHaveBeenCalledWith('category.type = :type', { type: CategoryType.INCOME });
            expect(qb.andWhere).toHaveBeenCalledTimes(1);
        });
        it('should apply all three filters when all provided', async () => {
            const qb = setup();
            await service.findAllFilteredCategories(
                new CategoryFilterDto('Food', 1, CategoryType.EXPENSE)
            );
            expect(qb.andWhere).toHaveBeenCalledTimes(3);
        });
        it('should not apply any filter when none provided', async () => {
            const qb = setup();
            await service.findAllFilteredCategories(
                new CategoryFilterDto(undefined as any, undefined as any, undefined as any)
            );
            expect(qb.andWhere).not.toHaveBeenCalled();
        });
    });

    describe('findAllTransactionsFiltered', () => {
        function setup(): any {
            const getMany = jest.fn().mockResolvedValue([]);
            const qb = buildQueryableMock(getMany);
            transactionRepository.createQueryBuilder.mockReturnValue(qb);
            return qb;
        }

        it('should join category and order by date DESC when no filters given', async () => {
            const qb = setup();
            await service.findAllTransactionsFiltered(
                new TransactionFilterDto(undefined as any, undefined as any, undefined as any)
            );
            expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('transaction.category', 'category');
            expect(qb.orderBy).toHaveBeenCalledWith('transaction.date', 'DESC');
            expect(qb.andWhere).not.toHaveBeenCalled();
        });
        it('should filter by categoryId when provided', async () => {
            const qb = setup();
            await service.findAllTransactionsFiltered(
                new TransactionFilterDto(undefined as any, undefined as any, 5)
            );
            expect(qb.andWhere).toHaveBeenCalledWith('transaction.category.id = :categoryId', { categoryId: 5 });
        });
        it('should use BETWEEN when both dateFrom and dateTo provided', async () => {
            const from = new Date('2026-01-01');
            const to = new Date('2026-01-31');
            const qb = setup();
            await service.findAllTransactionsFiltered(new TransactionFilterDto(from, to, undefined as any));
            expect(qb.andWhere).toHaveBeenCalledWith('transaction.date BETWEEN :dateFrom AND :dateTo', {
                dateFrom: '2026-01-01',
                dateTo: '2026-01-31'
            });
        });
        it('should filter by dateFrom only when dateTo is missing', async () => {
            const from = new Date('2026-01-01');
            const qb = setup();
            await service.findAllTransactionsFiltered(
                new TransactionFilterDto(from, undefined as any, undefined as any)
            );
            expect(qb.andWhere).toHaveBeenCalledWith('transaction.date >= :dateFrom', { dateFrom: '2026-01-01' });
        });
        it('should filter by dateTo only when dateFrom is missing', async () => {
            const to = new Date('2026-01-31');
            const qb = setup();
            await service.findAllTransactionsFiltered(
                new TransactionFilterDto(undefined as any, to, undefined as any)
            );
            expect(qb.andWhere).toHaveBeenCalledWith('transaction.date <= :dateTo', { dateTo: '2026-01-31' });
        });
        it('should combine categoryId and date range filters', async () => {
            const from = new Date('2026-01-01');
            const to = new Date('2026-01-31');
            const qb = setup();
            await service.findAllTransactionsFiltered(new TransactionFilterDto(from, to, 7));
            expect(qb.andWhere).toHaveBeenCalledTimes(2);
        });
    });

    describe('createTransaction', () => {
        const category = makeCategory({ id: 2, type: CategoryType.EXPENSE } as any);
        const dto = (
            overrides: Partial<CreateTransactionDto> = {}
        ): CreateTransactionDto =>
            new CreateTransactionDto(
                overrides.date ?? new Date('2026-01-01'),
                overrides.nameOfPlace ?? 'Tinex',
                overrides.amount ?? -100,
                overrides.category ?? 2,
                overrides.categoryKeyword ?? undefined as any
            );

        it('should create and save a transaction when the category/amount match', async () => {
            transactionCategoryRepository.findOne.mockResolvedValue(category);
            const saved = makeTransaction({ id: 1 } as any);
            transactionRepository.save.mockResolvedValue(saved);

            const result = await service.createTransaction(dto());

            expect(result).toBe(saved);
            expect(transactionRepository.save).toHaveBeenCalledTimes(1);
            const arg = transactionRepository.save.mock.calls[0][0];
            expect(arg).toBeInstanceOf(Transaction);
            expect(arg.amount).toBe(-100);
            expect(arg.category).toBe(category);
        });

        it('should add a keyword when categoryKeyword is provided', async () => {
            transactionCategoryRepository.findOne.mockResolvedValue(category);
            transactionRepository.save.mockResolvedValue(makeTransaction({ id: 1 } as any));
            const addKeywordSpy = jest.spyOn(service, 'addKeywordForCategory').mockResolvedValue(category as any);

            await service.createTransaction(dto({ categoryKeyword: 'TINEX' }));

            expect(addKeywordSpy).toHaveBeenCalledWith(category, 'TINEX');
            addKeywordSpy.mockRestore();
        });

        it('should not add a keyword when categoryKeyword is undefined', async () => {
            transactionCategoryRepository.findOne.mockResolvedValue(category);
            transactionRepository.save.mockResolvedValue(makeTransaction({ id: 1 } as any));
            const addKeywordSpy = jest.spyOn(service, 'addKeywordForCategory').mockResolvedValue(category as any);

            await service.createTransaction(dto({ categoryKeyword: undefined as any }));

            expect(addKeywordSpy).not.toHaveBeenCalled();
            addKeywordSpy.mockRestore();
        });

        it('should not add a keyword when categoryKeyword is null', async () => {
            transactionCategoryRepository.findOne.mockResolvedValue(category);
            transactionRepository.save.mockResolvedValue(makeTransaction({ id: 1 } as any));
            const addKeywordSpy = jest.spyOn(service, 'addKeywordForCategory').mockResolvedValue(category as any);

            await service.createTransaction(dto({ categoryKeyword: null as any }));

            expect(addKeywordSpy).not.toHaveBeenCalled();
            addKeywordSpy.mockRestore();
        });

        it('should throw BadRequestException when amount sign does not match category type', async () => {
            const expenseCategory = makeCategory({ id: 2, type: CategoryType.EXPENSE } as any);
            transactionCategoryRepository.findOne.mockResolvedValue(expenseCategory);

            await expect(service.createTransaction(dto({ amount: 100 }))).rejects.toThrow(BadRequestException);
        });
    });

    describe('updateTransaction', () => {
        const category = makeCategory({ id: 2, name: 'Food', type: CategoryType.EXPENSE } as any);

        const dto = (overrides: Partial<UpdateTransactionDto> = {}): UpdateTransactionDto =>
            new UpdateTransactionDto(
                overrides.date ?? new Date('2026-02-01'),
                overrides.nameOfPlace ?? 'Tinex',
                overrides.amount ?? -50,
                overrides.category ?? 2,
                overrides.categoryKeyword ?? undefined as any
            );

        it('should throw NotFoundException when the transaction does not exist', async () => {
            transactionRepository.findOne.mockResolvedValue(null);

            await expect(service.updateTransaction(99, dto())).rejects.toThrow(NotFoundException);
        });

        it('should update fields, save, and return the saved transaction', async () => {
            const existing = makeTransaction({ id: 1 } as any);
            existing.category = makeCategory({ id: 2, name: 'Food', type: CategoryType.EXPENSE } as any);
            transactionRepository.findOne.mockResolvedValue(existing);
            transactionCategoryRepository.findOne.mockResolvedValue(category);
            const saved = { ...existing, amount: -50 };
            transactionRepository.save.mockResolvedValue(saved);

            const result = await service.updateTransaction(1, dto());

            expect(result).toBe(saved);
            expect(transactionRepository.save).toHaveBeenCalledWith(existing);
            expect(existing.amount).toBe(-50);
            expect(existing.category).toBe(category);
            expect(existing.manuallyOverried).toBeFalsy();
        });

        it('should set manuallyOverried=true when the category changes', async () => {
            const existing = makeTransaction({ id: 1 } as any);
            existing.category = makeCategory({ id: 5, name: 'Old', type: CategoryType.EXPENSE } as any);
            transactionRepository.findOne.mockResolvedValue(existing);
            transactionCategoryRepository.findOne.mockResolvedValue(category);
            transactionRepository.save.mockResolvedValue(existing);

            await service.updateTransaction(1, dto());

            expect(existing.manuallyOverried).toBe(true);
        });

        it('should add a keyword when categoryKeyword is provided', async () => {
            const existing = makeTransaction({ id: 1 } as any);
            existing.category = category;
            transactionRepository.findOne.mockResolvedValue(existing);
            transactionCategoryRepository.findOne.mockResolvedValue(category);
            transactionRepository.save.mockResolvedValue(existing);
            const addKeywordSpy = jest
                .spyOn(service, 'addKeywordForCategory')
                .mockResolvedValue(category as any);

            await service.updateTransaction(1, dto({ categoryKeyword: 'TINEX' }));

            expect(addKeywordSpy).toHaveBeenCalledWith(category, 'TINEX');
            addKeywordSpy.mockRestore();
        });

        it('should throw when the new category type mismatches the amount', async () => {
            const existing = makeTransaction({ id: 1 } as any);
            existing.category = category;
            transactionRepository.findOne.mockResolvedValue(existing);
            transactionCategoryRepository.findOne.mockResolvedValue(category);

            await expect(service.updateTransaction(1, dto({ amount: 100 }))).rejects.toThrow(
                BadRequestException
            );
        });
    });

    describe('deleteTransactionById', () => {
        it('should call delete on the repository (fire-and-forget) and return undefined', () => {
            transactionRepository.delete.mockResolvedValue(undefined);

            const result = service.deleteTransactionById(7);

            expect(result).toBeUndefined();
            expect(transactionRepository.delete).toHaveBeenCalledWith({ id: 7 });
        });
    });

    describe('deleteCategoryById', () => {
        it('should call delete on the category repository and return undefined', () => {
            transactionCategoryRepository.delete.mockResolvedValue(undefined);
            const result = service.deleteCategoryById(3);
            expect(result).toBeUndefined();
            expect(transactionCategoryRepository.delete).toHaveBeenCalledWith({ id: 3 });
        });
    });

    describe('bulkDeleteTransactions', () => {
        it('should do nothing when ids is empty', async () => {
            await service.bulkDeleteTransactions([]);
            expect(transactionRepository.delete).not.toHaveBeenCalled();
        });
        it('should do nothing when ids is undefined', async () => {
            await service.bulkDeleteTransactions(undefined as any);
            expect(transactionRepository.delete).not.toHaveBeenCalled();
        });
        it('should delete using In(ids) when ids are provided', async () => {
            const ids = [1, 2, 3];
            transactionRepository.delete.mockResolvedValue(undefined);

            await service.bulkDeleteTransactions(ids);

            expect(transactionRepository.delete).toHaveBeenCalledTimes(1);
            const arg = transactionRepository.delete.mock.calls[0][0];
            expect(arg.id).toBeInstanceOf(FindOperator);
            expect((arg.id as any)._type).toBe('in');
            expect((arg.id as any)._value).toEqual(ids);
        });
    });

    describe('deleteAllTransactions', () => {
        it('should call clear on the repository', async () => {
            transactionRepository.clear.mockResolvedValue(undefined);
            await service.deleteAllTransactions();
            expect(transactionRepository.clear).toHaveBeenCalled();
        });
    });

    describe('bulkUpdateCategory', () => {
        const category = makeCategory({ id: 2, name: 'Food', type: CategoryType.EXPENSE } as any);

        it('should return [] when ids is empty', async () => {
            const result = await service.bulkUpdateCategory([], 2);
            expect(result).toEqual([]);
        });
        it('should return [] when ids is undefined', async () => {
            const result = await service.bulkUpdateCategory(undefined as any, 2);
            expect(result).toEqual([]);
        });
        it('should update matched transactions to the new category and save them', async () => {
            transactionCategoryRepository.findOne.mockResolvedValue(category);
            const t1 = makeTransaction({ id: 1, amount: -10 } as any);
            t1.category = makeCategory({ id: 9, name: 'Other' } as any);
            const t2 = makeTransaction({ id: 2, amount: -20 } as any);
            t2.category = category;
            transactionRepository.find.mockResolvedValue([t1, t2]);
            transactionRepository.save.mockResolvedValue([t1, t2]);

            const result = await service.bulkUpdateCategory([1, 2], 2);

            expect(transactionRepository.find).toHaveBeenCalledWith({
                where: { id: In([1, 2]) } as any,
                relations: ['category']
            });
            expect(t1.manuallyOverried).toBe(true);
            expect(t2.manuallyOverried).toBeFalsy();
            expect(t1.category).toBe(category);
            expect(t2.category).toBe(category);
            expect(transactionRepository.save).toHaveBeenCalledWith([t1, t2]);
            expect(result).toEqual([t1, t2]);
        });
        it('should throw BadRequestException when a transaction amount mismatches the new category type', async () => {
            transactionCategoryRepository.findOne.mockResolvedValue(category);
            const bad = makeTransaction({ id: 1, amount: 10 } as any);
            transactionRepository.find.mockResolvedValue([bad]);

            await expect(service.bulkUpdateCategory([1], 2)).rejects.toThrow(BadRequestException);
        });
    });

    describe('createCategory', () => {
        it('should create, save the category and refresh transactions', async () => {
            const saved = makeCategory({ id: 11 } as any);
            transactionCategoryRepository.save.mockResolvedValue(saved);
            const refreshSpy = jest
                .spyOn(service, 'updateTransactionsAfterCategoriesGetUpdated')
                .mockResolvedValue(undefined);

            const dto = new CreateCategoryDto(
                'Groceries',
                [new KeywordDto(undefined as any, 'TINEX')],
                1,
                '#abcdef',
                CategoryType.EXPENSE
            );

            const result = await service.createCategory(dto);

            expect(result).toBe(saved);
            const savedArg = transactionCategoryRepository.save.mock.calls[0][0];
            expect(savedArg).toBeInstanceOf(Category);
            expect(savedArg.name).toBe('Groceries');
            expect(savedArg.keywords).toHaveLength(1);
            expect(savedArg.keywords[0]).toBeInstanceOf(Keyword);
            expect(savedArg.keywords[0].value).toBe('TINEX');
            expect(refreshSpy).toHaveBeenCalled();
            refreshSpy.mockRestore();
        });
    });

    describe('updateCategory', () => {
        const existing = makeCategory({ id: 4, name: 'Old', type: CategoryType.EXPENSE } as any);

        it('should update the category and refresh transactions when keywords changed', async () => {
            transactionCategoryRepository.findOne.mockResolvedValue(existing);
            keywordService.findAllByCategoryId.mockResolvedValue([
                { id: 1, value: 'OLD' }
            ]);
            const updatedKeyword = { id: 1, value: 'UPDATED' };
            keywordService.findOne.mockResolvedValue(updatedKeyword);
            const savedCat = { ...existing, name: 'New' };
            transactionCategoryRepository.save.mockResolvedValue(savedCat);
            const refreshSpy = jest
                .spyOn(service, 'updateTransactionsAfterCategoriesGetUpdated')
                .mockResolvedValue(undefined);

            const dto = new UpdateCategoryDto(
                'New',
                [new KeywordDto(1, 'UPDATED'), new KeywordDto(undefined as any, 'NEW')],
                0,
                '#fff',
                CategoryType.EXPENSE
            );

            const result = await service.updateCategory(4, dto);

            expect(result).toBe(savedCat);
            expect(keywordService.findOne).toHaveBeenCalledWith(1);
            expect(savedCat).toEqual({ ...savedCat });
            expect(refreshSpy).toHaveBeenCalled();
            refreshSpy.mockRestore();
        });

        it('should not refresh transactions when keywords did not change', async () => {
            transactionCategoryRepository.findOne.mockResolvedValue(existing);
            keywordService.findAllByCategoryId.mockResolvedValue([{ id: 1, value: 'A' }]);
            keywordService.findOne.mockResolvedValue({ id: 1, value: 'NEW' });
            transactionCategoryRepository.save.mockResolvedValue(existing);
            const refreshSpy = jest
                .spyOn(service, 'updateTransactionsAfterCategoriesGetUpdated')
                .mockResolvedValue(undefined);

            const dto = new UpdateCategoryDto(
                'New',
                [new KeywordDto(1, 'NEW')],
                0,
                '#fff',
                CategoryType.EXPENSE
            );

            await service.updateCategory(4, dto);

            expect(refreshSpy).not.toHaveBeenCalled();
            refreshSpy.mockRestore();
        });

        it('should throw BadRequestException when save fails with a unique-keyword violation', async () => {
            transactionCategoryRepository.findOne.mockResolvedValue(existing);
            keywordService.findAllByCategoryId.mockResolvedValue([]);
            keywordService.findOne.mockResolvedValue({ id: 1, value: 'A' });
            transactionCategoryRepository.save.mockRejectedValue({ detail: 'Key (value)=(X) already exists.' });

            const dto = new UpdateCategoryDto(
                'New',
                [new KeywordDto(1, 'A')],
                0,
                '#fff',
                CategoryType.EXPENSE
            );

            await expect(service.updateCategory(4, dto)).rejects.toThrow(BadRequestException);
        });

        it('should swallow other save errors (no throw) and return undefined', async () => {
            transactionCategoryRepository.findOne.mockResolvedValue(existing);
            keywordService.findAllByCategoryId.mockResolvedValue([]);
            keywordService.findOne.mockResolvedValue({ id: 1, value: 'A' });
            transactionCategoryRepository.save.mockRejectedValue({ detail: 'some other failure' });

            const dto = new UpdateCategoryDto(
                'New',
                [new KeywordDto(1, 'A')],
                0,
                '#fff',
                CategoryType.EXPENSE
            );

            const result = await service.updateCategory(4, dto);
            expect(result).toBeUndefined();
        });

        it('should throw NotFoundException when the category does not exist', async () => {
            transactionCategoryRepository.findOne.mockResolvedValue(null);
            const dto = new UpdateCategoryDto(
                'New',
                [],
                0,
                '#fff',
                CategoryType.EXPENSE
            );
            await expect(service.updateCategory(404, dto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('addKeywordForCategory', () => {
        it('should append a new keyword, save the category and refresh transactions', async () => {
            const category = makeCategory({ id: 5 } as any);
            keywordService.findAllByCategoryId.mockResolvedValue([
                { id: 1, value: 'A' }
            ]);
            const saved = { ...category };
            transactionCategoryRepository.save.mockResolvedValue(saved);
            const refreshSpy = jest
                .spyOn(service, 'updateTransactionsAfterCategoriesGetUpdated')
                .mockResolvedValue(undefined);

            const result = await service.addKeywordForCategory(category, 'NEW');

            expect(category.keywords).toHaveLength(2);
            expect(category.keywords[1]).toBeInstanceOf(Keyword);
            expect(category.keywords[1].value).toBe('NEW');
            expect(transactionCategoryRepository.save).toHaveBeenCalledWith(category);
            expect(result).toBe(saved);
            expect(refreshSpy).toHaveBeenCalled();
            refreshSpy.mockRestore();
        });
    });

    describe('updateTransactionsAfterCategoriesGetUpdated', () => {
        const notMapped = makeCategory({ id: 1, name: 'not_mapped' } as any);
        const savingCategory = makeCategory({ id: 20, name: 'Saving' } as any);
        const incomeCategory = makeCategory({ id: 12, name: 'Income' } as any);
        const expenseCategory = makeCategory({ id: 3, name: 'Food' } as any);

        function arrangeTransactions() {
            return [
                makeTransaction({ id: 1, manuallyOverried: true, nameOfPlace: 'SAVE bank', amount: 100 } as any),
                makeTransaction({ id: 2, manuallyOverried: false, nameOfPlace: 'SAVE account', amount: 100 } as any),
                makeTransaction({ id: 3, manuallyOverried: false, nameOfPlace: 'SALARY', amount: 150 } as any),
                makeTransaction({ id: 4, manuallyOverried: false, nameOfPlace: 'COFFEE shop', amount: -10 } as any),
                makeTransaction({ id: 5, manuallyOverried: false, nameOfPlace: 'UNKNOWN thing', amount: 80 } as any),
                makeTransaction({ id: 6, manuallyOverried: false, nameOfPlace: 'UNKNOWN thing', amount: -5 } as any)
            ];
        }

        beforeEach(() => {
            transactionCategoryRepository.createQueryBuilder.mockImplementation((alias: string) => {
                if (alias === 'transaction-category') {
                    return buildQueryableMock(jest.fn().mockResolvedValue([notMapped]));
                }
                return buildQueryableMock(jest.fn().mockResolvedValue([]));
            });
            transactionRepository.createQueryBuilder.mockImplementation(() =>
                buildQueryableMock(jest.fn().mockResolvedValue([]))
            );
            keywordService.findAllByCategoryType.mockImplementation((type: CategoryType) => {
                if (type === CategoryType.SAVING_ACCOUNT) {
                    return Promise.resolve([{ value: 'SAVE', category: savingCategory }]);
                }
                if (type === CategoryType.INCOME) {
                    return Promise.resolve([{ value: 'SAL', category: incomeCategory }]);
                }
                return Promise.resolve([{ value: 'COFFEE', category: expenseCategory }]);
            });
            transactionRepository.save.mockResolvedValue(undefined);
        });

        it('should skip transactions that are manually overridden', async () => {
            jest
                .spyOn(service, 'findAllTransactionsFiltered')
                .mockResolvedValue([arrangeTransactions()[0]]);
            await service.updateTransactionsAfterCategoriesGetUpdated();
            const saved = transactionRepository.save.mock.calls[0][0] as Transaction[];
            expect(saved).toHaveLength(1);
            expect(saved[0].category).not.toBe(savingCategory);
        });

        it('should map a saving-account keyword match first, regardless of amount', async () => {
            const trs = arrangeTransactions();
            jest.spyOn(service, 'findAllTransactionsFiltered').mockResolvedValue([trs[1]]);
            await service.updateTransactionsAfterCategoriesGetUpdated();
            expect(trs[1].category).toBe(savingCategory);
        });

        it('should map income keywords for positive amounts', async () => {
            const trs = arrangeTransactions();
            jest.spyOn(service, 'findAllTransactionsFiltered').mockResolvedValue([trs[2]]);
            await service.updateTransactionsAfterCategoriesGetUpdated();
            expect(trs[2].category).toBe(incomeCategory);
        });

        it('should map expense keywords for non-positive amounts', async () => {
            const trs = arrangeTransactions();
            jest.spyOn(service, 'findAllTransactionsFiltered').mockResolvedValue([trs[3]]);
            await service.updateTransactionsAfterCategoriesGetUpdated();
            expect(trs[3].category).toBe(expenseCategory);
        });

        it('should fallback to not_mapped when no keyword matches for a positive amount', async () => {
            const trs = arrangeTransactions();
            jest.spyOn(service, 'findAllTransactionsFiltered').mockResolvedValue([trs[4]]);
            await service.updateTransactionsAfterCategoriesGetUpdated();
            expect(trs[4].category).toBe(notMapped);
        });

        it('should fallback to not_mapped when no keyword matches for a negative amount', async () => {
            const trs = arrangeTransactions();
            jest.spyOn(service, 'findAllTransactionsFiltered').mockResolvedValue([trs[5]]);
            await service.updateTransactionsAfterCategoriesGetUpdated();
            expect(trs[5].category).toBe(notMapped);
        });

        it('should save the updated transactions array', async () => {
            const trs = arrangeTransactions();
            jest.spyOn(service, 'findAllTransactionsFiltered').mockResolvedValue(trs);
            await service.updateTransactionsAfterCategoriesGetUpdated();
            expect(transactionRepository.save).toHaveBeenCalledWith(trs);
        });
    });

    describe('populateTransactions', () => {
        const notMapped = makeCategory({ id: 1, name: 'not_mapped' } as any);
        const foodCategory = makeCategory({ id: 3, name: 'Food' } as any);
        const incomeCategory = makeCategory({ id: 12, name: 'Income', type: CategoryType.INCOME } as any);
        const savingCategory = makeCategory({ id: 20, name: 'Saving', type: CategoryType.SAVING_ACCOUNT } as any);

        const komercijalnaConfig: any = {
            bankName: 'KOMERCIJALNA BANKA',
            fileFormats: {
                xls: {
                    startRow: 1,
                    columns: { date: 0, name: 1, amount: 3 },
                    hasSeparateIncomeExpense: false
                },
                xlsx: {
                    startRow: 2,
                    columns: { date: 1, name: 2, amount: 4 },
                    hasSeparateIncomeExpense: false
                }
            },
            amountParsing: { europeanNumberFormat: false }
        };

        const nlbConfig: any = {
            bankName: 'NLB BANKA',
            fileFormats: {
                xls: {
                    startRow: 27,
                    columns: { date: 4, name: 5, expense: 15, income: 17 },
                    hasSeparateIncomeExpense: true
                },
                xlsx: {
                    startRow: 28,
                    columns: { date: 5, name: 6, expense: 16, income: 18 },
                    hasSeparateIncomeExpense: true
                }
            },
            amountParsing: { europeanNumberFormat: true }
        };

        beforeEach(() => {
            jest.spyOn(service, 'findAllCategories').mockResolvedValue([
                notMapped,
                foodCategory,
                incomeCategory,
                savingCategory
            ]);
            keywordService.findAllByCategoryType.mockImplementation((type: CategoryType) => {
                if (type === CategoryType.SAVING_ACCOUNT)
                    return Promise.resolve([{ value: 'SAVE', category: savingCategory }]);
                if (type === CategoryType.INCOME)
                    return Promise.resolve([{ value: 'SAL', category: incomeCategory }]);
                return Promise.resolve([{ value: 'TINEX', category: foodCategory }]);
            });
            transactionRepository.save.mockResolvedValue(undefined);
            const allFiltered: Transaction[] = [];
            jest.spyOn(service, 'findAllTransactionsFiltered').mockResolvedValue(allFiltered);
        });

        function xlsFile(): Express.Multer.File {
            return { originalname: 'report.xls', buffer: Buffer.from('') } as any;
        }
        function xlsxFile(): Express.Multer.File {
            return { originalname: 'report.xlsx', buffer: Buffer.from('') } as any;
        }

        it('should parse .xls via the xlsx library using komercijalna config', async () => {
            bankConfigService.getConfig.mockReturnValue(komercijalnaConfig);
            const rows = [
                [],
                ['01.01.2026', 'TINEX', 'x', '100'],
                ['02.01.2026', 'Unknown store', 'x', '50']
            ];
            xlsxReadMock.mockReturnValue({ Sheets: { First: {} }, SheetNames: ['First'] });
            xlsxSheetToJsonMock.mockReturnValue(rows);

            await service.populateTransactions(xlsFile(), 'KOMERCIJALNA BANKA');

            expect(xlsxReadMock).toHaveBeenCalled();
            expect(xlsxSheetToJsonMock).toHaveBeenCalledWith({}, { header: 1 });
            const saved = transactionRepository.save.mock.calls[0][0] as Transaction[];
            expect(saved).toHaveLength(2);
            expect(saved[0].nameOfPlace).toBe('TINEX');
            expect(saved[0].amount).toBe(100);
            expect(saved[0].category).toBe(foodCategory);
            expect(saved[1].category).toBe(notMapped);
        });

        it('should parse .xlsx via exceljs using komercijalna config', async () => {
            bankConfigService.getConfig.mockReturnValue(komercijalnaConfig);
            const rowsToEmit = [
                { rowNumber: 1, values: [null, null, null, null, null] },
                {
                    rowNumber: 2,
                    values: makeValues({ 1: '03.01.2026', 2: 'TINEX', 4: '250' })
                },
                {
                    rowNumber: 3,
                    values: makeValues({ 1: '04.01.2026', 2: 'SAL received', 4: '300' })
                }
            ];
            excelEachRowMock.mockImplementation((opts: any, cb: any) => {
                rowsToEmit.forEach((r) => cb({ values: r.values }, r.rowNumber));
            });

            await service.populateTransactions(xlsxFile(), 'KOMERCIJALNA BANKA');

            const saved = transactionRepository.save.mock.calls[0][0] as Transaction[];
            expect(saved).toHaveLength(2);
            expect(saved[0].nameOfPlace).toBe('TINEX');
            expect(saved[0].amount).toBe(250);
            expect(saved[0].category).toBe(foodCategory);
            expect(saved[1].category).toBe(incomeCategory);
        });

        it('should use separate income/expense columns and european number format for NLB .xls', async () => {
            bankConfigService.getConfig.mockReturnValue(nlbConfig);
            const expenseRow: any[] = [];
            expenseRow[4] = '04.01.2026';
            expenseRow[5] = 'TINEX';
            expenseRow[15] = '1.234,50';
            expenseRow[17] = '';

            const incomeRow: any[] = [];
            incomeRow[4] = '05.01.2026';
            incomeRow[5] = 'SAVE';
            incomeRow[15] = '0';
            incomeRow[17] = '200,00';

            const rows: any[] = [];
            rows[27] = expenseRow;
            rows[28] = incomeRow;

            xlsxReadMock.mockReturnValue({ Sheets: { First: {} }, SheetNames: ['First'] });
            xlsxSheetToJsonMock.mockReturnValue(rows);

            await service.populateTransactions(xlsFile(), 'NLB BANKA');

            const saved = transactionRepository.save.mock.calls[0][0] as Transaction[];
            const expenseTr = saved.find((t) => t.nameOfPlace === 'TINEX');
            const incomeTr = saved.find((t) => t.nameOfPlace === 'SAVE');
            expect(expenseTr).toBeDefined();
            expect(expenseTr!.amount).toBe(-1234.5);
            expect(expenseTr!.category).toBe(foodCategory);
            expect(incomeTr).toBeDefined();
            expect(incomeTr!.amount).toBe(200);
            expect(incomeTr!.category).toBe(savingCategory);
        });

        it('should skip rows where the date cell is empty', async () => {
            bankConfigService.getConfig.mockReturnValue(komercijalnaConfig);
            const rows = [
                [],
                [undefined, 'TINEX', 'x', '100'],
                ['06.01.2026', 'TINEX', 'x', '10']
            ];
            xlsxReadMock.mockReturnValue({ Sheets: { First: {} }, SheetNames: ['First'] });
            xlsxSheetToJsonMock.mockReturnValue(rows);

            await service.populateTransactions(xlsFile(), 'KOMERCIJALNA BANKA');

            const saved = transactionRepository.save.mock.calls[0][0] as Transaction[];
            expect(saved).toHaveLength(1);
            expect(saved[0].nameOfPlace).toBe('TINEX');
        });

        it('should name a transaction without a name cell as TRANSACTION WITHOUT NAME', async () => {
            bankConfigService.getConfig.mockReturnValue(komercijalnaConfig);
            const rows = [[, , ,], ['07.01.2026', null, 'x', '5']];
            xlsxReadMock.mockReturnValue({ Sheets: { First: {} }, SheetNames: ['First'] });
            xlsxSheetToJsonMock.mockReturnValue(rows);

            await service.populateTransactions(xlsFile(), 'KOMERCIJALNA BANKA');

            const saved = transactionRepository.save.mock.calls[0][0] as Transaction[];
            expect(saved[0].nameOfPlace).toBe('TRANSACTION WITHOUT NAME');
        });

        it('should default empty amount cells to 0', async () => {
            bankConfigService.getConfig.mockReturnValue(komercijalnaConfig);
            const rows = [[, , ,], ['08.01.2026', 'TINEX', 'x', '']];
            xlsxReadMock.mockReturnValue({ Sheets: { First: {} }, SheetNames: ['First'] });
            xlsxSheetToJsonMock.mockReturnValue(rows);

            await service.populateTransactions(xlsFile(), 'KOMERCIJALNA BANKA');

            const saved = transactionRepository.save.mock.calls[0][0] as Transaction[];
            expect(saved[0].amount).toBe(0);
        });

        it('should return the result of findAllTransactionsFiltered', async () => {
            bankConfigService.getConfig.mockReturnValue(komercijalnaConfig);
            xlsxReadMock.mockReturnValue({ Sheets: { First: {} }, SheetNames: ['First'] });
            xlsxSheetToJsonMock.mockReturnValue([[]]);
            const filteredResult = [makeTransaction({ id: 99 } as any)];
            (service.findAllTransactionsFiltered as jest.Mock).mockResolvedValue(filteredResult);

            const result = await service.populateTransactions(xlsFile(), 'KOMERCIJALNA BANKA');
            expect(result).toBe(filteredResult);
        });
    });
});

function makeValues(map: Record<number, any>): any[] {
    const values: any[] = [];
    for (const key of Object.keys(map)) {
        values[Number(key)] = map[Number(key)];
    }
    return values;
}
