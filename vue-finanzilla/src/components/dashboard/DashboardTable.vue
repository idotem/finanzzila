<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import {
    VFileInput,
    VBtn,
    VContainer,
    VRow,
    VSheet,
    VCol,
    VChip,
    VHover,
    VSelect,
    VOverlay,
    VProgressCircular
} from 'vuetify/components';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import TransactionsChart from '../charts/TransactionsChart.vue';
import Transaction from '../model/Transaction';
import TransactionFilterDto from '../model/TransactionFilterDto';
import TransactionService from '../../service/TransactionService';
import type { TransactionCategory } from '../model/TransactionCategory';
import CategoryService from '../../service/CategoryService';
import { convertNumberToCurrency } from '../../utils/CurrencyConverter';

const timePeriods = ['All time', 'Yearly', 'Monthly'];

const transactions = ref<Transaction[]>([]);
const categories = ref<TransactionCategory[]>([]);
const errorMessage = ref('');
const files = ref<File[] | undefined>();
const rangeDateFilter = ref<Date[]>([]);
const timePeriod = ref<string>('All time');
const filterCategoryId = ref<number | undefined>(undefined);
const totalExpenses = ref<number>();
const isLoading = ref<boolean>(false);
const totalIncome = ref<number>();
const differenceExpensesIncome = ref<number>();
const currentCurrency = ref<string>('MKD');

onMounted(async () => {
    try {
        await fetchCategories();
        await fetchTransactions();
    } catch (error) {
        errorMessage.value = 'Error fetching data';
        console.error('Error fetching data:', error);
    }
});

const fetchTransactions = async () => {
    const filter: TransactionFilterDto = new TransactionFilterDto(
        rangeDateFilter.value ? rangeDateFilter.value[0] : undefined,
        rangeDateFilter.value ? rangeDateFilter.value[1] : undefined,
        filterCategoryId.value
    );
    TransactionService.getAllFiltered(filter)
        .then((tr: Transaction[]) => {
            transactions.value = tr;
            calculateStats(tr);
            isLoading.value = false;
        })
        .catch(() => {
            isLoading.value = false;
        });
};

watch(rangeDateFilter, () => {
    fetchTransactions();
});

watch(filterCategoryId, () => {
    fetchTransactions();
});

const fetchCategories = async () => {
    isLoading.value = true;
    CategoryService.getAllTransactionCategories()
        .then((trC: TransactionCategory[]) => {
            categories.value = trC;
            isLoading.value = false;
        })
        .catch(() => {
            isLoading.value = false;
        });
};

function calculateStats(transactions: Transaction[]) {
    // these should be in minus(-)
    totalExpenses.value = transactions.reduce(
        (acc, curr) => (curr.category?.name !== 'Income' ? (acc += curr.amount) : acc),
        0
    );
    totalIncome.value = transactions.reduce(
        (acc, curr) => (curr.category?.name === 'Income' ? (acc += curr.amount) : acc),
        0
    );
    differenceExpensesIncome.value = totalIncome.value + totalExpenses.value;
}

async function uploadFile() {
    isLoading.value = true;
    if (files.value && files.value.length > 0) {
        try {
            await TransactionService.uploadFileTransactions(files.value[0]).then(
                (tr: Transaction[]) => {
                    transactions.value = tr;
                    calculateStats(tr);
                    files.value = undefined;
                    isLoading.value = false;
                }
            );
        } catch (error) {
            console.error(error);
            files.value = undefined;
            isLoading.value = false;
        }
    }
}

function clearDateRange() {
    rangeDateFilter.value = [];
}
</script>

<template>
    <main>
        <h1 class="text-3xl text-black">Dashboard</h1>
        <v-overlay :model-value="isLoading" class="align-center justify-center">
            <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
        </v-overlay>
        <v-container>
            <v-row align="start">
                <v-col cols="10" sm="4" md="3">
                    <v-file-input
                        v-model="files"
                        class="text-black"
                        density="default"
                        base-color="#000000"
                        color="#000000"
                        label="Upload file with transactions"
                        accept=".xlsx"
                        variant="outlined"
                        bg-color="#2dd4bf"
                    >
                        <template v-slot:selection="{ fileNames }">
                            <template v-for="(fileName, index) in fileNames" :key="fileName">
                                <v-chip
                                    v-if="index < 2"
                                    class="text-black-500 text-xl bg-teal-500 border-[1px] border-[#022754] rounded-lg"
                                    size="large"
                                    label
                                >
                                    {{ fileName }}
                                </v-chip>
                            </template>
                        </template>
                    </v-file-input>
                </v-col>
                <v-col cols="2" class="m-auto">
                    <v-hover>
                        <template v-slot:default="{ isHovering, props }">
                            <v-btn
                                v-bind="props"
                                v-if="files?.length"
                                :color="isHovering ? '#022754' : '#3b0764'"
                                @click="uploadFile"
                                >Upload</v-btn
                            >
                        </template>
                    </v-hover>
                </v-col>
                <v-col cols="0" sm="1" md="3">
                    <v-select
                        :items="timePeriods"
                        label="Time Period (Averages)"
                        density="compact"
                        v-model="timePeriod"
                        item-color="success"
                        bg-color="#212121"
                    >
                    </v-select>
                </v-col>
                <v-col cols="12" sm="5" md="4">
                    <VueDatePicker
                        dark
                        v-model="rangeDateFilter"
                        :enable-time-picker="false"
                        :range="{ partialRange: false }"
                        placeholder="Pick a date range"
                        color="success"
                        :on-cleared="() => clearDateRange()"
                    >
                    </VueDatePicker>
                </v-col>
            </v-row>
            <v-row align="start" class="mb-2 mt-0">
                <v-col cols="12" md="12" xl="6" :key="1" style="height: 36rem">
                    <v-sheet
                        class="p-4 shadow-black shadow-lg bg-cyan-950 rounded-xl"
                        style="
                            height: 34rem;
                            overflow-x: hidden;
                            overflow-y: hidden;
                            min-width: 40rem;
                        "
                    >
                        <div
                            style="height: 31rem; min-width: 40rem"
                            v-if="transactions && transactions.length !== 0"
                        >
                            <TransactionsChart
                                :transactionsProp="transactions"
                                :timePeriodProp="timePeriod"
                                chartTypeProp="Doughnut"
                                :dateFilterProp="rangeDateFilter ? rangeDateFilter : []"
                            >
                            </TransactionsChart>
                        </div>
                        <h2 v-else-if="errorMessage">{{ errorMessage }}</h2>
                        <h1 v-else class="text-lg mt-5 text-slate-300">No transactions, no PIE</h1>
                    </v-sheet>
                </v-col>
                <v-col cols="12" md="12" xl="6" key="2" style="height: 36rem">
                    <v-sheet
                        class="p-4 shadow-black shadow-lg pb-10 bg-cyan-950 rounded-xl items-center"
                        style="
                            height: 34rem;
                            overflow-x: hidden;
                            overflow-y: hidden;
                            min-width: 40rem;
                        "
                    >
                        <div
                            style="height: 31rem; min-width: 40rem"
                            v-if="transactions && transactions.length !== 0"
                        >
                            <TransactionsChart
                                :transactionsProp="transactions"
                                :timePeriodProp="timePeriod"
                                chartTypeProp="Bar"
                                :dateFilterProp="rangeDateFilter"
                            >
                            </TransactionsChart>
                        </div>
                        <h2 v-else-if="errorMessage">{{ errorMessage }}</h2>
                        <h1 v-else class="text-lg mt-5 text-slate-300">No transactions, no BAR</h1>
                    </v-sheet>
                </v-col>
            </v-row>
            <v-row
                class="bg-cyan-950 text-slate-200 p-4 pb-10 rounded-xl shadow-black shadow-lg mb-4"
            >
                <v-col cols="12">
                    <h1 class="text-center text-xl">General statistics</h1>
                </v-col>
                <v-col class="text-lg" md="6" sm="12">
                    <select
                        class="w-1/5 h-9 rounded-sm bg-[#212121] text-slate-300 p-2"
                        name="changeCurrency"
                        v-model="currentCurrency"
                    >
                        <option value="MKD">MKD</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                    <p>
                        Total amount earned:
                        {{ convertNumberToCurrency(totalIncome, currentCurrency) }}
                    </p>
                    <p>
                        Total amount spend:
                        {{ convertNumberToCurrency(totalExpenses, currentCurrency) }}
                    </p>
                    <p>
                        Difference:
                        {{ convertNumberToCurrency(differenceExpensesIncome, currentCurrency) }}
                    </p>
                    <p>
                        First transaction date:
                        {{ transactions[transactions.length - 1]?.date }}
                    </p>
                    <p>Last transaction date: {{ transactions[0]?.date }}</p>
                </v-col>
                <v-col md="6" sm="12"> </v-col>
            </v-row>
        </v-container>
    </main>
</template>

<style scoped>
h1,
h2 {
    text-align: center;
}
</style>
