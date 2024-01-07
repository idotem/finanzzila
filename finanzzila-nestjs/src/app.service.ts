import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import TransactionEntity from './transaction.entity';
import MonthData from './month-data.entity';
import YearData from './year-data.entity';

@Injectable()
export class AppService {
  filePathHome =
    '/home/meto/personal-projects/learning-nest/finanzzila/finanzzila-nestjs/monthly-reports/';
  expenses: TransactionEntity[] = [];
  income: TransactionEntity[] = [];
  notMapped: TransactionEntity[] = [];

  populateExpensesMap(): void {
    this.expenses.push({ name: 'ALIEXPRESS', value: 0.0 });
    this.expenses.push({ name: 'ATM', value: 0.0 });
    this.expenses.push({ name: 'BOOKS', value: 0.0 });
    this.expenses.push({ name: 'CAFE_AND_BARS', value: 0.0 });
    this.expenses.push({ name: 'CLOTHES_AND_WEARABLES', value: 0.0 });
    this.expenses.push({ name: 'EDUCATION', value: 0.0 });
    this.expenses.push({ name: 'ENTERTAINMENT', value: 0.0 });
    this.expenses.push({ name: 'FOOD', value: 0.0 });
    this.expenses.push({ name: 'FUEL_AND_CAR', value: 0.0 });
    this.expenses.push({ name: 'GIFTS', value: 0.0 });
    this.expenses.push({ name: 'HYGIENE', value: 0.0 });
    this.expenses.push({ name: 'INVESTING_AND_FEES', value: 0.0 });
    this.expenses.push({ name: 'MARKETS', value: 0.0 });
    this.expenses.push({ name: 'MEDICAL', value: 0.0 });
    this.expenses.push({ name: 'RESTAURANTS', value: 0.0 });
    this.expenses.push({ name: 'SNACKS_AND_WATER', value: 0.0 });
    this.expenses.push({ name: 'SOFTWARE_AND_HARDWARE', value: 0.0 });
    this.expenses.push({ name: 'EVERYTHING_STORE', value: 0.0 });
  }

  updateAmountForCategoryInExpenses(category: string, amount: number): void {
    const expense = this.expenses.find((e) => e.name === category);
    expense.value += amount;
  }

  addNotMappedToOrdinaryMap(name: string, amount: number): void {
    let expense = this.expenses.find((e) => e.name === name);
    if (expense !== undefined) {
      expense.value += amount;
    } else {
      expense = { name: name, value: amount };
      this.notMapped.push(expense);
    }
  }

  addIncomeTransaticionToIncomeMap(name: string, amount: number) {
    this.income.push({ name: name, value: amount });
  }

  updateAmountForCategoryInIncome(category: string, amount: number) {
    const expense = this.expenses.find((e) => e.name === category);
    expense.value += amount;
  }

  checkIfNameOfTransactionContainsGivenWord(
    nameOfTransactionPlace: string,
    wordThatsContained: string,
  ): boolean {
    return nameOfTransactionPlace.includes(wordThatsContained);
  }

  mapAndFillMaps(
    nameOfTransactionPlace: string,
    amountOfTransaction: number,
  ): void {
    if (amountOfTransaction > 0) {
      this.addIncomeTransaticionToIncomeMap(
        nameOfTransactionPlace,
        amountOfTransaction,
      );
      return;
    }
    switch (true) {
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'BP ',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'B.S. ',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'MAKPETROL',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'OKTA',
      ): {
        if (Math.abs(amountOfTransaction) >= 1000) {
          this.updateAmountForCategoryInExpenses(
            'FUEL_AND_CAR',
            amountOfTransaction - (amountOfTransaction % 1000),
          );
          this.updateAmountForCategoryInExpenses(
            'SNACKS_AND_WATER',
            amountOfTransaction % 1000,
          );
        } else {
          this.updateAmountForCategoryInExpenses(
            'SNACKS_AND_WATER',
            amountOfTransaction,
          );
        }
        break;
      }
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'BON APETIT',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'SILBO-CENTAR',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'RESTORAN MIDA SKOPJE',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'ROJAL BURGER',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'M S BEJKERI',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'BIFE',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'GURMAN',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'VRSHNIK',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'MESARNICA',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'GIRO',
      ): {
        this.updateAmountForCategoryInExpenses('FOOD', amountOfTransaction);
        break;
      }
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'TINEKS',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'LA NOI',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'CENA TREJD',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'KAM',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'MARKETI',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'Ramstor',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'RAMSTOR',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'VERO',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'ZUR',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'MARKET',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'STOKOMAK',
      ): {
        this.updateAmountForCategoryInExpenses('MARKETS', amountOfTransaction);
        break;
      }
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        '230706724686',
      ): {
        this.updateAmountForCategoryInExpenses(
          'INVESTING_AND_FEES',
          amountOfTransaction,
        );
        break;
      }
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'LITERATURA',
      ): {
        this.updateAmountForCategoryInExpenses('BOOKS', amountOfTransaction);
        break;
      }
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'KOFI',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'BAR',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'HOTEL',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'KAFE',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'LITERATURA',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'LITERATURA',
      ): {
        if (amountOfTransaction <= 300) {
          this.updateAmountForCategoryInExpenses(
            'CAFE_AND_BARS',
            amountOfTransaction,
          );
        } else {
          this.updateAmountForCategoryInExpenses(
            'RESTAURANTS',
            amountOfTransaction,
          );
        }
        break;
      }
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'DM DROGERIE',
      ): {
        this.updateAmountForCategoryInExpenses('HYGIENE', amountOfTransaction);
        break;
      }
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'CINEPLEXX',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'KUPIKARTA',
      ): {
        this.updateAmountForCategoryInExpenses(
          'ENTERTAINMENT',
          amountOfTransaction,
        );
        break;
      }
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'VAIKIKI',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'ZARA',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'NJU JORKER',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'KOTON',
      ): {
        this.updateAmountForCategoryInExpenses(
          'CLOTHES_AND_WEARABLES',
          amountOfTransaction,
        );
        break;
      }
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'ANHOC',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'NEPTUN',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'SETEK',
      ): {
        this.updateAmountForCategoryInExpenses(
          'SOFTWARE_AND_HARDWARE',
          amountOfTransaction,
        );
        break;
      }
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'ALIEXPRESS',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'aliexpress',
      ): {
        this.updateAmountForCategoryInExpenses(
          'ALIEXPRESS',
          amountOfTransaction,
        );
        break;
      }
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'APTEKA',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'VIOLA',
      ): {
        this.updateAmountForCategoryInExpenses('MEDICAL', amountOfTransaction);
        break;
      }
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'KBSATM',
      ): {
        this.updateAmountForCategoryInExpenses('ATM', amountOfTransaction);
        break;
      }
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'CVEKARNICA',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'PANDORA',
      ): {
        this.updateAmountForCategoryInExpenses('GIFTS', amountOfTransaction);
        break;
      }
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'JUSK',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'JUMBO',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'BAZARO',
      ): {
        this.updateAmountForCategoryInExpenses(
          'EVERYTHING_STORE',
          amountOfTransaction,
        );
        break;
      }
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'IKNOW.UKIM.MK',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'EKVUS',
      ): {
        this.updateAmountForCategoryInExpenses(
          'EDUCATION',
          amountOfTransaction,
        );
        break;
      }
      default: {
        this.addNotMappedToOrdinaryMap(
          nameOfTransactionPlace,
          amountOfTransaction,
        );
        break;
      }
    }
  }

  mapAndFillIncome(
    nameOfTransactionPlace: string,
    amountOfTransaction: number,
  ) {
    switch (true) {
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'ЕУРО-ЛЕВЕЛ',
      ):
      case this.checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace,
        'ИНТЕЛИГЕНТА',
      ):
        this.updateAmountForCategoryInIncome('WAGE', amountOfTransaction);
      default:
        this.updateAmountForCategoryInIncome('OTHER', amountOfTransaction);
    }
  }

  replaceCommasBetweenDoubleQuoutesWithEmptyString(row: string): string {
    const regex = /"([^"]*)"/g;
    const result = row.replace(regex, (group) => {
      return `"${group.replace(/,/g, '')}"`;
    });
    return result;
  }

  removeDoubleQuoutesFromRows(row: string): string {
    const withoutQuotes = row.replace(/"/g, '');
    const regex = /"([^"]*)"/g;
    const result = withoutQuotes.replace(regex, (group) => {
      return `"${group.replace(/,/g, '.')}"`;
    });
    return result;
  }

  fillTransactions(transactionFile: string): void {
    const transactionAmountIndex = 3;
    const transactionNameIndex = 1;
    // const transactionFile = fs.readFileSync(this.filePathHome, 'utf-8');
    const rows: string[] = transactionFile.split('\n');
    for (let i = 1; i < rows.length - 1; i++) {
      rows[i] = this.replaceCommasBetweenDoubleQuoutesWithEmptyString(rows[i]);
      rows[i] = this.removeDoubleQuoutesFromRows(rows[i]);
      const columns: string[] = rows[i].split(',');
      const nameOfTransactionPlace: string = columns[transactionNameIndex];
      const amountOfTransaction: number = parseInt(
        columns[transactionAmountIndex],
      );
      if (nameOfTransactionPlace && amountOfTransaction) {
        this.mapAndFillMaps(nameOfTransactionPlace, amountOfTransaction);
      }
    }
  }

  getMonthName(monthNumber: number): string {
    switch (monthNumber) {
      case 1:
        return 'January';
      case 2:
        return 'February';
      case 3:
        return 'March';
      case 4:
        return 'April';
      case 5:
        return 'May';
      case 6:
        return 'June';
      case 7:
        return 'July';
      case 8:
        return 'August';
      case 9:
        return 'September';
      case 10:
        return 'October';
      case 11:
        return 'November';
      case 12:
        return 'December';
    }
  }

  getExpenses(year: string): YearData {
    let file: string;
    const allData: YearData = { months: [] };
    for (let i = 1; i <= 12; i++) {
      try {
        file = fs.readFileSync(
          this.filePathHome + year + '/' + i + '.csv',
          'utf-8',
        );
      } catch (e) {
        continue;
      }
      this.expenses = [];
      this.income = [];
      this.notMapped = [];
      this.populateExpensesMap();
      this.fillTransactions(file);
      const data: MonthData = {
        name: this.getMonthName(i),
        expenses: this.expenses,
        income: this.income,
        notMapped: this.notMapped,
      };
      allData.months.push(data);
    }
    return allData;
  }
}
