<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import {
    VBtn,
    VCard,
    VCardText,
    VChip,
    VCol,
    VContainer,
    VFileInput,
    VHover,
    VOverlay,
    VProgressCircular,
    VRow,
    VSelect,
    VDivider
} from 'vuetify/components';
import { useTheme } from 'vuetify';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import TransactionsChart from '../charts/TransactionsChart.vue';
import Transaction from '../model/Transaction';
import TransactionFilterDto from '../model/TransactionFilterDto';
import TransactionService from '../../service/TransactionService';
import type { TransactionCategory } from '../model/TransactionCategory';
import CategoryService from '../../service/CategoryService';
import { convertNumberToCurrency } from '../../utils/CurrencyConverter';
import CommonCalculations from '../common/CommonCalculations';

const theme = useTheme();

const timePeriods = ['All time', 'Yearly', 'Monthly'];
const currencies = ['MKD', 'USD', 'EUR'];

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
const wantsTransactionsSum = ref<number>();
const needsTransactionsSum = ref<number>();
const notWantsNorNeedsTranSum = ref<number>();

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
        rangeDateFilter.value && rangeDateFilter.value.length > 0 ? rangeDateFilter.value[0] : undefined,
        rangeDateFilter.value && rangeDateFilter.value.length > 1 ? rangeDateFilter.value[1] : undefined,
        filterCategoryId.value
    );
    TransactionService.getAllFiltered(filter)
        .then((tr: Transaction[]) => {
            transactions.value = tr;
            calculateStats(tr, timePeriod.value);
            calculateWantsAndNeeds(tr);
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

watch(timePeriod, () => {
    calculateStats(transactions.value, timePeriod.value);
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

function calculateStats(transactions: Transaction[], timePeriod: string) {
    let incomeSum: number = 0;
    let expensesSum: number = 0;
    transactions.forEach((transaction) => {
        if (transaction.category?.isExpense === 0 && transaction.amount > 0) {
            incomeSum += transaction.amount;
        } else {
            expensesSum += transaction.amount;
        }
    });
    const delimiter: number = CommonCalculations.getDelimiterBasedOnTimePeriod(
        transactions,
        timePeriod
    );
    totalIncome.value = incomeSum / delimiter;
    totalExpenses.value = expensesSum / delimiter;
    differenceExpensesIncome.value = totalIncome.value + totalExpenses.value;
}

async function uploadFile() {
    isLoading.value = true;
    if (files.value && files.value.length > 0) {
        try {
            await TransactionService.uploadFileTransactions(files.value[0]).then(
                (tr: Transaction[]) => {
                    transactions.value = tr;
                    calculateStats(tr, timePeriod.value);
                    calculateWantsAndNeeds(tr);
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

function calculateWantsAndNeeds(transactions: Transaction[]) {
    let wantsSum: number = 0;
    let needsSum: number = 0;
    let notWantsNorNeeds: number = 0;
    transactions.forEach((transaction) => {
        if (transaction.category?.isExpense === 0) {
            return;
        }
        switch (transaction.category.isWants) {
            case 1:
                wantsSum += transaction.amount;
                break;
            case 0:
                needsSum += transaction.amount;
                break;
            default:
                notWantsNorNeeds += transaction.amount;
                break;
        }
    });
    wantsTransactionsSum.value = wantsSum;
    needsTransactionsSum.value = needsSum;
    notWantsNorNeedsTranSum.value = notWantsNorNeeds;
}

function formatDate(date: Date | string | undefined | null): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}
</script>

<template>
    <main class="py-6 px-4">
        <v-overlay :model-value="isLoading" class="align-center justify-center">
            <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
        </v-overlay>

        <v-container fluid class="pa-0 max-w-7xl mx-auto">
            <!-- Filter Section -->
            <v-row class="mb-6" align="center">
                <v-col cols="12" sm="5" md="4" lg="3">
                    <v-file-input
                        v-model="files"
                        density="compact"
                        color="primary"
                        bg-color="surface"
                        label="Upload file with transactions"
                        accept=".xlsx,.xls"
                        variant="outlined"
                        hide-details
                        prepend-icon=""
                        prepend-inner-icon="attach_file"
                    >
                        <template v-slot:selection="{ fileNames }">
                            <template v-for="(fileName, index) in fileNames" :key="fileName">
                                <v-chip
                                    v-if="index < 1"
                                    color="primary"
                                    size="small"
                                    label
                                    class="font-weight-bold"
                                >
                                    {{ fileName }}
                                </v-chip>
                            </template>
                        </template>
                    </v-file-input>
                </v-col>
                <v-col cols="12" sm="3" md="2" lg="2">
                    <v-btn
                        v-if="files?.length"
                        color="primary"
                        variant="elevated"
                        elevation="2"
                        class="text-none font-weight-bold w-100"
                        height="40"
                        @click="uploadFile"
                    >
                        Upload
                    </v-btn>
                </v-col>
                <v-spacer class="hidden-sm-and-down"></v-spacer>
                <v-col cols="12" sm="4" md="3" lg="3">
                    <v-select
                        :items="timePeriods"
                        label="Time Period (Averages)"
                        density="compact"
                        v-model="timePeriod"
                        color="primary"
                        bg-color="surface"
                        variant="outlined"
                        hide-details
                    ></v-select>
                </v-col>
                <v-col cols="12" sm="12" md="3" lg="4">
                    <VueDatePicker
                        :dark="theme.global.current.value.dark"
                        v-model="rangeDateFilter"
                        :enable-time-picker="false"
                        :range="{ partialRange: false }"
                        placeholder="Pick a date range"
                        :on-cleared="() => clearDateRange()"
                        class="modern-dp"
                    ></VueDatePicker>
                </v-col>
            </v-row>

            <!-- Charts Section (Bar Chart Full Width) -->
            <v-row class="mb-6">
                <v-col cols="12">
                    <v-card color="surface" elevation="2" class="rounded-xl w-100 d-flex flex-column">
                        <v-card-text class="flex-grow-1 d-flex flex-column align-center justify-center pa-6" style="min-height: 400px;">
                            <div v-if="transactions && transactions.length !== 0" class="w-100 h-100 pb-4" style="min-height: 350px;">
                                <TransactionsChart
                                    :transactionsProp="transactions"
                                    :timePeriodProp="timePeriod"
                                    chartTypeProp="Bar"
                                    :dateFilterProp="rangeDateFilter ? rangeDateFilter : []"
                                />
                            </div>
                            <div v-else class="text-center d-flex flex-column align-center text-medium-emphasis">
                                <v-icon size="64" color="grey-lighten-1" class="mb-4">bar_chart</v-icon>
                                <h2 class="text-h6 font-weight-medium" v-if="errorMessage">{{ errorMessage }}</h2>
                                <h2 class="text-h6 font-weight-medium" v-else>No transactions available</h2>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <!-- Bottom Row: Pie Chart AND Summary -->
            <v-row class="mb-6 align-stretch" align="stretch">
                <!-- Pie Chart Column -->
                <v-col cols="12" lg="12" class="d-flex pie-col">
                    <v-card color="surface" elevation="2" class="rounded-xl w-100 d-flex flex-column">
                        <v-card-text class="flex-grow-1 d-flex flex-column align-center justify-center pa-6" style="min-height: 400px;">
                            <div v-if="transactions && transactions.length !== 0" class="w-100 h-100 pb-4" style="min-height: 350px;">
                                <TransactionsChart
                                    :transactionsProp="transactions"
                                    :timePeriodProp="timePeriod"
                                    chartTypeProp="Doughnut"
                                    :dateFilterProp="rangeDateFilter ? rangeDateFilter : []"
                                />
                            </div>
                            <div v-else class="text-center d-flex flex-column align-center text-medium-emphasis">
                                <v-icon size="64" color="grey-lighten-1" class="mb-4">pie_chart</v-icon>
                                <h2 class="text-h6 font-weight-medium" v-if="errorMessage">{{ errorMessage }}</h2>
                                <h2 class="text-h6 font-weight-medium" v-else>No transactions available</h2>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- Statistics Section Column -->
                <v-col cols="12" lg="12" class="d-flex stats-col">
                    <v-card color="surface" elevation="2" class="rounded-xl w-100 d-flex flex-column">
                        <v-card-text class="pa-6 w-100 h-100 d-flex flex-column justify-center">
                            <div class="d-flex flex-column flex-md-row justify-space-between align-center mb-8">
                                <div>
                                    <h3 class="text-h6 font-weight-bold mb-1">Transaction Summary</h3>
                                    <p class="text-body-2 text-medium-emphasis mb-0" v-if="transactions.length > 0">
                                        {{ rangeDateFilter?.[0] ? formatDate(rangeDateFilter[0]) : formatDate(transactions[transactions.length - 1]?.date) }} 
                                        &nbsp;&mdash;&nbsp; 
                                        {{ rangeDateFilter?.[1] ? formatDate(rangeDateFilter[1]) : formatDate(transactions[0]?.date) }}
                                    </p>
                                </div>
                                <div class="mt-4 mt-md-0 d-flex align-center">
                                    <v-select
                                        :items="currencies"
                                        density="compact"
                                        v-model="currentCurrency"
                                        color="primary"
                                        bg-color="surface"
                                        variant="outlined"
                                        hide-details
                                        style="max-width: 120px;"
                                    ></v-select>
                                </div>
                            </div>

                            <v-row class="flex-grow-1 align-center">
                                <!-- General Stats -->
                                <v-col cols="12" class="border-b border-theme-divider pb-4">
                                    <h4 class="text-subtitle-1 font-weight-bold mb-4 text-primary">General Flow</h4>
                                    <div class="d-flex justify-space-between align-center mb-3">
                                        <span class="text-body-1">Total Earned</span>
                                        <span class="text-h6 font-weight-bold text-success">
                                            {{ convertNumberToCurrency(totalIncome, currentCurrency) }}
                                        </span>
                                    </div>
                                    <div class="d-flex justify-space-between align-center mb-3">
                                        <span class="text-body-1">Total Spent</span>
                                        <span class="text-h6 font-weight-bold text-error">
                                            {{ convertNumberToCurrency(totalExpenses, currentCurrency) }}
                                        </span>
                                    </div>
                                    <v-divider class="my-3"></v-divider>
                                    <div class="d-flex justify-space-between align-center mb-2">
                                        <span class="text-body-1 font-weight-medium">Net Difference</span>
                                        <span class="text-h6 font-weight-bold" :class="(differenceExpensesIncome || 0) >= 0 ? 'text-success' : 'text-error'">
                                            {{ convertNumberToCurrency(differenceExpensesIncome, currentCurrency) }}
                                        </span>
                                    </div>
                                </v-col>

                                <!-- Wants and Needs -->
                                <v-col cols="12" class="pt-4">
                                    <h4 class="text-subtitle-1 font-weight-bold mb-4 text-primary">Expenses Distribution</h4>
                                    <div class="d-flex justify-space-between align-center mb-3">
                                        <span class="text-body-1">Needs</span>
                                        <span class="text-h6 font-weight-bold text-warning">
                                            {{ convertNumberToCurrency(needsTransactionsSum, currentCurrency) }}
                                        </span>
                                    </div>
                                    <div class="d-flex justify-space-between align-center mb-3">
                                        <span class="text-body-1">Wants</span>
                                        <span class="text-h6 font-weight-bold text-error">
                                            {{ convertNumberToCurrency(wantsTransactionsSum, currentCurrency) }}
                                        </span>
                                    </div>
                                    <div class="d-flex justify-space-between align-center mb-2">
                                        <span class="text-body-1">Uncategorized / Other</span>
                                        <span class="text-h6 font-weight-bold text-medium-emphasis">
                                            {{ convertNumberToCurrency(notWantsNorNeedsTranSum, currentCurrency) }}
                                        </span>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </main>
</template>

<style scoped>
/* Override default datepicker input to match vuetify outlined style height & borders exclusively */
:deep(.modern-dp .dp__input) {
    height: 40px;
    border-radius: 4px;
    font-family: inherit;
    background-color: rgb(var(--v-theme-surface)) !important;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}
:deep(.modern-dp .dp__input:hover) {
    border-color: rgba(var(--v-theme-on-surface), 0.87);
}
:deep(.modern-dp .dp__input_focus) {
    border-color: rgb(var(--v-theme-primary));
    outline: none;
}
:deep(.modern-dp .dp__icon) {
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.border-theme-divider {
    border-color: rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

@media (min-width: 1280px) {
    .pie-col {
        flex: 0 0 70% !important;
        max-width: 70% !important;
    }
    .stats-col {
        flex: 0 0 30% !important;
        max-width: 30% !important;
    }
}
</style>
