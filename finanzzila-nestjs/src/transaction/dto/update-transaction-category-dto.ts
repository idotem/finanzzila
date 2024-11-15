import { KeywordDto } from 'src/keyword/dto/keyword-dto';

export class UpdateTransactionCategoryDto {
    name: string;
    keywords: KeywordDto[];
    isWants: number;

    constructor(name: string, keywords: KeywordDto[], isWants: number) {
        this.name = name;
        this.keywords = keywords;
        this.isWants = isWants;
    }
}
