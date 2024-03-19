import axiosInstance from '@/config/axios/axios';
import Transaction from '../model/Transaction';

export default class TransactionService {
    static async getAllFiltered(): Promise<Transaction[]> {
        const res = await axiosInstance.get('/transactions');
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
        console.log(res);
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
