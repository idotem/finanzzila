export default class TransactionDto {
    date: Date;
    nameOfPlace: string;
    amount: number;
    category: number;
    categoryKeyword: string;

    constructor(
        date: Date,
        nameOfPlace: string,
        amount: number,
        category: number,
        categoryKeyword: string
    ) {
        this.date = date;
        this.nameOfPlace = nameOfPlace;
        this.amount = amount;
        this.category = category;
        this.categoryKeyword = categoryKeyword;
    }
}
