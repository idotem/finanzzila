import {
    BadRequestException,
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
import { CreateTransactionCategoryDto } from './dto/create-transaction-category-dto';
import { UpdateTransactionCategoryDto } from './dto/update-transaction-category-dto';
import { KeywordDto } from 'src/keyword/dto/keyword-dto';

@Injectable()
export class TransactionService {
    uploadedReportsFolderPath = './uploaded-reports-dev';

    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly keywordService: KeywordService,
        @InjectRepository(TransactionCategory)
        private readonly transactionCategoryRepository: Repository<TransactionCategory>
    ) {}

    checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace: string,
        wordThatsContained: string
    ): boolean {
        return nameOfTransactionPlace.includes(wordThatsContained);
    }

    async updateTransactionsAfterCategoriesGetUpdated(): Promise<void> {
        const categories: TransactionCategory[] = await this.findAllCategories();
        const notMappedCategory: TransactionCategory = categories.find(
            (c) => c.name === 'NOT_MAPPED'
        );
        const incomeCategory: TransactionCategory = categories.find((c) => c.name === 'INCOME');
        const transactions: Transaction[] = await this.findAllTransactionsFiltered(
            new TransactionFilterDto(undefined, undefined, notMappedCategory.id)
        );
        const keywords: Keyword[] = await this.keywordService.findAll();
        for (const tr of transactions) {
            if (tr.manuallyOverried) {
                continue;
            }
            if (tr.amount > 0) {
                tr.category = incomeCategory;
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
            if (tr.category === null || tr.category === undefined) {
                tr.category = notMappedCategory;
            }
        }
        this.transactionRepository.save(transactions);
    }

    async createTransaction(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
        let category: TransactionCategory = await this.findCategoryById(
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
            category = await this.addKeywordForCategory(
                category,
                createTransactionDto.categoryKeyword
            );
        }
        return savedTransaction;
    }

    async findTransactionById(id: number): Promise<Transaction> {
        return await this.transactionRepository.findOne({ where: { id } });
    }

    async updateTransaction(
        id: number,
        updateTransactionDto: UpdateTransactionDto
    ): Promise<Transaction> {
        const transaction: Transaction = await this.findTransactionById(id);
        if (!transaction) {
            throw new NotFoundException(`Transaction with ${id} was not found`);
        }
        const category: TransactionCategory = await this.findCategoryById(
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
            await this.addKeywordForCategory(category, updateTransactionDto.categoryKeyword);
        }
        return savedTransaction;
    }

    deleteTransactionById(id: number): void {
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
        const categories = await this.findAllCategories();
        const keywords: Keyword[] = await this.keywordService.findAll();
        const transactions: Transaction[] = [];
        const workbook = new Workbook();
        console.log('Transaction population starting: ', file);
        await workbook.xlsx.load(file.buffer).then(function () {
            const worksheet = workbook.getWorksheet('Sheet1');
            worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
                if (rowNumber === 1) {
                    return;
                }
                const transDate: Date = row.values[1] ? row.values[1] : '01.01.2024';
                const transName: string = row.values[2]
                    ? row.values[2].toString()
                    : 'TRANSACTION WITHOUT NAME';
                const transAmount: number = parseInt(row.values[4]) ? parseInt(row.values[4]) : 0;
                const category: TransactionCategory = getCategory(transName, transAmount);
                console.log('category for row: ', category);
                console.log('transDate for row: ', transDate);
                console.log('transName for row: ', transName);
                console.log('transAmount for row: ', transAmount);
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
                        return keywords[i].category;
                    }
                }
                return categories.find((c) => c.name === 'NOT_MAPPED');
            }
        });
        console.log('SAVING TRANSACTIONS');
        await this.transactionRepository.save(transactions);

        fs.writeFileSync(`${this.uploadedReportsFolderPath}/${file.originalname}`, file.buffer);
        const tr = await this.findAllTransactionsFiltered(
            new TransactionFilterDto(undefined, undefined, undefined)
        );
        return tr;
    }

    findAllTransactionsFiltered(transactionFilter: TransactionFilterDto): Promise<Transaction[]> {
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

    //CATEGORY:

    findAllCategories(): Promise<TransactionCategory[]> {
        const queryBuilder = this.transactionCategoryRepository
            .createQueryBuilder('transaction-category')
            .leftJoinAndSelect('transaction-category.keywords', 'keywords');
        const r = queryBuilder.getMany();
        return r;
    }

    async createCategory(
        createTransactionCategoryDto: CreateTransactionCategoryDto
    ): Promise<TransactionCategory> {
        const keywords: Keyword[] = createTransactionCategoryDto.keywords.map(
            (kd) => new Keyword(kd.value)
        );
        const category: TransactionCategory = new TransactionCategory(
            createTransactionCategoryDto.name,
            keywords,
            createTransactionCategoryDto.isWants,
            createTransactionCategoryDto.color
        );
        const savedCategory = await this.transactionCategoryRepository.save(category);
        this.updateTransactionsAfterCategoriesGetUpdated();
        return savedCategory;
    }

    async updateCategory(
        id: number,
        updateTransactionCategoryDto: UpdateTransactionCategoryDto
    ): Promise<TransactionCategory> {
        const category: TransactionCategory = await this.findCategoryById(id);
        const keywords: Keyword[] = await Promise.all(
            updateTransactionCategoryDto.keywords.map(async (kd) => {
                if (kd.id) {
                    const editingKeyword = await this.keywordService.findOne(kd.id);
                    editingKeyword.value = kd.value;
                    return editingKeyword;
                }
                const keyword = new Keyword(kd.value);
                return keyword;
            })
        );
        try {
            category.name = updateTransactionCategoryDto.name;
            category.keywords = keywords;
            category.isWants = updateTransactionCategoryDto.isWants;
            category.color = updateTransactionCategoryDto.color;
            const cat = await this.transactionCategoryRepository.save(category);
            if (
                this.categoryKeywordsGotUpdated(
                    category.keywords,
                    updateTransactionCategoryDto.keywords
                )
            ) {
                this.updateTransactionsAfterCategoriesGetUpdated();
            }
            return cat;
        } catch (e) {
            console.log('UPDATE CATEGORY THREW EXCEPTION: ', e.detail);
            if (/(value)[\s\S]+(already exists)/.test(e.detail)) {
                throw new BadRequestException(e.detail);
            }
        }
    }

    categoryKeywordsGotUpdated(keywords: Keyword[], updatedKeywords: KeywordDto[]): boolean {
        const ukIds: number[] = updatedKeywords.map((uk) => uk.id);
        if (keywords.length !== updatedKeywords.length) {
            return false;
        }
        for (const keyword of keywords) {
            if (!ukIds.includes(keyword.id)) {
                return false;
            }
        }
        return true;
    }

    async findCategoryById(id: number): Promise<TransactionCategory> {
        const cat = await this.transactionCategoryRepository.findOne({ where: { id } });
        if (!cat) {
            throw new NotFoundException(`Category with ${id} was not found`);
        }
        return cat;
    }

    deleteCategoryById(id: number): void {
        const options: any = { id: id };
        this.transactionCategoryRepository.delete(options);
    }

    async addKeywordForCategory(
        category: TransactionCategory,
        keyword: string
    ): Promise<TransactionCategory> {
        const catKeywords = await this.keywordService.findAllByCategoryId(category.id);
        catKeywords.push(new Keyword(keyword));
        category.keywords = catKeywords;
        const savedKeywod = this.transactionCategoryRepository.save(category);
        this.updateTransactionsAfterCategoriesGetUpdated();
        return savedKeywod;
    }
}
