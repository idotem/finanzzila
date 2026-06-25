import axiosInstance from '@/config/axios/axios';

export interface DumpResult {
    path: string;
    categoriesCount: number;
    keywordsCount: number;
}

export default class DatabaseService {
    static async dump(): Promise<DumpResult> {
        const res = await axiosInstance.post('/database/dump');
        return res.data;
    }
}