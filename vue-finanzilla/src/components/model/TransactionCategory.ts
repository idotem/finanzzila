import { CategoryType } from './CategoryType';

export class TransactionCategory {
    id: number;
    name: string;
    isWants: number;
    color: string;
    type: CategoryType | undefined;

    constructor(id: number, name: string, isWants: number, color: string, type: CategoryType) {
        this.id = id;
        this.name = name;
        this.isWants = isWants;
        this.color = color;
        this.type = type;
    }
}
