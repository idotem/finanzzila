import type KeywordDto from './KeywordDto';
import { CategoryType } from './CategoryType';

export default class CategoryDto {
    id: number | undefined;
    name: string;
    keywords: KeywordDto[];
    isWants: number | undefined;
    color: string | undefined;
    type: CategoryType | undefined;

    constructor(
        id: number | undefined,
        name: string,
        keywords: KeywordDto[],
        isWants: number | undefined,
        color: string | undefined,
        type: CategoryType | undefined,
    ) {
        this.id = id;
        this.name = name;
        this.keywords = keywords;
        this.isWants = isWants;
        this.color = color;
        this.type = type;
    }
}
