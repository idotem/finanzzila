import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category-dto';
import { UpdateCategoryDto } from './dto/update-category-dto';
import { KeywordDto } from 'src/keyword/dto/keyword-dto';

@Injectable()
export class TransactionService {
    uploadedReportsFolderPath = './uploaded-reports-dev';

    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        private readonly keywordService: KeywordService,
        @InjectRepository(Category)
        private readonly transactionCategoryRepository: Repository<Category>
    ) {}

    checkIfNameOfTransactionContainsGivenWord(
        nameOfTransactionPlace: string,
        wordThatIsContained: string
    ): boolean {
        return nameOfTransactionPlace.includes(wordThatIsContained);
    }

    // TODO: here get expensesKeywords, incomeKeywords
    // TODO: if amount > 0 use incomeKeywords to map else use expensesKeywords to map. simple as that
    async updateTransactionsAfterCategoriesGetUpdated(): Promise<void> {
        const categories: Category[] = await this.findAllCategories();
        const notMappedCategory: Category = categories.find(
            (c: Category) => c.name.toLowerCase() === 'not_mapped'
        );
        const transactions: Transaction[] = await this.findAllTransactionsFiltered(
            new TransactionFilterDto(undefined, undefined, undefined)
        );
        const expenseKeywords: Keyword[] = await this.keywordService.findAllByCategoryIsExpense(1);
        const incomeKeywords: Keyword[] = await this.keywordService.findAllByCategoryIsExpense(0);
        let updatedTrCategory: boolean = false;
        for (const tr of transactions) {
            if (tr.manuallyOverried) {
                continue;
            }
            if (tr.amount > 0) {
                updatedTrCategory = this.determineCategoryFromTrNameAndKeywords(
                    incomeKeywords,
                    tr,
                    updatedTrCategory
                );
            } else if (tr.amount <= 0) {
                updatedTrCategory = this.determineCategoryFromTrNameAndKeywords(
                    expenseKeywords,
                    tr,
                    updatedTrCategory
                );
            }
            if (!updatedTrCategory) {
                tr.category = notMappedCategory;
            }
            updatedTrCategory = false;
        }
        await this.transactionRepository.save(transactions);
    }

    private determineCategoryFromTrNameAndKeywords(
        expenseKeywords: Keyword[],
        tr: Transaction,
        updatedTrCategory: boolean
    ) {
        for (let i = 0; i < expenseKeywords.length; i++) {
            if (
                this.checkIfNameOfTransactionContainsGivenWord(
                    tr.nameOfPlace,
                    expenseKeywords[i].value
                )
            ) {
                tr.category = expenseKeywords[i].category;
                updatedTrCategory = true;
                break;
            }
        }
        return updatedTrCategory;
    }

    async createTransaction(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
        let category: Category = await this.findCategoryById(createTransactionDto.category);
        const transaction: Transaction = new Transaction(
            createTransactionDto.date,
            createTransactionDto.nameOfPlace,
            createTransactionDto.amount,
            category
        );
        this.checkIfCategoryTypeMatchesTransactionAmount(category, transaction);
        const savedTransaction = await this.transactionRepository.save(transaction);
        if (
            createTransactionDto.categoryKeyword !== null &&
            createTransactionDto.categoryKeyword !== undefined
        ) {
            await this.addKeywordForCategory(category, createTransactionDto.categoryKeyword);
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
        const category: Category = await this.findCategoryById(updateTransactionDto.category);
        this.checkIfCategoryTypeMatchesTransactionAmount(category, transaction);
        const oldTransactionCategoryName = transaction.category.name;
        if (
            oldTransactionCategoryName.toLowerCase() !== 'not_mapped' &&
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

    checkIfCategoryTypeMatchesTransactionAmount(category: Category, transaction: Transaction) {
        if (
            (category.isExpense && transaction.amount > 0) ||
            (!category.isExpense && transaction.amount < 0)
        ) {
            console.log(
                'Category: ',
                category.id,
                ' is expense and tran: ',
                transaction.nameOfPlace,
                ' has amount: ',
                transaction.amount
            );
            throw new BadRequestException(
                'Category can not be of type expense/income while amount is greater/lesser than 0.'
            );
        }
    }

    deleteTransactionById(id: number): void {
        const options: any = { id: id };
        this.transactionRepository
            .delete(options)
            .then(() => {
                console.log('Successfully deleted transaction with id: ', id);
            })
            .catch((res) => {
                console.log('Delete failed for transaction with id: ', id, ' and res: ', res);
            });
    }

    // async checkIfFileAlreadyUploaded(fileName: string): Promise<void> {
    //     const uploadedFiles = await this.findAllUploadedReports();
    //     if (uploadedFiles.find((f) => f === fileName)) {
    //         throw new ConflictException(`File with filename ${fileName} already exists`);
    //     }
    // }

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
                const category: Category = getCategory(transName, transAmount);
                console.log('category for row: ', category);
                console.log('transDate for row: ', transDate);
                console.log('transName for row: ', transName);
                console.log('transAmount for row: ', transAmount);
                if (category && category.name === 'Fuel and liquids') {
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
                        const splitFuelTrans = new Transaction(
                            transDate,
                            transName,
                            transAmount - (transAmount % 500),
                            category
                        );
                        const splitMarketTrans = new Transaction(
                            transDate,
                            transName,
                            transAmount % 500,
                            marketCat
                        );
                        transactions.push(splitMarketTrans);
                        transactions.push(splitFuelTrans);
                    }
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

            //function splitFuelTransaction(transactions: Transaction[], transDate: Date, transName: string,
            //                             transAmount: number, category: TransactionCategory){
            //}

            function checkIfNameOfTransactionContainsGivenWord(
                nameOfTransactionPlace: string,
                wordThatIsContained: string
            ): boolean {
                return nameOfTransactionPlace.includes(wordThatIsContained);
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
                    return categories.find((c) => c.name.toLowerCase() === 'income');
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
                return categories.find((c) => c.name.toLowerCase() === 'not_mapped');
            }
        });
        console.log('SAVING TRANSACTIONS');
        await this.transactionRepository.save(transactions);

        fs.writeFileSync(`${this.uploadedReportsFolderPath}/${file.originalname}`, file.buffer);
        return await this.findAllTransactionsFiltered(
            new TransactionFilterDto(undefined, undefined, undefined)
        );
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

    findAllCategories(): Promise<Category[]> {
        const queryBuilder = this.transactionCategoryRepository
            .createQueryBuilder('transaction-category')
            .leftJoinAndSelect('transaction-category.keywords', 'keywords');
        return queryBuilder.getMany();
    }

    async createCategory(createTransactionCategoryDto: CreateCategoryDto): Promise<Category> {
        const keywords: Keyword[] = createTransactionCategoryDto.keywords.map(
            (kd) => new Keyword(kd.value)
        );
        const category: Category = new Category(
            createTransactionCategoryDto.name,
            keywords,
            createTransactionCategoryDto.isWants,
            createTransactionCategoryDto.color,
            createTransactionCategoryDto.isExpense
        );
        const savedCategory = await this.transactionCategoryRepository.save(category);
        await this.updateTransactionsAfterCategoriesGetUpdated();
        return savedCategory;
    }

    async updateCategory(
        id: number,
        updateTransactionCategoryDto: UpdateCategoryDto
    ): Promise<Category> {
        const category: Category = await this.findCategoryById(id);
        console.log('UPDATING CATEGORY');
        let shouldUpdateTrans: boolean = this.categoryKeywordsGotUpdated(
            await this.keywordService.findAllByCategoryId(category.id),
            updateTransactionCategoryDto.keywords
        );
        const keywords: Keyword[] = await Promise.all(
            updateTransactionCategoryDto.keywords.map(async (kd) => {
                if (kd.id) {
                    const editingKeyword = await this.keywordService.findOne(kd.id);
                    editingKeyword.value = kd.value;
                    return editingKeyword;
                }
                return new Keyword(kd.value);
            })
        );
        try {
            category.name = updateTransactionCategoryDto.name;
            category.keywords = keywords;
            category.isWants = updateTransactionCategoryDto.isWants;
            category.color = updateTransactionCategoryDto.color;
            category.isExpense = updateTransactionCategoryDto.isExpense;
            const cat = await this.transactionCategoryRepository.save(category);
            if (shouldUpdateTrans) {
                await this.updateTransactionsAfterCategoriesGetUpdated();
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
            return true;
        }
        for (const keyword of keywords) {
            if (!ukIds.includes(keyword.id)) {
                return true;
            }
        }
        return false;
    }

    async findCategoryById(id: number): Promise<Category> {
        const cat = await this.transactionCategoryRepository.findOne({ where: { id } });
        if (!cat) {
            throw new NotFoundException(`Category with ${id} was not found`);
        }
        return cat;
    }

    deleteCategoryById(id: number): void {
        const options: any = { id: id };
        this.transactionCategoryRepository
            .delete(options)
            .then(() => {
                console.log('Successfully deleted category with id: ', id);
            })
            .catch((res) => {
                console.log('Delete failed for category with id: ', id, ' and res: ', res);
            });
    }

    async addKeywordForCategory(category: Category, keyword: string): Promise<Category> {
        const catKeywords = await this.keywordService.findAllByCategoryId(category.id);
        catKeywords.push(new Keyword(keyword));
        category.keywords = catKeywords;
        const savedKeyword = await this.transactionCategoryRepository.save(category);
        await this.updateTransactionsAfterCategoriesGetUpdated();
        return savedKeyword;
    }
}
