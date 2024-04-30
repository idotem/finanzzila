export default class TransactionDto{
    date: Date;
    nameOfPlace: string;
    amount: number;
    category: number;

    constructor(
        date: Date,
        nameOfPlace: string,
        amount: number,
        category: number 
    ) {
        this.date = date;
        this.nameOfPlace = nameOfPlace;
        this.amount = amount;
        this.category = category;
    }
}
