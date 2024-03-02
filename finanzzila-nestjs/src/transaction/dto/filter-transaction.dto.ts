export class TransactionFilterDto{
    dateFrom: Date;
    dateTo: Date;
    categoryId: number;

    constructor(dateFrom: Date, dateTo: Date, categoryId: number){
        this.dateFrom = dateFrom;
        this.dateTo = dateTo;
        this.categoryId = categoryId;
    }
    
}
