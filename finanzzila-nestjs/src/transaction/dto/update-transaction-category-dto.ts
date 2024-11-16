import { KeywordDto } from 'src/keyword/dto/keyword-dto';

export class UpdateTransactionCategoryDto {
    name: string;
    keywords: KeywordDto[];
    isWants: number;
<<<<<<< HEAD
    color: string;

    constructor(name: string, keywords: KeywordDto[], isWants: number, color: string) {
        this.name = name;
        this.keywords = keywords;
        this.isWants = isWants;
        this.color = color;
=======

    constructor(name: string, keywords: KeywordDto[], isWants: number) {
        this.name = name;
        this.keywords = keywords;
        this.isWants = isWants;
>>>>>>> main
    }
}
