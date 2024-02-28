import TransactionEntity from './transaction.entity';

type MonthData = {
  name: string;
  expenses: TransactionEntity[];
  income: TransactionEntity[];
  notMapped: TransactionEntity[];
  expensesSum: number;
  incomeSum: number;
  notMappedSum: number;
};

export default MonthData;
