import type KeywordDto from './KeywordDto';

export class Category {
    id: number | undefined;
    name: string;
    keywords: KeywordDto[];

    constructor(id: number | undefined, name: string, keywords: KeywordDto[]) {
        this.id = id;
        this.name = name;
        this.keywords = keywords;
    }
}
