import axiosInstance from '@/config/axios/axios';
import { TransactionCategory } from '../model/TransactionCategory';

export default class CategoryService {
    static async getAllCategories(): Promise<TransactionCategory[]> {
        const res = await axiosInstance.get('/transaction-categories');
        const categories: TransactionCategory[] = res.data.map(
            (t: any) => new TransactionCategory(t.id, t.name)
        );
        return categories;
    }
}
