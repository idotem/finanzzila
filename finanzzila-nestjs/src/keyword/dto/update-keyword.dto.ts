import { PartialType } from '@nestjs/mapped-types';
import { Keyword } from '../entities/keyword.entity';

export class UpdateKeywordDto extends PartialType(Keyword) {
    id: number;
    categoryId: number;
    value: string;

    constructor(id: number, categoryId: number, value: string){
        super();
        this.id = id;
        this.categoryId = categoryId;
        this.value = value;
    };
}
