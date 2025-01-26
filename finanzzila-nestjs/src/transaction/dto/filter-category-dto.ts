export class CategoryFilterDto {
    name: string | undefined;
    isWants: number | undefined;
    isExpense: number | undefined;

    constructor(name: string, isWants: number, isExpense: number) {
        this.name = name;
        this.isWants = isWants;
        this.isExpense = isExpense;
    }
}
