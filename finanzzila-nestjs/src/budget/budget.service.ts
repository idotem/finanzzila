import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Budget } from './entities/budget.entity';
import { Repository } from 'typeorm';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class BudgetService {
    constructor(
        private readonly transactionService: TransactionService,
        @InjectRepository(Budget)
        private readonly budgetRepository: Repository<Budget>
    ) {}

    async findBudgetsByMonth(month: string): Promise<Budget[]> {
        return await this.budgetRepository.find({
            where: { month },
            relations: ['category']
        });
    }

    async findAllBudgets(): Promise<Budget[]> {
        return await this.budgetRepository.find({
            relations: ['category'],
            order: { month: 'DESC' }
        });
    }

    async saveBudgets(createBudgetDtos: CreateBudgetDto[]): Promise<Budget[]> {
        const savedBudgets: Budget[] = [];
        for (const dto of createBudgetDtos) {
            const category = await this.transactionService.findCategoryById(dto.categoryId);
            let budget = await this.budgetRepository.findOne({
                where: { month: dto.month, category: { id: dto.categoryId } }
            });
            if (budget) {
                budget.amount = dto.amount;
            } else {
                budget = new Budget(dto.month, dto.amount, category);
            }
            savedBudgets.push(await this.budgetRepository.save(budget));
        }
        return savedBudgets;
    }

    async deleteBudget(id: number): Promise<void> {
        await this.budgetRepository.delete(id);
    }

    async deleteBudgetsByMonth(month: string): Promise<void> {
        await this.budgetRepository.delete({ month });
    }

    async deleteAllBudgets(): Promise<void> {
        await this.budgetRepository.delete({});
    }
}
