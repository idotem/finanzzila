import { KeywordDto } from 'src/keyword/dto/keyword-dto';

export class CategoryDto {
    id: number;
    name: string;
    keywords: KeywordDto[];
    isWants: number;
<<<<<<< HEAD
    color: string;

    constructor(id: number, name: string, keywords: KeywordDto[], isWants: number, color: string) {
=======

    constructor(id: number, name: string, keywords: KeywordDto[], isWants: number) {
>>>>>>> main
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
