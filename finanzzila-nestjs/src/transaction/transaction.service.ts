import { ConflictException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { Workbook } from 'exceljs';
import Transaction from './entities/transaction.entity'
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionFilterDto } from './dto/filter-transaction.dto';
import * as fs from 'fs';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { KeywordService } from 'src/keyword/keyword.service';
import { Keyword } from 'src/keyword/entities/keyword.entity';
import { TransactionCategory } from './entities/transaction-category.entity';
import { TransactionCategoryService } from './transaction-category.service';

@Injectable()
export class TransactionService {
    uploadedReportsFolderPath = './uploaded-reports-dev';
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly keywordService: KeywordService,
        @Inject(forwardRef(() => TransactionCategoryService))
        private readonly transactionCategoryService: TransactionCategoryService
    ) { }

    checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace: string,
        wordThatsContained: string,
    ): boolean {
        return nameOfTransactionPlace.includes(wordThatsContained);
    }

    async updateTransactionsAfterCategoriesGetUpdated() : Promise<void>{
        const categories: TransactionCategory[] = await this.transactionCategoryService.findAll();
        const notMappedCategoryId: number = categories.find((c) => c.name === 'NOT_MAPPED').id;
        const transactions: Transaction[] = await this.findAllFiltered(
            new TransactionFilterDto(undefined, undefined, notMappedCategoryId));
        const keywords: Keyword[] = await this.keywordService.findAll();
        transactions.filter((tr) => tr.manuallyOverried === false) .forEach((tr) => {
            let categoryToChange = tr.category;
            if (tr.amount > 0) {
                categoryToChange = categories.find((c) => c.name === 'Income');
            }
            for(let i = 0; i < keywords.length; i++) {
                if(this.checkIfNameOfTransactionContainsGivenWord(tr.nameOfPlace, keywords[i].value)) {
                    categoryToChange = keywords[i].category;         
                    break;
                }
            }
            if(categoryToChange !== null){
                tr.category = categoryToChange;
            }
        })
        this.transactionRepository.save(transactions);
    }

    async create(createTransactionDto: CreateTransactionDto): Promise<Transaction>{
        let category: TransactionCategory = await this.transactionCategoryService
            .findById(createTransactionDto.category);
        const transaction: Transaction = new Transaction(
            createTransactionDto.date,
            createTransactionDto.nameOfPlace,
            createTransactionDto.amount,
            category)
        const savedTransaction = await this.transactionRepository.save(transaction);
        if(createTransactionDto.categoryKeyword !== null && 
           createTransactionDto.categoryKeyword !== undefined){
            category = await this.transactionCategoryService
                .addKeywordForCategory(category, createTransactionDto.categoryKeyword)
        }
        return savedTransaction;
    }

    async findOne(id: number): Promise<Transaction> {
        return await this.transactionRepository.findOne({where: {id}});
    }

    async update(id: number, updateTransactionDto: UpdateTransactionDto) :Promise<Transaction> {
        const transaction: Transaction = await this.findOne(id);
        if (!transaction) {
            throw new NotFoundException(`Transaction with ${id} was not found`);
        }
        const category: TransactionCategory = await this.transactionCategoryService
            .findById(updateTransactionDto.category);
        const oldTransactionCategoryName = transaction.category.name;
        if(oldTransactionCategoryName !== 'NOT_MAPPED' && oldTransactionCategoryName !== category.name){
            transaction.manuallyOverried = true;
        }
        transaction.category = category;
        transaction.amount = updateTransactionDto.amount;
        transaction.date = updateTransactionDto.date;
        transaction.nameOfPlace = updateTransactionDto.nameOfPlace;
        const savedTransaction = await this.transactionRepository.save(transaction);
        if(updateTransactionDto.categoryKeyword !== null && 
           updateTransactionDto.categoryKeyword !== undefined){
            await this.transactionCategoryService
                .addKeywordForCategory(category, updateTransactionDto.categoryKeyword);
        }
        return savedTransaction; 
    }

    remove(id: number): void {
        const options: any = { id: id };
        this.transactionRepository.delete(options);
    }

    async checkIfFileAlreadyUploaded(fileName: string): Promise<void> {
        const uploadedFiles = await this.findAllUploadedReports();
        if (uploadedFiles.find((f) => f === fileName)) {
            throw new ConflictException(`File with filename ${fileName} already exists`);
        }
    }

    async populateTransactions(file: Express.Multer.File): Promise<Transaction[]> {
        //await this.checkIfFileAlreadyUploaded(file.originalname);
        const categories = await this.transactionCategoryService.findAll();
        const keywords: Keyword[] = await this.keywordService.findAll();
        const transactions: Transaction[] = []
        const workbook = new Workbook();
        await workbook.xlsx.load(file.buffer)
            .then(function() {
                const worksheet = workbook.getWorksheet('Sheet1');
                worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
                    if (rowNumber === 1) {
                        return;
                    }
                    const transDate: Date = row.values[1];
                    const transName: string = row.values[2].toString();
                    const transAmount: number = row.values[4];
                    const category: TransactionCategory = getCategoryV2(transName, transAmount);
                    const transaction = new Transaction(transDate, transName,
                        transAmount, category)
                    if (category) {
                        transactions.push(transaction);
                    }
                });

                function checkIfNameOfTransactionContainsGivenWord(
                    nameOfTransactionPlace: string,
                    wordThatsContained: string,
                ): boolean {
                    return nameOfTransactionPlace.includes(wordThatsContained);
                }
                
                function getCategoryV2(nameOfTransactionPlace: string, amountOfTransaction: number) {
                    if (amountOfTransaction === undefined && amountOfTransaction === null) {
                        console.log("Ignored or invalid transaction with name: ",
                                    nameOfTransactionPlace,
                                    "and amount: ",
                                    amountOfTransaction);
                                    return undefined;
                    }
                    if (amountOfTransaction > 0) {
                        return categories.find((c) => c.name === 'Income');
                    }
                    for(let i = 0; i < keywords.length; i++) {
                        if(checkIfNameOfTransactionContainsGivenWord(nameOfTransactionPlace, keywords[i].value)) {
                            console.log("TRUE ", keywords[i].category)
                            return keywords[i].category;         
                        }
                    }
                    return categories.find((c) => c.name === 'NOT_MAPPED');
                }

                function getCategory(
                    nameOfTransactionPlace: string,
                    amountOfTransaction: number,
                ): TransactionCategory {
                    if (amountOfTransaction === undefined && amountOfTransaction === null) {
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
                                    .find((c) => c.name === 'CLOTHES_AND_WEARABLES');
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

    findAllFiltered(transactionFilter: TransactionFilterDto): Promise<Transaction[]> {
        const queryBuilder = this.transactionRepository.
            createQueryBuilder('transaction').
            leftJoinAndSelect('transaction.category', 'category');
        if (transactionFilter.categoryId) {
            queryBuilder.andWhere('transaction.category.id = :categoryId',
                { categoryId: transactionFilter.categoryId });
        }
        if (transactionFilter.dateFrom && transactionFilter.dateTo) {
            queryBuilder.andWhere('transaction.date BETWEEN :dateFrom AND :dateTo', {
                dateFrom: transactionFilter.dateFrom,
                dateTo: transactionFilter.dateTo,
            });
        } else if (transactionFilter.dateFrom) {
            queryBuilder.andWhere('transaction.date >= :dateFrom', {
                dateFrom: transactionFilter.dateFrom,
            });
        } else if (transactionFilter.dateTo) {
            queryBuilder.andWhere('transaction.date <= :dateTo', {
                dateTo: transactionFilter.dateTo,
            });
        }
        queryBuilder.orderBy('transaction.date', "DESC");
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
