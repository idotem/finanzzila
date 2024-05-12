import { KeywordDto } from "src/keyword/dto/keyword-dto";

export class CreateTransactionCategoryDto {
    name: string;
    keywords: KeywordDto[];

    constructor(name: string, keywords: KeywordDto[]) {
        this.name = name;
        this.keywords = keywords;
    }
}

