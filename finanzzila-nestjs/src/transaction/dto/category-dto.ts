import { KeywordDto } from 'src/keyword/dto/keyword-dto';

export class CategoryDto {
    id: number;
    name: string;
    keywords: KeywordDto[];
    isWants: number;
    color: string;

    constructor(id: number, name: string, keywords: KeywordDto[], isWants: number, color: string) {
        this.id = id;
        this.name = name;
        this.keywords = keywords;
        this.isWants = isWants;
        this.color = color;
    }
}
