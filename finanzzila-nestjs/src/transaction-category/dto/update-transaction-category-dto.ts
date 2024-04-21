import { Keyword } from "src/keyword/entities/keyword.entity";

export class UpdateTransactionCategoryDto {
    name: string;
    keywords: Keyword[];

    constructor(name: string, keywords: Keyword[]) {
        this.name = name;
        this.keywords = keywords;
    }
}

