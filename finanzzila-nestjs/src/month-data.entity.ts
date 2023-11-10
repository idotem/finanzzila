import TransactionEntity from './transaction.entity';

export type MonthData = {
  expenses: TransactionEntity[];
  income: TransactionEntity[];
  notMapped: TransactionEntity[];
};
