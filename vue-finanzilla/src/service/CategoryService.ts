import axiosInstance from '@/config/axios/axios';
import { TransactionCategory } from '../components/model/TransactionCategory';
import { Category } from '@/components/model/Category';
import type CategoryDto from '@/components/model/CategoryDto';

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

    static async create(
        createCategoryDto: CategoryDto
    ): Promise<Category | any> {
        const res = await axiosInstance.post<Category>(
            '/transaction-categories',
            createCategoryDto
        );
        return res;
    }

    static async update(
        id: number,
        updatingItem: CategoryDto
    ): Promise<Category | any> {
        const res = await axiosInstance.put<Category>(
            `/transaction-categories/${id}`,
            updatingItem
        );
        return res;
    }

    static async delete(id: number): Promise<void> {
        await axiosInstance.delete(`/transaction-categories/${id}`);
    }
}
