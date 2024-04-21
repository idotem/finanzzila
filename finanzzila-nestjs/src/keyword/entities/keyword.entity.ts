import { TransactionCategory } from "src/transaction-category/entity/transaction-category.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Keyword {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => TransactionCategory, category => category.transactions)
    @JoinColumn({name: 'category_id'})
    category: TransactionCategory;

    @Column({ type: 'varchar', length: 200 })
    value: string;

    constructor(value: string, category: TransactionCategory) {
        this.category = category;
        this.value = value;
    }
}

