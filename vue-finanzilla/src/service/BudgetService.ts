import axiosInstance from '@/config/axios/axios';

export default class TransactionService {
    static async getBudgets(month: string): Promise<any[]> {
        const res = await axiosInstance.get(`/budgets/${month}`, {
            params: { month }
        });
        return res.data;
    }

    static async getAllBudgets(): Promise<any[]> {
        const res = await axiosInstance.get('/budgets');
        return res.data;
    }

    static async saveBudgets(budgets: { month: string; amount: number; categoryId: number }[]): Promise<any[]> {
        const res = await axiosInstance.post('/budgets', budgets);
        return res.data;
    }

    static async deleteBudget(id: number): Promise<void> {
        await axiosInstance.delete(`/budgets/${id}`);
    }

    static async deleteBudgetsByMonth(month: string): Promise<void> {
        await axiosInstance.delete(`/budgets/month/${month}`);
    }

    static async deleteAllBudgets(): Promise<void> {
        await axiosInstance.delete('/budgets');
    }
}
