export class TransactionCategory {
    id: number;
    name: string;
    isWants: number;
    color: string;

    constructor(id: number, name: string, isWants: number, color: string) {
        this.id = id;
        this.name = name;
        this.isWants = isWants;
        this.color = color;
    }
}
