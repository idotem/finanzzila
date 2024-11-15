export class TransactionCategory {
    id: number;
    name: string;
    isWants: number;

    constructor(id: number, name: string, isWants: number) {
        this.id = id;
        this.name = name;
        this.isWants = isWants;
    }
}
