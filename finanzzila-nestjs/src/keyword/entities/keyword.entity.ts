import { TransactionCategory } from "src/transaction/entities/transaction-category.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@Index(["category", "value"], { unique: true })
export class Keyword {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => TransactionCategory, category => category.transactions, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({name: 'category_id'})
    category: TransactionCategory;

    @Column({ type: 'varchar', length: 200, unique: true})
    value: string;

    constructor(value: string) {
        this.value = value;
    }
}

