import { KeywordDto } from 'src/keyword/dto/keyword-dto';

export class CreateCategoryDto {
    name: string;
    keywords: KeywordDto[];
    isWants: number;
    color: string;
    isExpense: number;

    constructor(
        name: string,
        keywords: KeywordDto[],
        isWants: number,
        color: string,
        isExpense: number
    ) {
        this.name = name;
        this.keywords = keywords;
        this.isWants = isWants;
        this.color = color;
        this.isExpense = isExpense;
    }
}
