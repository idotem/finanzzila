import type KeywordDto from './KeywordDto';

export class Category {
    id: number | undefined;
    name: string;
    keywords: KeywordDto[];
    isWants: number | undefined;
<<<<<<< HEAD
    color: string | undefined;
=======
>>>>>>> main

    constructor(
        id: number | undefined,
        name: string,
        keywords: KeywordDto[],
<<<<<<< HEAD
        isWants: number | undefined,
        color: string | undefined
=======
        isWants: number | undefined
>>>>>>> main
    ) {
        this.id = id;
        this.name = name;
        this.keywords = keywords;
        this.isWants = isWants;
<<<<<<< HEAD
        this.color = color;
=======
>>>>>>> main
    }
}
