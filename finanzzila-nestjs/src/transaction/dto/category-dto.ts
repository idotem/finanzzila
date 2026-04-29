import { KeywordDto } from 'src/keyword/dto/keyword-dto';
import { CategoryType } from '../enums/category-type.enum';

export class CategoryDto {
    id: number;
    name: string;
    keywords: KeywordDto[];
    isWants: number;
    color: string;
    type: CategoryType;

    constructor(
        id: number,
        name: string,
        keywords: KeywordDto[],
        isWants: number,
        color: string,
        type: CategoryType
    ) {
        this.id = id;
        this.name = name;
        this.keywords = keywords;
        this.isWants = isWants;
        this.color = color;
        this.type = type;
    }
}
