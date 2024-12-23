import { Keyword } from 'src/keyword/entities/keyword.entity';
import Transaction from './transaction.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'name', unique: true })
    name: string;

    @OneToMany(() => Transaction, (transaction) => transaction.category)
    @JoinColumn({ name: 'transaction_id' })
    transactions: Transaction[];

    @OneToMany(() => Keyword, (keyword) => keyword.category, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        cascade: true,
        eager: false
    })
    @JoinColumn({ name: 'keyword_id' })
    keywords: Keyword[];

    @Column({ name: 'isWants', nullable: true })
    isWants: number;

    @Column({ name: 'color', nullable: true })
    color: string;

    @Column({ name: 'isExpense', nullable: false, default: true })
    isExpense: boolean;

    constructor(
        name: string,
        keywords: Keyword[],
        isWants: number,
        color: string,
        isExpense: boolean
    ) {
        this.name = name;
        this.keywords = keywords;
        this.isWants = isWants;
        this.color = color;
        this.isExpense = isExpense;
    }
}
