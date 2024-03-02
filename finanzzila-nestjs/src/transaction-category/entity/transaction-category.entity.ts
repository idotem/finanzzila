import Transaction from '../../transaction/entities/transaction.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';

@Entity()
export class TransactionCategory {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({name: 'name', unique: true})
  name: string;

  @OneToMany(() => Transaction, transaction => transaction.category)
  @JoinColumn({name: 'transaction_id'})
  transactions: Transaction[];

  constructor(name: string) {
      this.name = name;
  }
}

