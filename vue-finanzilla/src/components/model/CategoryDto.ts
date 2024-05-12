import type KeywordDto from './KeywordDto';

export default class CategoryDto {
    id: number | undefined;
    name: string;
    keywords: KeywordDto[];

    constructor(id: number | undefined, name: string, keywords: KeywordDto[]) {
        this.id = id;
        this.name = name;
        this.keywords = keywords;
    }
}
