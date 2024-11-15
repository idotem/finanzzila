import { KeywordDto } from 'src/keyword/dto/keyword-dto';

export class CategoryDto {
    id: number;
    name: string;
    keywords: KeywordDto[];
    isWants: number;

    constructor(id: number, name: string, keywords: KeywordDto[], isWants: number) {
        this.id = id;
        this.name = name;
        this.keywords = keywords;
        this.isWants = isWants;
    }
}
