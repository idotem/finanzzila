export class Category {
    id: number;
    name: string;
    keywords: string[];

    constructor(id: number, name: string, keywords: string[]) {
        this.id = id;
        this.name = name;
        this.keywords = keywords;
    }
}