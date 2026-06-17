<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { VCard, VDivider, VBtn, VDialog, VCardTitle, VCardText, VCardActions } from 'vuetify/components';
import Transaction from '../model/Transaction';
import { CategoryType } from '../model/CategoryType';
import type { TransactionCategory } from '../model/TransactionCategory';
import { convertNumberToCurrency } from '../../utils/CurrencyConverter';
import BudgetService from '@/service/BudgetService';

const props = defineProps<{
    transactions: Transaction[];
    categories: TransactionCategory[];
    currentCurrency: string;
}>();

const budgetsByMonth = ref<Map<string, any[]>>(new Map());
const expandedMonth = ref<string | null>(null);
const deleteMonthDialog = ref<string | null>(null);
const showDeleteMonthDialog = ref(false);
const deleteAllDialog = ref(false);

const fetchAllSavedBudgets = async () => {
    try {
        const data = await BudgetService.getAllBudgets();
        const grouped = new Map<string, any[]>();
        for (const b of data) {
            const existing = grouped.get(b.month) || [];
            existing.push(b);
            grouped.set(b.month, existing);
        }
        const sorted = new Map([...grouped.entries()].sort((a, b) => b[0].localeCompare(a[0])));
        budgetsByMonth.value = sorted;
    } catch (error) {
        console.error('Error fetching saved budgets:', error);
        budgetsByMonth.value = new Map();
    }
};

const monthTotal = (budgets: any[]) => {
    return budgets.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
};

const actualSpendForMonth = (month: string) => {
    const [y, m] = month.split('-');
    const start = new Date(parseInt(y), parseInt(m) - 1, 1);
    const end = new Date(parseInt(y), parseInt(m), 0, 23, 59, 59);
    return props.transactions
        .filter((t) => {
            const d = new Date(t.date);
            return d >= start && d <= end && t.category?.type === CategoryType.EXPENSE;
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

const actualByCategory = (month: string) => {
    const [y, m] = month.split('-');
    const start = new Date(parseInt(y), parseInt(m) - 1, 1);
    const end = new Date(parseInt(y), parseInt(m), 0, 23, 59, 59);
    const map = new Map<number, number>();
    props.transactions
        .filter((t) => {
            const d = new Date(t.date);
            return d >= start && d <= end && t.category?.type === CategoryType.EXPENSE;
        })
        .forEach((t) => {
            if (t.category) {
                map.set(t.category.id, (map.get(t.category.id) || 0) + Math.abs(t.amount));
            }
        });
    return map;
};

const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    const date = new Date(parseInt(year), parseInt(m) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
};

const toggleExpand = (month: string) => {
    expandedMonth.value = expandedMonth.value === month ? null : month;
};

const confirmDeleteMonth = async () => {
    const month = deleteMonthDialog.value;
    if (!month) return;
    try {
        await BudgetService.deleteBudgetsByMonth(month);
        showDeleteMonthDialog.value = false;
        deleteMonthDialog.value = null;
        if (expandedMonth.value === month) expandedMonth.value = null;
        await fetchAllSavedBudgets();
    } catch (error) {
        console.error('Error deleting budgets for month:', error);
    }
};

const deleteAllBudgets = async () => {
    try {
        await BudgetService.deleteAllBudgets();
        deleteAllDialog.value = false;
        expandedMonth.value = null;
        await fetchAllSavedBudgets();
    } catch (error) {
        console.error('Error deleting all budgets:', error);
    }
};

defineExpose({ refresh: fetchAllSavedBudgets });

onMounted(() => {
    fetchAllSavedBudgets();
});
</script>

<template>
    <VCard color="surface" elevation="2" class="rounded-xl pa-4 h-100 w-100 d-flex flex-column">
        <div class="d-flex justify-space-between align-center mb-3">
            <h3 class="text-h5 font-weight-bold mb-1">Saved Budgets</h3>
            <VBtn
                v-if="budgetsByMonth.size > 0"
                color="error"
                variant="text"
                size="x-small"
                density="compact"
                class="text-none text-caption"
                @click="deleteAllDialog = true"
            >
                Delete All
            </VBtn>
        </div>

        <div v-if="budgetsByMonth.size > 0" class="d-flex flex-column flex-grow-1" style="gap: 4px">
            <div
                v-for="[month, budgets] in budgetsByMonth"
                :key="month"
                class="rounded-lg border border-theme-divider"
                style="background-color: rgba(var(--v-theme-on-surface), 0.01)"
            >
                <div
                    class="d-flex align-center pa-2 cursor-pointer"
                    style="gap: 6px; overflow: hidden"
                    @click="toggleExpand(month)"
                >
                    <span
                        class="mdi flex-shrink-0"
                        :class="expandedMonth === month ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                        style="font-size: 16px; color: rgba(var(--v-theme-on-surface), 0.6)"
                    ></span>
                    <div class="flex-grow-1" style="min-width: 0; overflow: hidden">
                        <div class="d-flex align-center flex-wrap" style="gap: 4px 8px">
                            <span class="text-caption font-weight-bold text-truncate">{{ formatMonth(month) }}</span>
                            <VDivider class="border-theme-divider"></VDivider>
                            <div class="d-flex align-center flex-shrink-0" style="gap: 3px">
                                <span class="text-overline text-medium-emphasis" style="font-size: 9px; line-height: 1"
                                    >Budget</span
                                >
                                <span class="text-caption font-weight-bold text-primary text-nowrap">
                                    {{ convertNumberToCurrency(monthTotal(budgets), currentCurrency) }}
                                </span>
                            </div>
                            <div class="d-flex align-center flex-shrink-0" style="gap: 3px">
                                <span class="text-overline text-medium-emphasis" style="font-size: 9px; line-height: 1"
                                    >Spent</span
                                >
                                <span
                                    class="text-caption font-weight-bold text-nowrap"
                                    :class="
                                        actualSpendForMonth(month) > monthTotal(budgets) ? 'text-error' : 'text-success'
                                    "
                                >
                                    {{ convertNumberToCurrency(actualSpendForMonth(month), currentCurrency) }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <VBtn
                        prepend-icon="delete_forever"
                        size="x-small"
                        variant="text"
                        color="error"
                        @click.stop="
                            deleteMonthDialog = month;
                            showDeleteMonthDialog = true;
                        "
                        >Delete</VBtn
                    >
                </div>

                <template v-if="expandedMonth === month">
                    <VDivider class="border-theme-divider"></VDivider>
                    <div class="pa-2 pt-1 d-flex flex-column" style="gap: 2px">
                        <div v-for="b in budgets" :key="b.id" class="d-flex align-center py-1" style="overflow: hidden">
                            <div class="d-flex align-center text-truncate mr-2" style="min-width: 0; flex: 1 1 auto">
                                <span
                                    class="rounded-circle d-inline-block flex-shrink-0 mr-1"
                                    :style="{
                                        width: '5px',
                                        height: '5px',
                                        backgroundColor: b.category?.color || '#4CAF50'
                                    }"
                                ></span>
                                <span class="text-caption text-medium-emphasis text-truncate">
                                    {{ b.category?.name || 'Unknown' }}
                                </span>
                            </div>
                            <div class="d-flex align-center flex-shrink-0" style="gap: 3px">
                                <span
                                    class="text-caption font-weight-medium text-nowrap"
                                    :class="
                                        (actualByCategory(month).get(b.category?.id) || 0) > b.amount
                                            ? 'text-error'
                                            : 'text-success'
                                    "
                                >
                                    {{
                                        convertNumberToCurrency(
                                            actualByCategory(month).get(b.category?.id) || 0,
                                            currentCurrency
                                        )
                                    }}
                                </span>
                                <span class="text-caption text-medium-emphasis">/</span>
                                <span class="text-caption font-weight-medium text-nowrap text-primary">
                                    {{ convertNumberToCurrency(b.amount, currentCurrency) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <div v-else class="text-center py-8 text-medium-emphasis flex-grow-1 d-flex flex-column justify-center">
            <p class="text-body-2 mb-0">No saved budgets yet.</p>
        </div>

        <VDialog v-model="deleteAllDialog" max-width="400">
            <VCard class="rounded-xl pa-4">
                <VCardTitle class="text-h6 font-weight-bold">Delete All Budgets</VCardTitle>
                <VCardText class="text-body-2 text-medium-emphasis">
                    Are you sure you want to delete all saved budgets? This action cannot be undone.
                </VCardText>
                <VCardActions class="justify-end pa-4 pt-0">
                    <VBtn variant="text" class="text-none" @click="deleteAllDialog = false">Cancel</VBtn>
                    <VBtn color="error" variant="elevated" class="text-none" @click="deleteAllBudgets">Delete All</VBtn>
                </VCardActions>
            </VCard>
        </VDialog>

        <VDialog v-model="showDeleteMonthDialog" max-width="400">
            <VCard class="rounded-xl pa-4">
                <VCardTitle class="text-h6 font-weight-bold">Delete Budget Month</VCardTitle>
                <VCardText class="text-body-2 text-medium-emphasis">
                    Are you sure you want to delete the budget for
                    {{ deleteMonthDialog ? formatMonth(deleteMonthDialog) : '' }}? This action cannot be undone.
                </VCardText>
                <VCardActions class="justify-end pa-4 pt-0">
                    <VBtn
                        variant="text"
                        class="text-none"
                        @click="
                            showDeleteMonthDialog = false;
                            deleteMonthDialog = null;
                        "
                        >Cancel</VBtn
                    >
                    <VBtn color="error" variant="elevated" class="text-none" @click="confirmDeleteMonth">Delete</VBtn>
                </VCardActions>
            </VCard>
        </VDialog>
    </VCard>
</template>

<style scoped>
.cursor-pointer {
    cursor: pointer;
}
.border-theme-divider {
    border-color: rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}
</style>
