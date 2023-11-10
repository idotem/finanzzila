import { writable, derived } from "svelte/store";

export const apiData: any = writable({});

export type MonthData = {
	expenses: TransactionEntity[];
	income: TransactionEntity[];
	notMapped: TransactionEntity[];
};

type TransactionEntity = {
	name: string;
	value: number;
};

export const monthData = derived(apiData, ($apiData: any) => {
	console.log($apiData);
	if ($apiData.expenses) {
		return { expenses /*  */: null, income: null, notMapped: null };
	}
	return { expenses /*  */: null, income: null, notMapped: null };
});
