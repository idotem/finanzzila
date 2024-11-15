import type KeywordDto from './KeywordDto';

export default class CategoryDto {
    id: number | undefined;
    name: string;
    keywords: KeywordDto[];
    isWants: number | undefined;

    constructor(
        id: number | undefined,
        name: string,
        keywords: KeywordDto[],
        isWants: number | undefined
    ) {
        this.id = id;
        this.name = name;
        this.keywords = keywords;
        this.isWants = isWants;
    }
}
