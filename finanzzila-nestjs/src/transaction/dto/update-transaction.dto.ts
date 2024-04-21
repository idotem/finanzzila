import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
    date: Date;
    nameOfPlace: string;
    amount: number;
    category: number;

    constructor(date: Date, nameOfPlace: string, amount: number,
        category: number) {
        super(false);
        this.date = date;
        this.nameOfPlace = nameOfPlace;
        this.amount = amount;
        this.category = category;
    }
}
