import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BudgetService } from './budget.service';
import { Budget } from './entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { TransactionService } from 'src/transaction/transaction.service';

describe('BudgetService', () => {
    let service: BudgetService;
    let budgetRepository: Partial<Record<keyof Repository<Budget>, jest.Mock>>;
    let transactionServiceMock: { findCategoryById: jest.Mock };

    beforeEach(async () => {
        budgetRepository = {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn()
        };
        transactionServiceMock = { findCategoryById: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BudgetService,
                { provide: getRepositoryToken(Budget), useValue: budgetRepository },
                { provide: TransactionService, useValue: transactionServiceMock }
            ]
        }).compile();

        service = module.get<BudgetService>(BudgetService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findBudgetsByMonth', () => {
        it('should find budgets with category relation filtered by month', async () => {
            const budgets: any[] = [{ id: 1, month: '2026-07', amount: 100 }];
            budgetRepository.find.mockResolvedValue(budgets);

            const result = await service.findBudgetsByMonth('2026-07');

            expect(result).toBe(budgets);
            expect(budgetRepository.find).toHaveBeenCalledWith({
                where: { month: '2026-07' },
                relations: ['category']
            });
        });
    });

    describe('findAllBudgets', () => {
        it('should find all budgets with category relation ordered by month DESC', async () => {
            const budgets: any[] = [{ id: 1, month: '2026-07' }, { id: 2, month: '2026-06' }];
            budgetRepository.find.mockResolvedValue(budgets);

            const result = await service.findAllBudgets();

            expect(result).toBe(budgets);
            expect(budgetRepository.find).toHaveBeenCalledWith({
                relations: ['category'],
                order: { month: 'DESC' }
            });
        });
    });

    describe('saveBudgets', () => {
        it('should do nothing and return an empty array when given no DTOs', async () => {
            const result = await service.saveBudgets([]);
            expect(result).toEqual([]);
            expect(budgetRepository.save).not.toHaveBeenCalled();
        });

        it('should create a new Budget when no existing budget is found for the month/category', async () => {
            const category: any = { id: 3, name: 'Food' };
            transactionServiceMock.findCategoryById.mockResolvedValue(category);
            budgetRepository.findOne.mockResolvedValue(null);
            const saved: any = { id: 10, month: '2026-07', amount: 500, category };
            budgetRepository.save.mockResolvedValue(saved);

            const dtos: CreateBudgetDto[] = [
                { month: '2026-07', amount: 500, categoryId: 3 }
            ];

            const result = await service.saveBudgets(dtos);

            expect(transactionServiceMock.findCategoryById).toHaveBeenCalledWith(3);
            expect(budgetRepository.findOne).toHaveBeenCalledWith({
                where: { month: '2026-07', category: { id: 3 } }
            });
            expect(budgetRepository.save).toHaveBeenCalledTimes(1);
            expect(budgetRepository.save.mock.calls[0][0]).toBeInstanceOf(Budget);
            expect(result).toEqual([saved]);
        });

        it('should update the amount of an existing budget', async () => {
            const category: any = { id: 3, name: 'Food' };
            const existing: any = { id: 9, month: '2026-07', amount: 100, category };
            transactionServiceMock.findCategoryById.mockResolvedValue(category);
            budgetRepository.findOne.mockResolvedValue(existing);
            budgetRepository.save.mockResolvedValue(existing);

            const dtos: CreateBudgetDto[] = [
                { month: '2026-07', amount: 750, categoryId: 3 }
            ];

            const result = await service.saveBudgets(dtos);

            expect(existing.amount).toBe(750);
            expect(budgetRepository.save).toHaveBeenCalledWith(existing);
            expect(result).toEqual([existing]);
        });

        it('should save a budget per DTO and preserve order when given multiple DTOs', async () => {
            transactionServiceMock.findCategoryById.mockResolvedValue({ id: 1 });
            budgetRepository.findOne.mockResolvedValue(null);
            budgetRepository.save
                .mockResolvedValueOnce('saved-1')
                .mockResolvedValueOnce('saved-2');

            const dtos: CreateBudgetDto[] = [
                { month: '2026-07', amount: 10, categoryId: 1 },
                { month: '2026-07', amount: 20, categoryId: 1 }
            ];

            const result = await service.saveBudgets(dtos);

            expect(budgetRepository.save).toHaveBeenCalledTimes(2);
            expect(result).toEqual(['saved-1', 'saved-2']);
        });
    });

    describe('deleteBudget', () => {
        it('should delete a budget by id', async () => {
            await service.deleteBudget(5);
            expect(budgetRepository.delete).toHaveBeenCalledWith(5);
        });
    });

    describe('deleteBudgetsByMonth', () => {
        it('should delete budgets filtered by month', async () => {
            await service.deleteBudgetsByMonth('2026-07');
            expect(budgetRepository.delete).toHaveBeenCalledWith({ month: '2026-07' });
        });
    });

    describe('deleteAllBudgets', () => {
        it('should delete all budgets with an empty criteria', async () => {
            await service.deleteAllBudgets();
            expect(budgetRepository.delete).toHaveBeenCalledWith({});
        });
    });
});