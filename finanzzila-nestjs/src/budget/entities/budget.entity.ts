import { Category } from 'src/transaction/entities/category.entity';
import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, Unique } from 'typeorm';

@Entity()
@Unique(['category', 'month'])
export class Budget {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 7 }) // Format: YYYY-MM
    month: string;

    @Column({ type: 'double' })
    amount: number;

    @ManyToOne(() => Category, { nullable: false, eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    constructor(month: string, amount: number, category: Category) {
        this.month = month;
        this.amount = amount;
        this.category = category;
    }
}
