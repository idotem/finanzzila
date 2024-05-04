import axiosInstance from '@/config/axios/axios';
import { TransactionCategory } from '../components/model/TransactionCategory';
import { Category } from '@/components/model/Category';

export default class CategoryService {
    static async getAllTransactionCategories(): Promise<TransactionCategory[]> {
        const res = await axiosInstance.get('/transaction-categories');
        const categories: TransactionCategory[] = res.data.map(
            (t: any) => new TransactionCategory(t.id, t.name)
        );
        return categories;
    }
    static async getAllCategories(): Promise<Category[]> {
        const res = await axiosInstance.get('/transaction-categories');
        const categories: Category[] = res.data.map(
            (t: any) => new Category(t.id, t.name, t.keywords)
        );
        return categories;
    }
}
