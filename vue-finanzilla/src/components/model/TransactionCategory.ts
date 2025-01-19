export class TransactionCategory {
    id: number;
    name: string;
    isWants: number;
    color: string;
    isExpense: number | undefined;

    constructor(id: number, name: string, isWants: number, color: string, isExpense: number) {
        this.id = id;
        this.name = name;
        this.isWants = isWants;
        this.color = color;
        this.isExpense = isExpense;
    }
}
