import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import TransactionEntity from './entities/transaction.entity'
import { TransactionCategory } from './entities/category.entity';

@Injectable()
export class TransactionService {

    populateTransactions(file: Express.Multer.File) {
        const workbook = new Workbook();
        workbook.xlsx.load(file.buffer)
        .then(function() {
            var worksheet = workbook.getWorksheet('Sheet1');
            worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
                const category : TransactionCategory = getCategory(
                    row.values[2].toString(), row.values[4]);
                if(category){
                    const transaction: TransactionEntity = 
                        new TransactionEntity(row.values[1],
                                              row.values[2].toString(),
                                              row.values[4],
                                              category) 
                    console.log(transaction);
                }
            });
            function checkIfNameOfTransactionContainsGivenWord(
                nameOfTransactionPlace: string,
                wordThatsContained: string,
            ): boolean {
                return nameOfTransactionPlace.includes(wordThatsContained);
            }

            function getCategory(
                nameOfTransactionPlace: string,
                amountOfTransaction: number,
            ): TransactionCategory { 
                if(!nameOfTransactionPlace || !amountOfTransaction){
                    console.log("Name or amount are undefined");
                    return undefined;
                }
                if (amountOfTransaction > 0) {
                    return TransactionCategory.INCOME;
                }
                switch (true) {
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'BP ',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'B.S. ',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'MAKPETROL',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'OKTA',
                    ): {
                        return TransactionCategory.FUEL_AND_CAR;
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'BON APETIT',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'SILBO-CENTAR',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'RESTORAN MIDA SKOPJE',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'ROJAL BURGER',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'M S BEJKERI',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'BIFE',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'GURMAN',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'VRSHNIK',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'MESARNICA',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'GIRO',
                    ): {
                        return TransactionCategory.FOOD;
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'TINEKS',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'LA NOI',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'CENA TREJD',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'KAM',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'MARKETI',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'Ramstor',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'RAMSTOR',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'VERO',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'ZUR',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'MARKET',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'STOKOMAK',
                    ): {
                        return TransactionCategory.FOOD;
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        '230706724686',
                    ): {
                        return TransactionCategory.INVESTING_AND_FEES;
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'LITERATURA',
                    ): {
                        return TransactionCategory.BOOKS;
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'KOFI',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'BAR',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'KAFE',
                    ):
                        if (amountOfTransaction <= 300) {
                        return TransactionCategory.CAFE_AND_BARS;
                    } else {
                        return TransactionCategory.RESTAURANTS;
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'DM DROGERIE',
                    ): {
                        return TransactionCategory.HYGIENE;
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'CINEPLEXX',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'KUPIKARTA',
                    ): {
                        return TransactionCategory.ENTERTAINMENT;
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'VAIKIKI',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'ZARA',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'NJU JORKER',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'KOTON',
                    ): {
                        return TransactionCategory.CLOTHES_AND_WEARABLES;
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'ANHOC',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'NEPTUN',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'SETEK',
                    ): {
                        return TransactionCategory.SOFTWARE_AND_HARDWARE;
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'ALIEXPRESS',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'aliexpress',
                    ): {
                        TransactionCategory.ALIEXPRESS;
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'APTEKA',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'VIOLA',
                    ): {
                        return TransactionCategory.MEDICAL;
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'KBSATM',
                    ): {
                        return TransactionCategory.ATM;
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'CVEKARNICA',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'PANDORA',
                    ): {
                        return TransactionCategory.GIFTS;
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'JUSK',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'JUMBO',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'BAZARO',
                    ): {
                        return TransactionCategory.EVERYTHING_STORE;
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'IKNOW.UKIM.MK',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'EKVUS',
                    ): {
                        return TransactionCategory.EDUCATION;
                    }
                    default: {
                        return TransactionCategory.NOT_MAPPED;
                    }
                }
            }
        });

    }




}
