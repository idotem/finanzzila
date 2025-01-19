import type Transaction from '../model/Transaction';

export default class CommonCalculations {
    static countMonths(transactions: Transaction[]): number {
        const uniqueMonths = new Set();
        for (const transaction of transactions) {
            const date = new Date(transaction.date);
            uniqueMonths.add(date.getMonth() + '.' + date.getFullYear());
        }
        if (uniqueMonths.size <= 1) {
            return 1;
        }
        return uniqueMonths.size;
    }

    static countYears(transactions: Transaction[]): number {
        const uniqueYears = new Set();
        for (const transaction of transactions) {
            const date = new Date(transaction.date);
            uniqueYears.add(date.getFullYear());
        }
        if (uniqueYears.size <= 1) {
            return 1;
        }
        return uniqueYears.size;
    }

    static getDelimiterBasedOnTimePeriod(transactions: Transaction[], timePeriod: string) {
        switch (timePeriod) {
            case 'All time':
                return 1;
            case 'Monthly':
                return CommonCalculations.countMonths(transactions);
            case 'Yearly':
                return CommonCalculations.countYears(transactions);
            default:
                return 1;
        }
    }
}
