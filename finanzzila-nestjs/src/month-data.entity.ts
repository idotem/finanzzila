import TransactionEntity from './transaction.entity';

type MonthData = {
  name: string;
  expenses: TransactionEntity[];
  income: TransactionEntity[];
  notMapped: TransactionEntity[];
};

export default MonthData;
