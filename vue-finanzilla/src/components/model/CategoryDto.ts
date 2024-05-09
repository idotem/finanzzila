import type CreateKeywordDto from './CreateKeywordDto';

export default class CategoryDto {
    id: number | undefined;
    name: string;
    keywords: CreateKeywordDto[];

    constructor(
        id: number | undefined,
        name: string,
        keywords: CreateKeywordDto[]
    ) {
        this.id = id;
        this.name = name;
        this.keywords = keywords;
    }
}
