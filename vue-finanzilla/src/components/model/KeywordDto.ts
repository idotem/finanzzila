export default class KeywordDto {
    id: number | undefined;
    value: string;

    constructor(id: number | undefined, value: string) {
        this.id = id;
        this.value = value;
    }
}
