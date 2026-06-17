<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { VBtn, VCard, VRow, VCol, VTextField, VAlert } from 'vuetify/components';
import Transaction from '../model/Transaction';
import { CategoryType } from '../model/CategoryType';
import type { TransactionCategory } from '../model/TransactionCategory';
import { convertNumberToCurrency } from '../../utils/CurrencyConverter';
import BudgetService from '@/service/BudgetService';

const props = defineProps<{
    transactions: Transaction[];
    categories: TransactionCategory[];
    currentCurrency: string;
    isLoading: boolean;
    selectedBudgetMonth: string;
}>();

const emit = defineEmits<{
    (e: 'update:isLoading', val: boolean): void;
    (e: 'update:selectedBudgetMonth', val: string): void;
    (e: 'budget-saved'): void;
}>();

const localMonth = computed({
    get: () => props.selectedBudgetMonth,
    set: (val: string) => emit('update:selectedBudgetMonth', val)
});

const maxMonthStr = computed(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().substring(0, 7);
});

const budgetCategories = ref<any[]>([]);
const budgetComparison = ref<any[]>([]);
const saveSuccess = ref<boolean>(false);
const saveSuccessMessage = ref<string>('');

const generateBudgetFromAverages = async () => {
    try {
        emit('update:isLoading', true);
        const allTr = props.transactions;
        const targetDate = new Date(props.selectedBudgetMonth + '-01');
        const sixMonthsAgo = new Date(targetDate.getFullYear(), targetDate.getMonth() - 6, 1);
        const endOfPeriod = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0, 23, 59, 59);

        const periodTransactions = allTr.filter((t: any) => {
            const d = new Date(t.date);
            return d >= sixMonthsAgo && d <= endOfPeriod && t.category?.type === CategoryType.EXPENSE;
        });

        const categorySums = new Map<number, number>();
        periodTransactions.forEach(t => {
            if (t.category) {
                const current = categorySums.get(t.category.id) || 0;
                categorySums.set(t.category.id, current + Math.abs(t.amount));
            }
        });

        const expenseCategories = props.categories.filter(c => c.type === CategoryType.EXPENSE);
        budgetCategories.value = expenseCategories.map(c => {
            const sum = categorySums.get(c.id) || 0;
            const avg = sum / 6;
            return {
                categoryId: c.id,
                categoryName: c.name,
                color: c.color || '#4CAF50',
                average: Math.round(avg),
                amount: Math.round(avg * 0.85)
            };
        });

        await fetchSavedBudgetAndCompare(allTr);
    } catch (e) {
        console.error('Error generating budget:', e);
    } finally {
        emit('update:isLoading', false);
    }
};

const fetchSavedBudgetAndCompare = async (allTransactions?: Transaction[]) => {
    try {
        const saved = await BudgetService.getBudgets(props.selectedBudgetMonth);
        const allTr = allTransactions || props.transactions;

        const targetDate = new Date(props.selectedBudgetMonth + '-01');
        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

        const monthTransactions = allTr.filter(t => {
            const d = new Date(t.date);
            return d >= startOfMonth && d <= endOfMonth && t.category?.type === CategoryType.EXPENSE;
        });

        const actualSums = new Map<number, number>();
        monthTransactions.forEach(t => {
            if (t.category) {
                const current = actualSums.get(t.category.id) || 0;
                actualSums.set(t.category.id, current + Math.abs(t.amount));
            }
        });

        budgetComparison.value = props.categories.filter(c => c.type === CategoryType.EXPENSE).map(c => {
            const savedBudget = saved.find((b: any) => b.category.id === c.id);
            const budgetedAmount = savedBudget ? savedBudget.amount : 0;
            const actualAmount = actualSums.get(c.id) || 0;
            return {
                categoryId: c.id,
                categoryName: c.name,
                color: c.color || '#4CAF50',
                budgeted: budgetedAmount,
                actual: Math.round(actualAmount),
                saved: !!savedBudget
            };
        });

        if (saved.length > 0) {
            budgetCategories.value = budgetCategories.value.map(bc => {
                const savedItem = saved.find((b: any) => b.category.id === bc.categoryId);
                return { ...bc, amount: savedItem ? savedItem.amount : bc.amount };
            });
        }
    } catch (error) {
        console.error('Error loading budget comparison:', error);
    }
};

const saveBudgetPlan = async () => {
    try {
        emit('update:isLoading', true);
        const dtos = budgetCategories.value.map(bc => ({
            month: props.selectedBudgetMonth,
            amount: bc.amount,
            categoryId: bc.categoryId
        }));
        await BudgetService.saveBudgets(dtos);
        saveSuccessMessage.value = `Successfully saved budget for ${props.selectedBudgetMonth}!`;
        saveSuccess.value = true;
        await fetchSavedBudgetAndCompare();
        emit('budget-saved');
    } catch (e) {
        console.error('Error saving budget plan:', e);
    } finally {
        emit('update:isLoading', false);
    }
};

watch(() => props.selectedBudgetMonth, () => {
    generateBudgetFromAverages();
});

watch(() => props.transactions, () => {
    generateBudgetFromAverages();
}, { deep: true });
</script>

<template>
    <VCard color="surface" elevation="2" class="rounded-xl pa-6 w-100">
        <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center mb-6">
            <div>
                <h3 class="text-h5 font-weight-bold mb-1">Smart Budget Planner</h3>
                <p class="text-caption text-medium-emphasis mb-0">Plan next month's budget based on 6-month spending averages.</p>
            </div>
            <div class="d-flex align-center mt-4 mt-sm-0 gap-3">
                <label class="text-caption text-medium-emphasis mr-1 font-weight-bold">Target Month:</label>
                <input
                    v-model="localMonth"
                    type="month"
                    :max="maxMonthStr"
                    style="background-color: rgba(var(--v-theme-on-surface), 0.05); color: inherit; padding: 6px 12px; border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 4px; outline: none; height: 40px; font-family: inherit; font-size: 12px;"
                />
                <VBtn
                    color="success"
                    variant="elevated"
                    height="40"
                    class="text-none font-weight-bold"
                    prepend-icon="save"
                    @click="saveBudgetPlan"
                >
                    Save Budget
                </VBtn>
            </div>
        </div>

        <VAlert
            v-if="saveSuccess"
            type="success"
            variant="tonal"
            closable
            class="mb-6 rounded-lg"
            @click:close="saveSuccess = false"
        >
            {{ saveSuccessMessage }}
        </VAlert>

        <VRow>
            <VCol cols="12">
                <h4 class="text-subtitle-1 font-weight-bold mb-4 text-primary d-flex align-center">
                    Budget vs. Actual Spend
                </h4>

                <div class="pa-4 mb-4 rounded-xl bg-gradient-to-r from-primary/10 via-surface to-surface border border-theme-divider">
                    <div class="d-flex justify-space-between align-center mb-2">
                        <div class="text-subtitle-1 font-weight-bold">Total Budget Utilization</div>
                        <span class="text-subtitle-2 font-weight-medium">
                            {{ convertNumberToCurrency(budgetComparison.reduce((sum, c) => sum + c.actual, 0), currentCurrency) }}
                            <span class="text-primary font-weight-bold">
                                {{ convertNumberToCurrency(budgetCategories.reduce((sum, c) => sum + c.amount, 0), currentCurrency) }}
                            </span>
                        </span>
                    </div>
                    <div class="w-100 bg-grey-lighten-3 rounded-pill overflow-hidden mb-2" style="height: 12px; background-color: rgba(var(--v-theme-on-surface), 0.1) !important;">
                        <div
                            class="h-100 rounded-pill transition-all"
                            :style="{
                                width: `${Math.min((budgetCategories.reduce((sum, c) => sum + c.amount, 0) > 0 ? (budgetComparison.reduce((sum, c) => sum + c.actual, 0) / budgetCategories.reduce((sum, c) => sum + c.amount, 0)) * 100 : 0), 100)}%`,
                                backgroundColor: budgetComparison.reduce((sum, c) => sum + c.actual, 0) > budgetCategories.reduce((sum, c) => sum + c.amount, 0) ? '#FF5252' : '#22c55e'
                            }"
                        ></div>
                    </div>
                    <div class="d-flex justify-space-between text-caption text-medium-emphasis">
                        <span>
                            {{ budgetCategories.reduce((sum, c) => sum + c.amount, 0) > 0 ? Math.round((budgetComparison.reduce((sum, c) => sum + c.actual, 0) / budgetCategories.reduce((sum, c) => sum + c.amount, 0)) * 100) : 0 }}% total used
                        </span>
                        <span v-if="budgetComparison.reduce((sum, c) => sum + c.actual, 0) > budgetCategories.reduce((sum, c) => sum + c.amount, 0)" class="text-error font-weight-bold">
                            Over total budget by {{ convertNumberToCurrency(budgetComparison.reduce((sum, c) => sum + c.actual, 0) - budgetCategories.reduce((sum, c) => sum + c.amount, 0), currentCurrency) }}!
                        </span>
                        <span v-else-if="budgetCategories.reduce((sum, c) => sum + c.amount, 0) > 0" class="text-success">
                            {{ convertNumberToCurrency(budgetCategories.reduce((sum, c) => sum + c.amount, 0) - budgetComparison.reduce((sum, c) => sum + c.actual, 0), currentCurrency) }} remaining
                        </span>
                    </div>
                </div>

                <VRow>
                    <VCol cols="12" md="6" class="py-0">
                        <div class="d-flex flex-column gap-2">
                            <div
                                v-for="bc in budgetCategories.slice(0, Math.ceil(budgetCategories.length / 2))"
                                :key="bc.categoryId"
                                class="d-flex align-center py-1 px-3 rounded-lg border border-theme-divider"
                                style="background-color: rgba(var(--v-theme-on-surface), 0.01); overflow: hidden;"
                            >
                                <div class="d-flex align-center text-truncate mr-2" style="min-width: 0; flex: 1 1 auto;">
                                    <span
                                        class="rounded-circle d-inline-block flex-shrink-0 mr-1"
                                        :style="{ width: '6px', height: '6px', backgroundColor: bc.color }"
                                    ></span>
                                    <span class="text-caption font-weight-bold text-truncate">{{ bc.categoryName }}</span>
                                </div>

                                <div class="d-flex align-center flex-shrink-0" style="gap: 2px;">
                                    <span
                                        class="text-caption font-weight-bold text-nowrap"
                                        :class="(budgetComparison.find(comp => comp.categoryId === bc.categoryId)?.actual || 0) > bc.amount ? 'text-error' : 'text-success'"
                                    >
                                        {{ (budgetComparison.find(comp => comp.categoryId === bc.categoryId)?.actual || 0) }} {{ currentCurrency }}
                                    </span>
                                    <span class="text-caption text-medium-emphasis font-weight-medium">(</span>
                                    <VTextField
                                        v-model.number="bc.amount"
                                        type="number"
                                        variant="outlined"
                                        density="compact"
                                        hide-details
                                        class="budget-input"
                                    ></VTextField>
                                    <span class="text-caption text-medium-emphasis font-weight-medium">)</span>
                                </div>
                            </div>
                        </div>
                    </VCol>

                    <VCol cols="12" md="6" class="py-0">
                        <div class="d-flex flex-column gap-2">
                            <div
                                v-for="bc in budgetCategories.slice(Math.ceil(budgetCategories.length / 2))"
                                :key="bc.categoryId"
                                class="d-flex align-center py-1 px-3 rounded-lg border border-theme-divider"
                                style="background-color: rgba(var(--v-theme-on-surface), 0.01); overflow: hidden;"
                            >
                                <div class="d-flex align-center text-truncate mr-2" style="min-width: 0; flex: 1 1 auto;">
                                    <span
                                        class="rounded-circle d-inline-block flex-shrink-0 mr-1"
                                        :style="{ width: '6px', height: '6px', backgroundColor: bc.color }"
                                    ></span>
                                    <span class="text-caption font-weight-bold text-truncate">{{ bc.categoryName }}</span>
                                </div>

                                <div class="d-flex align-center flex-shrink-0" style="gap: 2px;">
                                    <span
                                        class="text-caption font-weight-bold text-nowrap"
                                        :class="(budgetComparison.find(comp => comp.categoryId === bc.categoryId)?.actual || 0) > bc.amount ? 'text-error' : 'text-success'"
                                    >
                                        {{ (budgetComparison.find(comp => comp.categoryId === bc.categoryId)?.actual || 0) }} {{ currentCurrency }}
                                    </span>
                                    <span class="text-caption text-medium-emphasis font-weight-medium">(</span>
                                    <VTextField
                                        v-model.number="bc.amount"
                                        type="number"
                                        variant="outlined"
                                        density="compact"
                                        hide-details
                                        class="budget-input"
                                    ></VTextField>
                                    <span class="text-caption text-medium-emphasis font-weight-medium">)</span>
                                </div>
                            </div>
                        </div>
                    </VCol>
                </VRow>
            </VCol>
        </VRow>
    </VCard>
</template>

<style scoped>
.border-theme-divider {
    border-color: rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.budget-input {
    width: 90px;
}

.budget-input :deep(.v-field__input) {
    padding: 2px 6px;
    font-size: 12px;
    min-height: 0;
}

.budget-input :deep(.v-field) {
    --v-field-input-padding-top: 2px;
    --v-field-input-padding-bottom: 2px;
    min-height: 26px;
}
</style>
