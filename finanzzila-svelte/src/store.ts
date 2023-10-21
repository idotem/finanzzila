import { writable, derived } from "svelte/store";

export const apiData: any = writable([]);

export type ExpensesEntity = {
	name: string;
	value: number;
};

export const expenses = derived(apiData, ($apiData: any) => {
	if ($apiData) {
		return $apiData.map((expense: ExpensesEntity) => expense);
	}
	return [];
});
