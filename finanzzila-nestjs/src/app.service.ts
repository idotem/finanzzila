import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import ExpensesEntity from './expenses.entity';
import IncomeEntity from './income.entity';
import NotMappedExpensesAndIncomeEntity from './notmapped.expenses.entity';

@Injectable()
export class AppService {
  expenses: ExpensesEntity[] = [];
  income: IncomeEntity[] = [];
  notMapped: NotMappedExpensesAndIncomeEntity[] = [];

  getHello(): string {
    return 'Hello';
  }

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
    this.expenses.push({ name: 'UTILITIES', value: 0.0 });
  }

  updateAmountForCategoryInExpenses(category: string, amount: number): void {
    const expense = this.expenses.find((e) => e.name === category);
    expense.value += amount;
  }

  addNotMappedToOrdinaryMap(name: string, amount: number): void {
    let expense = this.expenses.find((e) => e.name === name);
    console.log(amount);
    if (expense !== undefined) {
      expense.value += amount;
    } else {
      expense = { name: name, value: amount };
    }
    console.log(expense)
    this.notMapped.push(expense);
  }

  updateAmountForCategoryInIncome(category: string, amount: number) {
    const expense = this.expenses.find((e) => e.name === category);
    expense.value = expense.value + amount;
  }

  mapAndFillExpenses(
    nameOfTransactionPlace: string,
    amountOfTransaction: number,
  ): void {
    switch (nameOfTransactionPlace) {
      case 'B.S. 142 KR.PALANKA2 KR.PALANKA':
      case 'MAKPETROL AD SKOPJE':
      case 'BP KRIVA PALANKA 2 142 KRIVA PALANKA':
      case 'BP PARTIZANSKA 002 SKOPJE':
      case 'BEN. STANICA OKTA SKOPJE': {
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
      case 'BON APETIT SKOPJE':
      case 'FURNA SILBO-CENTAR SKOPJE':
      case 'RESTORAN MIDA SKOPJE':
      case 'ROJAL BURGER D.MALO SKOPJE':
      case 'M S BEJKERI CENTAR SKOPJE':
      case 'BIFE 1 SKOPJE':
      case 'VRSHNIK 7 SKOPJE':
      case 'MESARNICA ANDREJA SKOPJE':
      case 'GIRO VELADA SKOPJE': {
        this.updateAmountForCategoryInExpenses('FOOD', amountOfTransaction);
        break;
      }
      case 'TINEKS MT DOOEL SKOPJE':
      case 'CENA TREJD 2014 SKOPJE':
      case 'KAM 76-MLECHEN SKOPJE':
      case 'PAMA MARKETI SKOPJE':
      case 'Ramstor Makedonija SKOPJE':
      case 'VERO 2 TAFTALIDZE K7 SKOPJE':
      case 'VERO 9 K.8 SKOPJE':
      case 'STEP MARKETI 2 SKOPJE':
      case 'GRANDPROM ZUR DOO SKOPJE':
      case 'MARKET NIKOLOVI IM SVETI NIKOLE':
      case 'SUPER TINEKS 13 SKOPJE':
      case 'STOKOMAK MLECEN BR.8 SKOPJE': {
        this.updateAmountForCategoryInExpenses('MARKETS', amountOfTransaction);
        break;
      }
      case '0230706724686': {
        this.updateAmountForCategoryInExpenses(
          'INVESTING_AND_FEES',
          amountOfTransaction,
        );
        break;
      }
      case 'LITERATURA SITI MOL SKOPJE': {
        this.updateAmountForCategoryInExpenses('BOOKS', amountOfTransaction);
        break;
      }
      case 'CENTRAL PERK KOFI DO SKOPJE':
      case 'MINT-KICEN BAR DOOEL KRIVA PALANKA':
      case 'KRIGLA BAR KRIVA PALANKA':
      case 'KANJON MATKA HOTEL SKOPJE':
      case 'REVIJA BAR FOOD SKOPJE':
      case 'MADAL BAL KAFE DZOJ KA SKOPJE': {
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
      case 'DM DROGERIE MARKT 8 SKOPJE': {
        this.updateAmountForCategoryInExpenses('HYGIENE', amountOfTransaction);
        break;
      }
      case 'CINEPLEXX-CITY MALL SKOPJE': {
        this.updateAmountForCategoryInExpenses(
          'ENTERTAINMENT',
          amountOfTransaction,
        );
        break;
      }
      case 'VAIKIKI RETAIL MK DO SKOPJE':
      case 'ZARA EAST GATE SKOPJE': {
        this.updateAmountForCategoryInExpenses(
          'CLOTHES_AND_WEARABLES',
          amountOfTransaction,
        );
        break;
      }
      case 'ANHOC DOOEL SKOPJE':
      case 'NEPTUN-CITY MALL SKOPJE':
      case 'SETEK KRIVA PALANKA KRIVA PALANKA':
      case 'SETEK SITI MOL SKOPJE': {
        this.updateAmountForCategoryInExpenses(
          'SOFTWARE_AND_HARDWARE',
          amountOfTransaction,
        );
        break;
      }
      case 'WWW.ALIEXPRESS.COM LUXEMBOURG':
      case 'WWW.ALIEXPRESS.COM LONDON':
      case 'aliexpress Luxembourg': {
        this.updateAmountForCategoryInExpenses(
          'ALIEXPRESS',
          amountOfTransaction,
        );
        break;
      }
      case 'VIOLA NASTEL SKOPJE': {
        this.updateAmountForCategoryInExpenses('MEDICAL', amountOfTransaction);
        break;
      }
      case 'KBSATM KRIVA PALANKA SKOPJE':
      case 'KBSATM CITY MALL SK SKOPJE': {
        this.updateAmountForCategoryInExpenses('ATM', amountOfTransaction);
        break;
      }
      case 'PANDORA SKOPJE': {
        this.updateAmountForCategoryInExpenses('GIFTS', amountOfTransaction);
        break;
      }
      case 'IKNOW.UKIM.MK SKOPJE': {
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
    switch (nameOfTransactionPlace) {
      case 'ЕУРО-ЛЕВЕЛ ДОО Скопје':
        this.updateAmountForCategoryInIncome('WAGE', amountOfTransaction);
      default:
        this.updateAmountForCategoryInIncome('OTHER', amountOfTransaction);
    }
  }

  replaceCommasBetweenDoubleQuoutesWithDots(row: string): string {
    const regex = /"([^"]*)"/g;  
    const result = row.replace(regex, (match, group) => {
      return `"${group.replace(/,/g, '.')}"`;
    });
    return result;
  }

  removeDoubleQuoutesFromRows(row : string) : string {
    const withoutQuotes = row.replace(/"/g, '');
    const regex = /"([^"]*)"/g;
    const result = withoutQuotes.replace(regex, (match, group) => {
      return `"${group.replace(/,/g, '.')}"`;
    });
    return result;
  }

  fillExpensesThenReturn(): ExpensesEntity[] {
    const transactionAmountIndex = 3;
    const transactionNameIndex = 1;
    const expensesFile = fs.readFileSync(
      // '/home/meto/Documents/financial-documents/September_2023.csv',
      'c:\\Users\\inteligenta\\Downloads\\September_2023.csv',
      'utf-8',
    );
    const expenseRows: string[] = expensesFile.split('\n');
    for (let i = 1; i < expenseRows.length - 1; i++) {
      expenseRows[i] = this.replaceCommasBetweenDoubleQuoutesWithDots(expenseRows[i]);
      expenseRows[i] = this.removeDoubleQuoutesFromRows(expenseRows[i]);
      console.log(expenseRows[i]);
      const expenseColumns: string[] = expenseRows[i].split(',');
      const nameOfTransactionPlace: string =
        expenseColumns[transactionNameIndex];
      const amountOfTransaction: number = parseFloat(
        expenseColumns[transactionAmountIndex].replace(".", "")
      );
      console.log(nameOfTransactionPlace + " : " + amountOfTransaction)
      if (nameOfTransactionPlace && amountOfTransaction) {
        this.mapAndFillExpenses(nameOfTransactionPlace, amountOfTransaction);
      }
    }
    return this.expenses;
  }

  getExpenses() {
    this.expenses = [];
    this.income = [];
    this.notMapped = [];
    this.populateExpensesMap();
    const newMap = this.fillExpensesThenReturn();
    console.log(this.notMapped);
    return newMap;
  }
}
