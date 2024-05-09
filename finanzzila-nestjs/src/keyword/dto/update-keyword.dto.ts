import { PartialType } from '@nestjs/mapped-types';
import { Keyword } from '../entities/keyword.entity';

export class UpdateKeywordDto extends PartialType(Keyword) {
    value: string;

    constructor(id: number){
        super();
        this.id = id;
    };
}
