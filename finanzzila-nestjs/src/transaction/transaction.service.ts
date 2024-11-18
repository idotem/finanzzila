import {
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
    forwardRef
} from '@nestjs/common';
import { Workbook } from 'exceljs';
import Transaction from './entities/transaction.entity';
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
    ) {}

    checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace: string,
        wordThatsContained: string
    ): boolean {
        return nameOfTransactionPlace.includes(wordThatsContained);
    }

    async updateTransactionsAfterCategoriesGetUpdated(): Promise<void> {
        console.log('UPDATING TRANSACTIONS AFTER CATEGORY GETS UPDATED');
        const categories: TransactionCategory[] = await this.transactionCategoryService.findAll();
        const notMappedCategoryId: number = categories.find((c) => c.name === 'NOT_MAPPED').id;
        const transactions: Transaction[] = await this.findAllFiltered(
            new TransactionFilterDto(undefined, undefined, notMappedCategoryId)
        );
        const keywords: Keyword[] = await this.keywordService.findAll();
        console.log('cat.lenght', categories.length);
        console.log('tr.lenght', transactions.length);
        console.log('keywords.lenght', keywords.length);
        for (const tr of transactions) {
            console.log('tr.amount: ', tr.amount);
            console.log('tr.manually overried: ', tr.manuallyOverried);
            console.log('tr.name: ', tr.nameOfPlace);
            if (tr.manuallyOverried) {
                continue;
            }
            if (tr.amount > 0) {
                console.log('manually overried: ', tr.manuallyOverried);
                console.log('tr.name: ', tr.nameOfPlace);
                tr.category = categories.find((c) => c.name === 'Income');
                continue;
            }
            for (let i = 0; i < keywords.length; i++) {
                if (
                    this.checkIfNameOfTransactionContainsGivenWord(
                        tr.nameOfPlace,
                        keywords[i].value
                    )
                ) {
                    tr.category = keywords[i].category;
                    break;
                }
            }
        }
        this.transactionRepository.save(transactions);
    }

    async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
        let category: TransactionCategory = await this.transactionCategoryService.findById(
            createTransactionDto.category
        );
        const transaction: Transaction = new Transaction(
            createTransactionDto.date,
            createTransactionDto.nameOfPlace,
            createTransactionDto.amount,
            category
        );
        const savedTransaction = await this.transactionRepository.save(transaction);
        if (
            createTransactionDto.categoryKeyword !== null &&
            createTransactionDto.categoryKeyword !== undefined
        ) {
            category = await this.transactionCategoryService.addKeywordForCategory(
                category,
                createTransactionDto.categoryKeyword
            );
        }
        return savedTransaction;
    }

    async findOne(id: number): Promise<Transaction> {
        return await this.transactionRepository.findOne({ where: { id } });
    }

    async update(id: number, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
        const transaction: Transaction = await this.findOne(id);
        if (!transaction) {
            throw new NotFoundException(`Transaction with ${id} was not found`);
        }
        const category: TransactionCategory = await this.transactionCategoryService.findById(
            updateTransactionDto.category
        );
        const oldTransactionCategoryName = transaction.category.name;
        if (
            oldTransactionCategoryName !== 'NOT_MAPPED' &&
            oldTransactionCategoryName !== category.name
        ) {
            transaction.manuallyOverried = true;
        }
        transaction.category = category;
        transaction.amount = updateTransactionDto.amount;
        transaction.date = updateTransactionDto.date;
        transaction.nameOfPlace = updateTransactionDto.nameOfPlace;
        const savedTransaction = await this.transactionRepository.save(transaction);
        if (
            updateTransactionDto.categoryKeyword !== null &&
            updateTransactionDto.categoryKeyword !== undefined
        ) {
            await this.transactionCategoryService.addKeywordForCategory(
                category,
                updateTransactionDto.categoryKeyword
            );
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
        const transactions: Transaction[] = [];
        const workbook = new Workbook();
        await workbook.xlsx.load(file.buffer).then(function () {
            const worksheet = workbook.getWorksheet('Sheet1');
            worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
                if (rowNumber === 1) {
                    return;
                }
                const transDate: Date = row.values[1];
                const transName: string = row.values[2].toString();
                const transAmount: number = row.values[4];
                const category: TransactionCategory = getCategory(transName, transAmount);
                if (category && category.name === 'Fuel and liquids') {
                    splitTransactionsFromFuelStationsToFuelAndMarket(
                        transAmount,
                        transDate,
                        transName,
                        category
                    );
                } else if (category) {
                    const transaction = new Transaction(
                        transDate,
                        transName,
                        transAmount,
                        category
                    );
                    transactions.push(transaction);
                }
            });

            function splitTransactionsFromFuelStationsToFuelAndMarket(
                transAmount: number,
                transDate: Date,
                transName: string,
                category: TransactionCategory
            ) {
                if (transAmount % 500 === 0) {
                    const transaction = new Transaction(
                        transDate,
                        transName,
                        transAmount,
                        category
                    );
                    transactions.push(transaction);
                } else {
                    const marketCat = categories.find((c) => c.name === 'Market');
                    const splittedFuelTrans = new Transaction(
                        transDate,
                        transName,
                        transAmount - (transAmount % 500),
                        category
                    );
                    const splittedMarketTrans = new Transaction(
                        transDate,
                        transName,
                        transAmount % 500,
                        marketCat
                    );
                    transactions.push(splittedMarketTrans);
                    transactions.push(splittedFuelTrans);
                }
            }

            function checkIfNameOfTransactionContainsGivenWord(
                nameOfTransactionPlace: string,
                wordThatsContained: string
            ): boolean {
                return nameOfTransactionPlace.includes(wordThatsContained);
            }

            function getCategory(nameOfTransactionPlace: string, amountOfTransaction: number) {
                if (amountOfTransaction === undefined || amountOfTransaction === null) {
                    console.log(
                        'Ignored or invalid transaction with name: ',
                        nameOfTransactionPlace,
                        'and amount: ',
                        amountOfTransaction
                    );
                    return undefined;
                }
                if (amountOfTransaction > 0) {
                    return categories.find((c) => c.name === 'Income');
                }
                for (let i = 0; i < keywords.length; i++) {
                    if (
                        checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            keywords[i].value
                        )
                    ) {
                        console.log('TRUE ', keywords[i].category);
                        return keywords[i].category;
                    }
                }
                return categories.find((c) => c.name === 'NOT_MAPPED');
            }
        });
        await this.transactionRepository.save(transactions);

        fs.writeFileSync(`${this.uploadedReportsFolderPath}/${file.originalname}`, file.buffer);
        const tr = await this.findAllFiltered(
            new TransactionFilterDto(undefined, undefined, undefined)
        );
        return tr;
    }

    findAllFiltered(transactionFilter: TransactionFilterDto): Promise<Transaction[]> {
        const queryBuilder = this.transactionRepository
            .createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.category', 'category');
        if (transactionFilter.categoryId) {
            queryBuilder.andWhere('transaction.category.id = :categoryId', {
                categoryId: transactionFilter.categoryId
            });
        }
        if (transactionFilter.dateFrom && transactionFilter.dateTo) {
            queryBuilder.andWhere('transaction.date BETWEEN :dateFrom AND :dateTo', {
                dateFrom: transactionFilter.dateFrom,
                dateTo: transactionFilter.dateTo
            });
        } else if (transactionFilter.dateFrom) {
            queryBuilder.andWhere('transaction.date >= :dateFrom', {
                dateFrom: transactionFilter.dateFrom
            });
        } else if (transactionFilter.dateTo) {
            queryBuilder.andWhere('transaction.date <= :dateTo', {
                dateTo: transactionFilter.dateTo
            });
        }
        queryBuilder.orderBy('transaction.date', 'DESC');
        return queryBuilder.getMany();
    }

    async findAllUploadedReports(): Promise<string[]> {
        const folderPath = `${this.uploadedReportsFolderPath}/`;
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
