export class TransactionFilterDto{
    dateFrom: Date | undefined;
    dateTo: Date | undefined;
    categoryId: number | undefined;

    constructor(dateFrom: Date, dateTo: Date, categoryId: number){
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
        this.categoryId = categoryId;
    }
    
}
