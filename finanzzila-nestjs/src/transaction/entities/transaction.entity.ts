import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Category } from './category.entity';

@Entity()
export default class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'varchar', length: 255, name: 'name_of_place' })
    nameOfPlace: string;

    @Column({ type: 'int' })
    amount: number;

    @ManyToOne(() => Category, (category) => category.transactions, {
        nullable: false,
        eager: true,
        cascade: false
    })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @Column({ type: 'boolean', default: false, name: 'manually_overried' })
    manuallyOverried: boolean;

    constructor(date: Date, nameOfPlace: string, amount: number, category: Category) {
        this.date = date;
        this.nameOfPlace = nameOfPlace;
        this.amount = amount;
        this.category = category;
    }
}
