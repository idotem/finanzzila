import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Category } from './category.entity';

@Entity()
export default class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'date',
        transformer: {
            to: (value: any) => {
                if (!value) return value;
                let date = value instanceof Date ? value : new Date(value);
                if (isNaN(date.getTime()) && typeof value === 'string' && value.includes('.')) {
                    const parts = value.split('.');
                    if (parts.length === 3) {
                        date = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
                    }
                }
                if (isNaN(date.getTime())) return value;
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            },
            from: (value: any) => {
                if (!value) return value;
                if (value instanceof Date) return value;
                if (typeof value === 'string' && value.includes('.')) {
                    const parts = value.split('.');
                    if (parts.length === 3) {
                        return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
                    }
                }
                return new Date(value);
            }
        }
    })
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
