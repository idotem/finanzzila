import { Category } from 'src/transaction/entities/category.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@Index(['category', 'value'], { unique: true })
export class Keyword {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Category, (category) => category.transactions, {
        onDelete: 'CASCADE',
        eager: true,
        nullable: false,
        orphanedRowAction: 'delete', // Automatically delete orphaned rows
    })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @Column({ type: 'varchar', length: 200, unique: true })
    value: string;

    constructor(value: string) {
        this.value = value;
    }
}
