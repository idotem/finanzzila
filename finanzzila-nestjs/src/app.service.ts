import { Injectable } from '@nestjs/common';
import ExpensesCategory from './expenses.category.enum';
import IncomeCategory from './income.category.enum';
import * as fs from 'fs';

@Injectable()
export class AppService {
  expenses: Map<ExpensesCategory, number> = new Map<ExpensesCategory, number>();
  income: Map<IncomeCategory, number> = new Map<IncomeCategory, number>();
  notMapped: Map<string, number> = new Map<string, number>();

  getHello(): string {
    return 'Hello';
  }

  populateExpensesMap(): void {
    this.expenses.set(ExpensesCategory.ALIEXPRESS, 0.0);
    this.expenses.set(ExpensesCategory.ATM, 0.0);
    this.expenses.set(ExpensesCategory.BOOKS, 0.0);
    this.expenses.set(ExpensesCategory.CAFE_AND_BARS, 0.0);
    this.expenses.set(ExpensesCategory.CLOTHES_AND_WEARABLES, 0.0);
    this.expenses.set(ExpensesCategory.EDUCATION, 0.0);
    this.expenses.set(ExpensesCategory.ENTERTAINMENT, 0.0);
    this.expenses.set(ExpensesCategory.FOOD, 0.0);
    this.expenses.set(ExpensesCategory.FUEL_AND_CAR, 0.0);
    this.expenses.set(ExpensesCategory.GIFTS, 0.0);
    this.expenses.set(ExpensesCategory.HYGIENE, 0.0);
    this.expenses.set(ExpensesCategory.INVESTING_AND_FEES, 0.0);
    this.expenses.set(ExpensesCategory.MARKETS, 0.0);
    this.expenses.set(ExpensesCategory.MEDICAL, 0.0);
    this.expenses.set(ExpensesCategory.RESTAURANTS, 0.0);
    this.expenses.set(ExpensesCategory.SNACKS_AND_WATER, 0.0);
    this.expenses.set(ExpensesCategory.SOFTWARE_AND_HARDWARE, 0.0);
    this.expenses.set(ExpensesCategory.UTILITIES, 0.0);
  }

  updateAmountForCategoryInExpenses(
    category: ExpensesCategory,
    amount: number,
  ): void {
    // console.log('category: ' + category);
    // console.log('amount: ' + amount);
    // console.log('alreadySavedAmount: ' + this.expenses.get(category));
    const addedAmount = this.expenses.get(category) + amount;
    // console.log('addedAmount: ' + addedAmount);
    this.expenses.set(category, addedAmount);
    // console.log('addedAmountAfterSet: ' + this.expenses.get(category));
  }

  addNotMappedToOrdinaryMap(name: string, amount: number): void {
    this.notMapped.set(name, this.notMapped.get(name) + amount);
  }

  updateAmountForCategoryInIncome(category: IncomeCategory, amount: number) {
    this.income.set(category, this.income.get(category) + amount);
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
            ExpensesCategory.FUEL_AND_CAR,
            amountOfTransaction - (amountOfTransaction % 1000),
          );
          this.updateAmountForCategoryInExpenses(
            ExpensesCategory.SNACKS_AND_WATER,
            amountOfTransaction % 1000,
          );
        } else {
          this.updateAmountForCategoryInExpenses(
            ExpensesCategory.SNACKS_AND_WATER,
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
        this.updateAmountForCategoryInExpenses(
          ExpensesCategory.FOOD,
          amountOfTransaction,
        );
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
        this.updateAmountForCategoryInExpenses(
          ExpensesCategory.MARKETS,
          amountOfTransaction,
        );
        break;
      }
      case '0230706724686': {
        this.updateAmountForCategoryInExpenses(
          ExpensesCategory.INVESTING_AND_FEES,
          amountOfTransaction,
        );
        break;
      }
      case 'LITERATURA SITI MOL SKOPJE': {
        this.updateAmountForCategoryInExpenses(
          ExpensesCategory.BOOKS,
          amountOfTransaction,
        );
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
            ExpensesCategory.CAFE_AND_BARS,
            amountOfTransaction,
          );
        } else {
          this.updateAmountForCategoryInExpenses(
            ExpensesCategory.RESTAURANTS,
            amountOfTransaction,
          );
        }
        break;
      }
      case 'DM DROGERIE MARKT 8 SKOPJE': {
        this.updateAmountForCategoryInExpenses(
          ExpensesCategory.HYGIENE,
          amountOfTransaction,
        );
        break;
      }
      case 'CINEPLEXX-CITY MALL SKOPJE': {
        this.updateAmountForCategoryInExpenses(
          ExpensesCategory.ENTERTAINMENT,
          amountOfTransaction,
        );
        break;
      }
      case 'VAIKIKI RETAIL MK DO SKOPJE':
      case 'ZARA EAST GATE SKOPJE': {
        this.updateAmountForCategoryInExpenses(
          ExpensesCategory.CLOTHES_AND_WEARABLES,
          amountOfTransaction,
        );
        break;
      }
      case 'ANHOC DOOEL SKOPJE':
      case 'NEPTUN-CITY MALL SKOPJE':
      case 'SETEK KRIVA PALANKA KRIVA PALANKA':
      case 'SETEK SITI MOL SKOPJE': {
        this.updateAmountForCategoryInExpenses(
          ExpensesCategory.SOFTWARE_AND_HARDWARE,
          amountOfTransaction,
        );
        break;
      }
      case 'WWW.ALIEXPRESS.COM LUXEMBOURG':
      case 'WWW.ALIEXPRESS.COM LONDON':
      case 'aliexpress Luxembourg': {
        this.updateAmountForCategoryInExpenses(
          ExpensesCategory.ALIEXPRESS,
          amountOfTransaction,
        );
        break;
      }
      case 'VIOLA NASTEL SKOPJE': {
        this.updateAmountForCategoryInExpenses(
          ExpensesCategory.MEDICAL,
          amountOfTransaction,
        );
        break;
      }
      case 'KBSATM KRIVA PALANKA SKOPJE':
      case 'KBSATM CITY MALL SK SKOPJE': {
        this.updateAmountForCategoryInExpenses(
          ExpensesCategory.ATM,
          amountOfTransaction,
        );
        break;
      }
      case 'PANDORA SKOPJE': {
        this.updateAmountForCategoryInExpenses(
          ExpensesCategory.GIFTS,
          amountOfTransaction,
        );
        break;
      }
      case 'IKNOW.UKIM.MK SKOPJE': {
        this.updateAmountForCategoryInExpenses(
          ExpensesCategory.EDUCATION,
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
        this.updateAmountForCategoryInIncome(
          IncomeCategory.WAGE,
          amountOfTransaction,
        );
      default:
        this.updateAmountForCategoryInIncome(
          IncomeCategory.OTHER,
          amountOfTransaction,
        );
    }
  }

  fillExpensesThenReturn(): Map<ExpensesCategory, number> {
    const transactionAmountIndex = 3;
    const transactionNameIndex = 1;
    const expensesFile = fs.readFileSync(
      '/home/meto/Documents/financial-documents/Izvestaj_za_Promet.csv',
      'utf-8',
    );
    const expenseRows: string[] = expensesFile.split('\n');
    for (let i = 1; i < expenseRows.length - 1; i++) {
      const expenseColumns: string[] = expenseRows[i].split(',');
      const nameOfTransactionPlace: string =
        expenseColumns[transactionNameIndex];
      const amountOfTransaction: number = parseFloat(
        expenseColumns[transactionAmountIndex],
      );
      if (nameOfTransactionPlace && amountOfTransaction) {
        this.mapAndFillExpenses(nameOfTransactionPlace, amountOfTransaction);
      }
    }
    return this.expenses;
  }

  getExpenses() {
    this.populateExpensesMap();
    const newMap = this.fillExpensesThenReturn();
    return newMap;
  }
}
