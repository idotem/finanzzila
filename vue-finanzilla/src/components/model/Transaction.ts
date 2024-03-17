import type { TransactionCategory } from './TransactionCategory';

export default class Transaction {
    id: number;
    date: Date;
    nameOfPlace: string;
    amount: number;
    category: TransactionCategory;

    constructor(
        id: number,
        date: Date,
        nameOfPlace: string,
        amount: number,
        category: TransactionCategory
    ) {
        this.id = id;
        this.date = date;
        this.nameOfPlace = nameOfPlace;
        this.amount = amount;
        this.category = category;
    }
}
