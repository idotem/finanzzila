import { TransactionCategory } from "../../transaction-category/entity/transaction-category.entity";
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from "typeorm";

@Entity()
export default class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'varchar', length: 50 })
    nameOfPlace: string;

    @Column({ type: 'int' })
    amount: number;

    @ManyToOne(() => TransactionCategory, category => category.transactions)
    @JoinColumn({ name: 'category_id' })
    category: TransactionCategory;

    constructor(date: Date, nameOfPlace: string,
        amount: number, category: TransactionCategory) {
        this.date = date;
        this.nameOfPlace = nameOfPlace;
        this.amount = amount;
        this.category = category;
    }
}
