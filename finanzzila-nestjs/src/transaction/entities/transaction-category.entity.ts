import { Keyword } from 'src/keyword/entities/keyword.entity';
import Transaction from '../../transaction/entities/transaction.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';

@Entity()
export class TransactionCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'name', unique: true })
    name: string;

    @OneToMany(() => Transaction, (transaction) => transaction.category)
    @JoinColumn({ name: 'transaction_id' })
    transactions: Transaction[];

    @OneToMany(() => Keyword, (keyword) => keyword.category, {
        onDelete: 'CASCADE',
        cascade: true,
        eager: false
    })
    @JoinColumn({ name: 'keyword_id' })
    keywords: Keyword[];

    @Column({ name: 'isWants', nullable: true })
    isWants: number;

<<<<<<< HEAD
    @Column({ name: 'color', nullable: true })
    color: string;

    constructor(name: string, keywords: Keyword[], isWants: number, color: string) {
        this.name = name;
        this.keywords = keywords;
        this.isWants = isWants;
        this.color = color;
=======
    constructor(name: string, keywords: Keyword[], isWants: number) {
        this.name = name;
        this.keywords = keywords;
        this.isWants = isWants;
>>>>>>> main
    }
}
