import { TransactionCategory } from "./category.entity";

export default class Transaction {
    date: Date;
    nameOfPlace: string;
    amount: number;
    category: TransactionCategory;

    constructor(date: Date, nameOfPlace: string,
                amount: number, category: TransactionCategory){
        this.date = date;
        this.nameOfPlace = nameOfPlace;
        this.amount = amount;
        this.category = category;
    }
}
