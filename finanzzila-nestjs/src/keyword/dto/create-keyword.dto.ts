export class CreateKeywordDto {
    categoryId: number;
    value: string;

    constructor(categoryId: number, value: string){
        this.categoryId = categoryId;
        this.value = value;
    };
}
