import { CategoryType } from '../enums/category-type.enum';

export class CategoryFilterDto {
    name: string | undefined;
    isWants: number | undefined;
    type: CategoryType | undefined;

    constructor(name: string, isWants: number, type: CategoryType) {
        this.name = name;
        this.isWants = isWants;
        this.type = type;
    }
}
