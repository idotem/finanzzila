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
}
