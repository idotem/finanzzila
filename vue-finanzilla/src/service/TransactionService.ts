import axiosInstance from '@/config/axios/axios';
import Transaction from '../components/model/Transaction';
import type TransactionFilterDto from '../components/model/TransactionFilterDto';

export default class TransactionService {
    static async getAllFiltered(
        filter: TransactionFilterDto
    ): Promise<Transaction[]> {
        console.log(filter);
        const res = await axiosInstance.get('/transactions', {
            params: {
                dateFrom: filter.dateFrom,
                dateTo: filter.dateTo,
                categoryId: filter.categoryId
            }
        });
        const transactions: Transaction[] = res.data.map(
            (t: any) =>
                new Transaction(
                    t.id,
                    t.date,
                    t.nameOfPlace,
                    t.amount,
                    t.category
                )
        );
        return transactions;
    }

    static async uploadFileTransactions(file: File): Promise<Transaction[]> {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axiosInstance.post('transactions/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        const transactions: Transaction[] = res.data.map(
            (t: any) =>
                new Transaction(
                    t.id,
                    t.date,
                    t.nameOfPlace,
                    t.amount,
                    t.category
                )
        );
        return transactions;
    }
}
