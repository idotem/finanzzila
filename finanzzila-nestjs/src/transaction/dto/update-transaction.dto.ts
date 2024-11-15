import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
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
        super(false);
        this.date = date;
        this.nameOfPlace = nameOfPlace;
        this.amount = amount;
        this.category = category;
        this.categoryKeyword = categoryKeyword;
    }
}
