import axiosInstance from '@/config/axios/axios';
import { TransactionCategory } from '../components/model/TransactionCategory';
import { Category } from '@/components/model/Category';
import { CreateKeywordDto } from '@/components/model/CreateKeywordDto';

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

    static async addKeywordForCategory(
        categoryId: number,
        keyword: string
    ): Promise<void> {
        await axiosInstance.post(
            '/keywords',
            new CreateKeywordDto(categoryId, keyword)
        );
    }
}
