import { KeywordDto } from "src/keyword/dto/keyword-dto";

export class CategoryDto {
    id: number;
    name: string;
    keywords: KeywordDto[];

    constructor(id: number, name: string, keywords: KeywordDto[]) {
        this.id = id;
        this.name = name;
        this.keywords = keywords;
    }
}

