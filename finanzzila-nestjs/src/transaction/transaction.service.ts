import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import Transaction from './entities/transaction.entity'
import { TransactionCategory } from '../transaction-category/entity/transaction-category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionCategoryService } from 'src/transaction-category/transaction-category.service';
import { TransactionFilterDto } from './dto/filter-transaction.dto';
import * as fs from 'fs';

@Injectable()
export class TransactionService {
    uploadedReportsFolderPath = './uploaded-reports-main';
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly transactionCategoryService: TransactionCategoryService,
    ) {}

    async checkIfFileAlreadyUploaded(fileName: string): Promise<boolean> {
        const uploadedFiles = await this.findAllUploadedReports();
        if(uploadedFiles.find((f) => f === fileName)){
            console.log('File already uploaded and transactions entered: ', fileName); 
            return true;
        }
        return false;
    }

    async populateTransactions(file: Express.Multer.File) : Promise<Transaction[]>{
        if(await this.checkIfFileAlreadyUploaded(file.originalname)){
            return;
        };
        const categories = await this.transactionCategoryService.findAll();
        const transactions : Transaction[] = []
        const workbook = new Workbook();
        await workbook.xlsx.load(file.buffer)
        .then(function() {
            const worksheet = workbook.getWorksheet('Sheet1');
            worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
                if(rowNumber === 1){
                    return;
                }
                const transDate : Date = row.values[1];
                const transName : string = row.values[2].toString();
                const transAmount : number = row.values[4];
                const category : TransactionCategory = getCategory(transName, transAmount);
                const transaction = new Transaction(transDate, transName,
                                                    transAmount, category) 
                if(category){
                    transactions.push(transaction);
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
                    console.log("Ignored or invalid transaction with name: ", 
                                nameOfTransactionPlace, 
                                "and amount: ",
                                amountOfTransaction);
                                return undefined;
                }
                if (amountOfTransaction > 0) {
                    return categories.find((c) => c.name === 'INCOME');
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
                        return categories.find((c) => c.name === 'FUEL_AND_CAR');
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
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'POPOVSKI',
                    ): {
                        return categories.find((c) => c.name === 'FOOD');
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
                        return categories.find((c) => c.name === 'MARKET');
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        '230706724686',
                    ): {
                        return categories.find((c) => c.name === 'INVESTING_AND_FEES');
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'LITERATURA',
                    ): {
                        return categories.find((c) => c.name === 'BOOKS');
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'КОМЕРЦИЈАЛНА',
                    ): {
                        return categories.find((c) => c.name === 'COMMERCIAL_BANK');
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
                        return categories.find((c) => c.name === 'CAFE_AND_BARS');
                    } else {
                        return categories.find((c) => c.name === 'RESTAURANTS');
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'DM DROGERIE',
                    ): {
                        return categories.find((c) => c.name === 'HYGIENE');
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'CINEPLEXX',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'KUPIKARTA',
                    ): {
                        return categories.find((c) => c.name === 'ENTERTAINMENT');
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
                        return categories
                        .find((c) => c.name === 'CLOTHES_AND_WEARBLES');
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
                        return categories
                        .find((c) => c.name === 'SOFTWARE_AND_HARDWARE');
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'ALIEXPRESS',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'aliexpress',
                    ): {
                        return categories.find((c) => c.name === 'ALIEXPRESS');
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'APTEKA',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'VIOLA',
                    ): {
                        return categories.find((c) => c.name === 'MEDICAL');
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'KBSATM',
                    ): {
                        return categories.find((c) => c.name === 'ATM');
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'CVEKARNICA',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'PANDORA',
                    ): {
                        return categories.find((c) => c.name === 'GIFTS');
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
                        return categories.find((c) => c.name === 'EVERYTHING_STORE');
                    }
                    case checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        'IKNOW.UKIM.MK',
                    ):
                        case checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            'EKVUS',
                    ): {
                        return categories.find((c) => c.name === 'EDUCATION');
                    }
                    default: {
                        return categories.find((c) => c.name === 'NOT_MAPPED');
                    }
                }
            }
        });
        await this.transactionRepository.save(transactions);

        fs.writeFileSync(`${this.uploadedReportsFolderPath}/${file.originalname}`, file.buffer);
        const tr = await this.findAllFiltered(new TransactionFilterDto(undefined, undefined, undefined));
        return tr;
    }

    findAllFiltered(transactionFilter: TransactionFilterDto) :Promise<Transaction[]>{
        const queryBuilder = this.transactionRepository.
            createQueryBuilder('transaction').
            leftJoinAndSelect('transaction.category', 'category');
        if (transactionFilter.categoryId) {
            queryBuilder.andWhere('transaction.category.id = :categoryId', 
                                  { categoryId: transactionFilter.categoryId});
        }
        if (transactionFilter.dateFrom && transactionFilter.dateTo) {
            queryBuilder.andWhere('transaction.date BETWEEN :dateFrom AND :dateTo', {
                dateFrom: transactionFilter.dateFrom,
                dateTo: transactionFilter.dateTo,
            });
        } else if(transactionFilter.dateFrom) {
            queryBuilder.andWhere('transaction.date >= :dateFrom', {
                dateFrom: transactionFilter.dateFrom,
            });
        } else if(transactionFilter.dateTo) {
            queryBuilder.andWhere('transaction.date <= :dateTo', {
                dateTo: transactionFilter.dateTo,
            });
        }
        return queryBuilder.getMany();
    }

    async findAllUploadedReports(): Promise<string[]> {
        const folderPath = `${this.uploadedReportsFolderPath}/`
        return new Promise<string[]>((resolve, reject) => {
            fs.readdir(folderPath, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        });
    }

}
