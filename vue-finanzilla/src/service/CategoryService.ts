import axiosInstance from '@/config/axios/axios';
import { TransactionCategory } from '../components/model/TransactionCategory';
import { Category } from '@/components/model/Category';
import type CategoryDto from '@/components/model/CategoryDto';
import KeywordDto from '@/components/model/KeywordDto';

export default class CategoryService {
    static async getAllTransactionCategories(): Promise<TransactionCategory[]> {
        const res = await axiosInstance.get('/transaction-categories');
        const categories: TransactionCategory[] = res.data.map(
            (t: any) => new TransactionCategory(t.id, t.name, t.isWants, t.color)
        );
        return categories;
    }

    static async getAllCategories(): Promise<Category[]> {
        const res = await axiosInstance.get('/transaction-categories');
        console.log(res);
        const categories: Category[] = res.data.map(
            (t: any) =>
                new Category(
                    t.id,
                    t.name,
                    t.keywords.map((k: KeywordDto) => new KeywordDto(k.id, k.value)),
<<<<<<< HEAD
                    t.isWants,
                    t.color
=======
                    t.isWants
>>>>>>> main
                )
        );
        console.log(categories);
        return categories;
    }

    static async create(createCategoryDto: CategoryDto): Promise<Category | any> {
        const res = await axiosInstance.post<Category>(
            '/transaction-categories',
            createCategoryDto
        );
        return res;
    }

    static async update(id: number, updatingItem: CategoryDto): Promise<Category | any> {
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
