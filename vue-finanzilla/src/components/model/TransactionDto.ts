export default class TransactionDto {
    id: number | undefined;
    date: Date | undefined;
    nameOfPlace: string | undefined;
    amount: number | undefined;
    category: number | undefined;
    categoryKeyword: string | undefined;

    constructor(
        id: number | undefined,
        date: Date | undefined,
        nameOfPlace: string | undefined,
        amount: number | undefined,
        category: number | undefined,
        categoryKeyword: string | undefined
    ) {
        this.id = id;
        this.date = date;
        this.nameOfPlace = nameOfPlace;
        this.amount = amount;
        this.category = category;
        this.categoryKeyword = categoryKeyword;
    }
}
