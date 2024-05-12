import { Controller, Get, Param } from '@nestjs/common';
import { KeywordService } from './keyword.service';

@Controller('keywords')
export class KeywordController {
    constructor(private readonly keywordService: KeywordService) { }

    @Get()
    findAll() {
        return this.keywordService.findAll();
    }

    @Get('categories/:id')
    findAllByCategory(@Param(':id') id: number) {
        return this.keywordService.findAllByCategoryId(+id);
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.keywordService.findOne(+id);
    }
}
