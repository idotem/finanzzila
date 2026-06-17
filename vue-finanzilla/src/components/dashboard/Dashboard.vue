<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {
    VBtn,
    VCard,
    VCardText,
    VChip,
    VCol,
    VContainer,
    VFileInput,
    VOverlay,
    VProgressCircular,
    VRow,
    VSelect,
    VDivider,
    VDialog,
    VCardTitle,
    VCardActions,
    VSpacer
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
import { CategoryType } from '../model/CategoryType';
import router from '@/router';
import axiosInstance from '@/config/axios/axios';
import BudgetPlanner from './BudgetPlanner.vue';
import SavedBudgetsList from './SavedBudgetsList.vue';

const rawMonthStr = ref<string>(new Date().toISOString().substring(0, 7));

const maxMonthStr = computed(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().substring(0, 7);
});

const selectedBudgetMonth = computed({
    get: () => rawMonthStr.value,
    set: (val: string) => {
        if (val > maxMonthStr.value) {
            rawMonthStr.value = maxMonthStr.value;
        } else {
            rawMonthStr.value = val;
        }
    }
});

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
const banks = ref<string[]>([]);
const selectedBank = ref<string>('KOMERCIJALNA BANKA');
const showImportDialog = ref<boolean>(false);
const savedBudgetsListRef = ref<InstanceType<typeof SavedBudgetsList> | null>(null);

onMounted(async () => {
    try {
        await fetchCategories();
        await fetchTransactions();
        await fetchBanks();
    } catch (error) {
        errorMessage.value = 'Error fetching data';
        console.error('Error fetching data:', error);
    }
});

const fetchBanks = async () => {
    try {
        const res = await axiosInstance.get('/banks');
        banks.value = res.data;
    } catch (error) {
        console.error('Error fetching banks:', error);
    }
};

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
        if (transaction.category?.type === CategoryType.SAVING_ACCOUNT) {
            return;
        }
        if (transaction.category?.type === CategoryType.INCOME && transaction.amount > 0) {
            incomeSum += transaction.amount;
        } else if (transaction.category?.type === CategoryType.EXPENSE) {
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
            await TransactionService.uploadFileTransactions(files.value[0], selectedBank.value).then(
                (tr: Transaction[]) => {
                    transactions.value = tr;
                    calculateStats(tr, timePeriod.value);
                    calculateWantsAndNeeds(tr);
                    files.value = undefined;
                    isLoading.value = false;
                    showImportDialog.value = false;
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
        if (transaction.category?.type !== CategoryType.EXPENSE) {
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

const savingAccountsData = computed(() => {
    const map = new Map<number, { id: number; name: string; color: string; totalAmount: number }>();

    categories.value.forEach((c) => {
        if (c.type === CategoryType.SAVING_ACCOUNT) {
            map.set(c.id, {
                id: c.id,
                name: c.name,
                color: c.color || '#4CAF50',
                totalAmount: 0
            });
        }
    });

    transactions.value.forEach((t) => {
        if (t.category?.type === CategoryType.SAVING_ACCOUNT) {
            if (!map.has(t.category.id)) {
                map.set(t.category.id, {
                    id: t.category.id,
                    name: t.category.name,
                    color: t.category.color || '#4CAF50',
                    totalAmount: 0
                });
            }
            const item = map.get(t.category.id)!;
            item.totalAmount += t.amount;
        }
    });

    return Array.from(map.values()).map((item) => ({
        ...item,
        totalAmount: Math.abs(item.totalAmount)
    }));
});

const currentBalance = computed(() => {
    const sum = transactions.value.reduce((acc, item) => acc + (item.amount || 0), 0);
    return Number(sum.toFixed(2));
});

const totalSavingAccountsSum = computed(() => {
    return savingAccountsData.value.reduce((sum, item) => sum + item.totalAmount, 0);
});

function goToCategory(id: number): void {
    const dateFilterFrom: any = rangeDateFilter.value?.[0] ?? undefined;
    const dateFilterTo: any = rangeDateFilter.value?.[1] ?? undefined;
    router.push({
        name: 'Transactions',
        query: {
            categoryId: id,
            dateFilterFrom,
            dateFilterTo
        }
    });
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
                    <v-btn
                        color="primary"
                        variant="elevated"
                        elevation="2"
                        class="text-none font-weight-bold w-100"
                        height="40"
                        prepend-icon="cloud_upload"
                        @click="showImportDialog = true"
                    >
                        Import Transactions
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

            <!-- Top Row: Bar Chart AND Saving Accounts -->
            <v-row class="mb-6 align-stretch" align="stretch">
                <!-- Bar Chart Column -->
                <v-col cols="12" lg="12" class="d-flex bar-col">
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

                <!-- Saving Accounts Column -->
                <v-col cols="12" lg="12" class="d-flex saving-col">
                    <v-card color="surface" elevation="2" class="rounded-xl w-100 d-flex flex-column overflow-hidden">
                        <v-card-text class="pa-5 w-100 d-flex flex-column">
                            <div class="d-flex align-left mb-3">
                                <h3 class="text-h6 font-weight-bold mb-0">Current Account Balance</h3>
                            </div>

                            <!-- Current Balance Display -->
                            <div class="mb-4 pa-3 rounded-lg bg-gradient-to-r from-primary/10 via-surface to-surface border border-theme-divider">
                                <div class="text-caption text-medium-emphasis uppercase tracking-wider mb-1">Total Available</div>
                                <div class="text-h5 font-weight-bold" :class="currentBalance >= 0 ? 'text-success' : 'text-error'">
                                    {{ convertNumberToCurrency(currentBalance, currentCurrency) }}
                                </div>
                            </div>

                            <div class="text-subtitle-2 font-weight-bold text-medium-emphasis mb-3">Saving Accounts</div>

                            <div v-if="savingAccountsData.length > 0" class="d-flex flex-column gap-3 w-100">
                                <div
                                    v-for="account in savingAccountsData"
                                    :key="account.id"
                                    class="cursor-pointer d-flex justify-space-between align-center py-2 px-3 rounded-lg saving-account-item transition-all"
                                    @click="goToCategory(account.id)"
                                >
                                    <div class="d-flex align-center overflow-hidden mr-2">
                                        <span
                                            class="rounded-circle d-inline-block flex-shrink-0 mr-3"
                                            :style="{ width: '12px', height: '12px', backgroundColor: account.color }"
                                        ></span>
                                        <span class="text-body-1 font-weight-medium text-truncate">{{ account.name }}</span>
                                    </div>
                                    <span class="text-subtitle-1 font-weight-bold text-primary flex-shrink-0">
                                        {{ convertNumberToCurrency(account.totalAmount, currentCurrency) }}
                                    </span>
                                </div>

                                <v-divider class="my-2 border-theme-divider"></v-divider>

                                <div class="d-flex justify-space-between align-center px-2 pt-1">
                                    <span class="text-body-2 font-weight-bold text-medium-emphasis uppercase tracking-wider">Total</span>
                                    <span class="text-h6 font-weight-bold text-success">
                                        {{ convertNumberToCurrency(totalSavingAccountsSum, currentCurrency) }}
                                    </span>
                                </div>
                            </div>

                            <div class="text-center py-6 text-medium-emphasis">
                                <v-icon size="40" color="grey-lighten-2" class="mb-2">account_balance</v-icon>
                                <p class="text-body-2 mb-0">No saving accounts available</p>
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

            <!-- Budget Section: Planner (70%) + Saved List (30%) -->
            <v-row class="mb-6 align-stretch" align="stretch">
                <v-col cols="12" sm="8" class="d-flex budget-planner-col">
                    <BudgetPlanner
                        :transactions="transactions"
                        :categories="categories"
                        :currentCurrency="currentCurrency"
                        :isLoading="isLoading"
                        @update:isLoading="(v: boolean) => isLoading = v"
                        @budget-saved="savedBudgetsListRef?.refresh()"
                        v-model:selectedBudgetMonth="selectedBudgetMonth"
                    />
                </v-col>
                <v-col cols="12" sm="4" class="d-flex saved-budgets-col">
                    <SavedBudgetsList
                        ref="savedBudgetsListRef"
                        :transactions="transactions"
                        :categories="categories"
                        :currentCurrency="currentCurrency"
                    />
                </v-col>
            </v-row>
        </v-container>

        <!-- Import Transactions Dialog -->
        <v-dialog v-model="showImportDialog" max-width="500px">
            <v-card class="rounded-xl">
                <v-card-title class="text-h6 font-weight-bold pa-5 pb-2">
                    Import Transactions
                </v-card-title>
                <v-card-text class="pa-5 pt-0">
                    <v-select
                        v-model="selectedBank"
                        :items="banks"
                        label="Select Bank"
                        variant="outlined"
                        color="primary"
                        bg-color="surface"
                        density="comfortable"
                        class="mb-4 mt-2"
                        hide-details
                    ></v-select>

                    <v-file-input
                        v-model="files"
                        density="comfortable"
                        color="primary"
                        bg-color="surface"
                        label="Upload bank statement"
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
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions class="pa-4">
                    <v-spacer></v-spacer>
                    <v-btn
                        color="medium-emphasis"
                        variant="text"
                        class="text-none font-weight-medium mr-2"
                        @click="showImportDialog = false"
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        color="primary"
                        variant="elevated"
                        class="text-none font-weight-bold px-4"
                        :disabled="!files || files.length === 0"
                        :loading="isLoading"
                        @click="uploadFile"
                    >
                        Upload
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
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
    .bar-col {
        flex: 0 0 75% !important;
        max-width: 75% !important;
    }
    .saving-col {
        flex: 0 0 25% !important;
        max-width: 25% !important;
    }
    .pie-col {
        flex: 0 0 65% !important;
        max-width: 65% !important;
    }
    .stats-col {
        flex: 0 0 35% !important;
        max-width: 35% !important;
    }
}

.saving-account-item {
    background-color: rgba(var(--v-theme-on-surface), 0.03);
}

.saving-account-item:hover {
    background-color: rgba(var(--v-theme-on-surface), 0.08);
    transform: translateX(4px);
}
</style>
