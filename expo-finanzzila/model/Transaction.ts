import { Category } from './Category';

export interface Transaction {
    id: number;
    amount: number;
    date: Date;
    category: Category;
    nameOfPlace: string;
    manualOverride: boolean;
}
