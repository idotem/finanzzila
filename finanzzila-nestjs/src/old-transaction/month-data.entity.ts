import TransactionEntity from './old-trans.type';

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
