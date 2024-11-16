import { KeywordDto } from 'src/keyword/dto/keyword-dto';

export class UpdateTransactionCategoryDto {
    name: string;
    keywords: KeywordDto[];
    isWants: number;
    color: string;

    constructor(name: string, keywords: KeywordDto[], isWants: number, color: string) {
        this.name = name;
        this.keywords = keywords;
        this.isWants = isWants;
        this.color = color;
    }
}
