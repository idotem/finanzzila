export default class TransactionFilterDto {
    dateFrom: Date | undefined;
    dateTo: Date | undefined;
    categoryId: number | undefined;

    constructor(
        dateFrom: Date | undefined,
        dateTo: Date | undefined,
        categoryId: number | undefined
    ) {
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
        this.categoryId = categoryId;
    }
}
