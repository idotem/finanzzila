import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { Budget } from './entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Controller('budgets')
export class BudgetController {
    constructor(private readonly budgetService: BudgetService) {}

    @Get('/month/:month')
    async findBudgets(@Param('month') month: string): Promise<Budget[]> {
        return await this.budgetService.findBudgetsByMonth(month);
    }

    @Post()
    async saveBudgets(@Body() createBudgetDtos: CreateBudgetDto[]): Promise<Budget[]> {
        return await this.budgetService.saveBudgets(createBudgetDtos);
    }

    @Get()
    async findAllBudgets(): Promise<Budget[]> {
        return await this.budgetService.findAllBudgets();
    }

    @Delete('/month/:month')
    async deleteBudgetsByMonth(@Param('month') month: string): Promise<void> {
        return await this.budgetService.deleteBudgetsByMonth(month);
    }

    @Delete('/:id')
    async deleteBudget(@Param('id') id: string): Promise<void> {
        return await this.budgetService.deleteBudget(+id);
    }

    @Delete()
    async deleteAllBudgets(): Promise<void> {
        return await this.budgetService.deleteAllBudgets();
    }
}
