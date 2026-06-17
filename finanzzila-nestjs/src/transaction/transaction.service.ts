import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Workbook } from 'exceljs';
import Transaction from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
import { CategoryFilterDto } from './dto/filter-category-dto';
import { CategoryType } from './enums/category-type.enum';

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

    async updateTransactionsAfterCategoriesGetUpdated(): Promise<void> {
        const categories: Category[] = await this.findAllCategories();
        const notMappedCategory: Category = categories.find(
            (c: Category) => c.name.toLowerCase() === 'not_mapped'
        );
        const transactions: Transaction[] = await this.findAllTransactionsFiltered(
            new TransactionFilterDto(undefined, undefined, undefined)
        );
        const expenseKeywords: Keyword[] = await this.keywordService.findAllByCategoryType(
            CategoryType.EXPENSE
        );
        const incomeKeywords: Keyword[] = await this.keywordService.findAllByCategoryType(
            CategoryType.INCOME
        );
        const savingAccountKeywords: Keyword[] = await this.keywordService.findAllByCategoryType(
            CategoryType.SAVING_ACCOUNT
        );
        let updatedTrCategory: boolean = false;
        for (const tr of transactions) {
            if (tr.manuallyOverried) {
                continue;
            }
            updatedTrCategory = this.determineCategoryFromTrNameAndKeywords(
                savingAccountKeywords,
                tr
            );
            if (!updatedTrCategory) {
                if (tr.amount > 0) {
                    updatedTrCategory = this.determineCategoryFromTrNameAndKeywords(
                        incomeKeywords,
                        tr
                    );
                } else if (tr.amount <= 0) {
                    updatedTrCategory = this.determineCategoryFromTrNameAndKeywords(
                        expenseKeywords,
                        tr
                    );
                }
            }
            if (!updatedTrCategory) {
                tr.category = notMappedCategory;
            }
            updatedTrCategory = false;
        }
        await this.transactionRepository.save(transactions);
    }

    private determineCategoryFromTrNameAndKeywords(keywords: Keyword[], tr: Transaction) {
        for (let i = 0; i < keywords.length; i++) {
            if (this.checkIfNameOfTransactionContainsGivenWord(tr.nameOfPlace, keywords[i].value)) {
                tr.category = keywords[i].category;
                return true;
            }
        }
        return false;
    }

    async createTransaction(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
        let category: Category = await this.findCategoryById(createTransactionDto.category);
        const transaction: Transaction = new Transaction(
            createTransactionDto.date,
            createTransactionDto.nameOfPlace,
            createTransactionDto.amount,
            category
        );
        this.checkIfCategoryTypeMatchesTransactionAmount(category, createTransactionDto.amount);
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
        this.checkIfCategoryTypeMatchesTransactionAmount(category, updateTransactionDto.amount);
        const oldTransactionCategoryName: string = transaction.category.name;
        if (oldTransactionCategoryName !== category.name) {
            transaction.manuallyOverried = true;
        }
        transaction.category = category;
        transaction.amount = updateTransactionDto.amount;
        transaction.date = updateTransactionDto.date;
        transaction.nameOfPlace = updateTransactionDto.nameOfPlace;
        const savedTransaction: Transaction = await this.transactionRepository.save(transaction);
        if (
            updateTransactionDto.categoryKeyword !== null &&
            updateTransactionDto.categoryKeyword !== undefined
        ) {
            await this.addKeywordForCategory(category, updateTransactionDto.categoryKeyword);
        }
        return savedTransaction;
    }

    checkIfCategoryTypeMatchesTransactionAmount(category: Category, amount: number) {
        if (category.type === CategoryType.SAVING_ACCOUNT) {
            return; // SavingAccount can be both positive and negative
        }
        if (
            (category.type === CategoryType.EXPENSE && amount > 0) ||
            (category.type === CategoryType.INCOME && amount < 0)
        ) {
            console.log('Category: ', category.id, ' is expense/income and tran amount: ', amount);
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

    async populateTransactions(
        file: Express.Multer.File,
        bank: string = 'KOMERCIJALNA BANKA'
    ): Promise<Transaction[]> {
        //await this.checkIfFileAlreadyUploaded(file.originalname);
        const categories = await this.findAllCategories();
        const expenseKeywords: Keyword[] = await this.keywordService.findAllByCategoryType(
            CategoryType.EXPENSE
        );
        const incomeKeywords: Keyword[] = await this.keywordService.findAllByCategoryType(
            CategoryType.INCOME
        );
        const savingAccountKeywords: Keyword[] = await this.keywordService.findAllByCategoryType(
            CategoryType.SAVING_ACCOUNT
        );
        const transactions: Transaction[] = [];
        console.log('Transaction population starting: ', file);

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
            for (const sKeyword of savingAccountKeywords) {
                if (
                    checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        sKeyword.value
                    )
                ) {
                    return sKeyword.category;
                }
            }
            if (amountOfTransaction > 0) {
                for (const iKeyword of incomeKeywords) {
                    if (
                        checkIfNameOfTransactionContainsGivenWord(
                            nameOfTransactionPlace,
                            iKeyword.value
                        )
                    ) {
                        return iKeyword.category;
                    }
                }
            }
            for (const eKeyword of expenseKeywords) {
                if (
                    checkIfNameOfTransactionContainsGivenWord(
                        nameOfTransactionPlace,
                        eKeyword.value
                    )
                ) {
                    return eKeyword.category;
                }
            }
            return categories.find((c: Category) => c.name.toLowerCase() === 'not_mapped');
        }

        const processRow = (dateVal: any, nameVal: any, amountVal: any) => {
            const transDate: any = dateVal ? dateVal : '01.01.2024';
            const transName: string = nameVal ? nameVal.toString() : 'TRANSACTION WITHOUT NAME';
            const transAmount: number = parseInt(amountVal) ? parseInt(amountVal) : 0;
            const category: Category = getCategory(transName, transAmount);
            console.log('category for row: ', category);
            console.log('transDate for row: ', transDate);
            console.log('transName for row: ', transName);
            console.log('transAmount for row: ', transAmount);
            if (category) {
                const transaction = new Transaction(transDate, transName, transAmount, category);
                transactions.push(transaction);
            }
        };

        if (bank === 'NLB BANKA') {
            // Helper: parse a raw cell value to a JS number, handling both numeric and string formats.
            const parseAmount = (val: any): number => {
                if (val === undefined || val === null || val === '') return 0;
                if (typeof val === 'number') return val;
                // Handle European number format: "19.725,00" → 19725
                const cleaned = String(val).replace(/\./g, '').replace(',', '.');
                return parseFloat(cleaned) || 0;
            };

            if (file.originalname.toLowerCase().endsWith('.xls')) {
                const xlsxLib = require('xlsx');
                const wb = xlsxLib.read(file.buffer, { type: 'buffer', cellDates: true });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = xlsxLib.utils.sheet_to_json(ws, { header: 1 });
                for (let i = 27; i < rows.length; i++) {
                    const row: any[] = rows[i] as any[];
                    if (!row) continue;
                    const dateVal = row[4];
                    const nameVal = row[5];
                    const expenseRaw = row[15];
                    const incomeRaw = row[17];

                    if (dateVal) {
                        const expenseNum = parseAmount(expenseRaw);
                        const incomeNum = parseAmount(incomeRaw);
                        let amountVal = 0;
                        if (expenseNum !== 0) {
                            amountVal = -expenseNum;
                        } else if (incomeNum !== 0) {
                            amountVal = incomeNum;
                        }
                        processRow(dateVal, nameVal, amountVal);
                    }
                }
            } else {
                const workbook = new Workbook();
                await workbook.xlsx.load(file.buffer as any);
                const worksheet = workbook.worksheets[0];
                worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
                    if (rowNumber < 28) return;

                    const dateVal = row.values[5];
                    const nameVal = row.values[6];
                    const expenseRaw = row.values[16];
                    const incomeRaw = row.values[18];

                    if (dateVal) {
                        const expenseNum = parseAmount(expenseRaw);
                        const incomeNum = parseAmount(incomeRaw);
                        let amountVal = 0;
                        if (expenseNum !== 0) {
                            amountVal = -expenseNum;
                        } else if (incomeNum !== 0) {
                            amountVal = incomeNum;
                        }
                        processRow(dateVal, nameVal, amountVal);
                    }
                });
            }
        } else {
            if (file.originalname.toLowerCase().endsWith('.xls')) {
                const xlsxLib = require('xlsx');
                const wb = xlsxLib.read(file.buffer, { type: 'buffer', cellDates: true });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = xlsxLib.utils.sheet_to_json(ws, { header: 1 });
                rows.forEach((row: any[], index: number) => {
                    if (index === 0) return;
                    processRow(row[0], row[1], row[3]);
                });
            } else {
                const workbook = new Workbook();
                await workbook.xlsx.load(file.buffer as any);
                const worksheet = workbook.worksheets[0];
                worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
                    if (rowNumber === 1) {
                        return;
                    }
                    processRow(row.values[1], row.values[2], row.values[4]);
                });
            }
        }
        console.log('SAVING TRANSACTIONS');
        await this.transactionRepository.save(transactions);

        fs.writeFileSync(
            `${this.uploadedReportsFolderPath}/${file.originalname}`,
            file.buffer as any
        );
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

    async bulkDeleteTransactions(ids: number[]): Promise<void> {
        if (!ids || ids.length === 0) return;
        await this.transactionRepository.delete({ id: In(ids) } as any);
        console.log('Successfully bulk deleted transactions with ids: ', ids);
    }

    async deleteAllTransactions(): Promise<void> {
        await this.transactionRepository.clear();
        console.log('Successfully deleted all transactions');
    }

    async bulkUpdateCategory(ids: number[], categoryId: number): Promise<Transaction[]> {
        if (!ids || ids.length === 0) return [];
        const category: Category = await this.findCategoryById(categoryId);
        const transactions: Transaction[] = await this.transactionRepository.find({
            where: { id: In(ids) } as any,
            relations: ['category']
        });

        for (const transaction of transactions) {
            this.checkIfCategoryTypeMatchesTransactionAmount(category, transaction.amount);
            if (transaction.category?.name !== category.name) {
                transaction.manuallyOverried = true;
            }
            transaction.category = category;
        }

        return await this.transactionRepository.save(transactions);
    }

    //CATEGORY:

    findAllCategories(): Promise<Category[]> {
        const queryBuilder = this.transactionCategoryRepository
            .createQueryBuilder('transaction-category')
            .leftJoinAndSelect('transaction-category.keywords', 'keywords');
        return queryBuilder.getMany();
    }

    findAllFilteredCategories(filter: CategoryFilterDto): Promise<Category[]> {
        const queryBuilder = this.transactionCategoryRepository
            .createQueryBuilder('category')
            .leftJoinAndSelect('category.keywords', 'keywords');
        if (filter.name) {
            queryBuilder.andWhere('category.name LIKE :name', {
                name: `%${filter.name}%`
            });
        }
        if (filter.isWants) {
            queryBuilder.andWhere('category.isWants = :isWants', {
                isWants: filter.isWants
            });
        }
        if (filter.type !== undefined && filter.type !== null) {
            queryBuilder.andWhere('category.type = :type', {
                type: filter.type
            });
        }
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
            createTransactionCategoryDto.type
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
            category.type = updateTransactionCategoryDto.type;
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
