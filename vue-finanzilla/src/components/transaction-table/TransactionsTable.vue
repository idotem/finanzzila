<script setup lang="ts">
import CategoryService from '@/service/CategoryService';
import TransactionService from '@/service/TransactionService';
import {
    VBtn,
    VCard,
    VCardActions,
    VCardText,
    VCardTitle,
    VCheckbox,
    VCol,
    VContainer,
    VDataTable,
    VDialog,
    VIcon,
    VOverlay,
    VProgressCircular,
    VRow,
    VSelect,
    VSpacer,
    VTextField
} from 'vuetify/components';
import { useTheme } from 'vuetify';
import VueDatePicker from '@vuepic/vue-datepicker';
import { computed, onMounted, ref, watch } from 'vue';
import Transaction from '../model/Transaction';
import type { TransactionCategory } from '../model/TransactionCategory';
import TransactionFilterDto from '../model/TransactionFilterDto';
import TransactionDto from '../model/TransactionDto';
import '../../assets/base.css';
import LoadingSpinner from '@/utils/LoadingSpinner.vue';
import { CategoryType } from '../model/CategoryType';

type TransactionTableProps = {
    categoryId?: number | undefined;
    dateFilterFrom?: Date | undefined | null;
    dateFilterTo?: Date | undefined | null;
};

const props = defineProps<TransactionTableProps>();

const theme = useTheme();

const transactions = ref<Transaction[]>([]);
const errorMessage = ref('');
const loading = ref<boolean>(false);
const rangeDateFilter = ref<Date[]>(
    props.dateFilterFrom && props.dateFilterTo ? [props.dateFilterFrom, props.dateFilterTo] : []
);
const filterCategoryId = ref<number | undefined>(props.categoryId);
const companyNameFilter = ref<string>('');
const categories = ref<TransactionCategory[]>([]);
const dialog = ref<boolean>(false);
const dialogDelete = ref<boolean>(false);
const addCategoryKeyword = ref<boolean>(false);
const editingItem = ref<TransactionDto>(
    new TransactionDto(undefined, undefined, undefined, undefined, undefined, undefined)
);
const deletingItem = ref<any>({});

const transactionsHeaders = [
    {
        title: 'Date',
        key: 'date',
        headerProps: {
            class: 'text-subtitle-1 font-weight-bold'
        }
    },
    {
        title: 'Company name',
        key: 'nameOfPlace',
        headerProps: {
            class: 'text-subtitle-1 font-weight-bold'
        }
    },
    {
        title: 'Amount (MKD)',
        key: 'amount',
        headerProps: {
            class: 'text-subtitle-1 font-weight-bold'
        }
    },
    {
        title: 'Category',
        key: 'category.name',
        headerProps: {
            class: 'text-subtitle-1 font-weight-bold'
        }
    },
    { key: 'actions', sortable: false }
];

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
    loading.value = true;
    const filter: TransactionFilterDto = new TransactionFilterDto(
        rangeDateFilter.value && rangeDateFilter.value.length > 0 ? rangeDateFilter.value[0] : undefined,
        rangeDateFilter.value && rangeDateFilter.value.length > 1 ? rangeDateFilter.value[1] : undefined,
        filterCategoryId.value
    );
    TransactionService.getAllFiltered(filter).then((tr: Transaction[]) => {
        transactions.value = tr;
        loading.value = false;
    });
};

watch(rangeDateFilter, () => {
    fetchTransactions();
});

watch(filterCategoryId, () => {
    fetchTransactions();
});

const filteredTransactions = computed(() => {
    if (!companyNameFilter.value) {
        return transactions.value;
    }
    return transactions.value.filter((transaction) =>
        transaction.nameOfPlace?.toLowerCase().includes(companyNameFilter.value.toLowerCase())
    );
});

const totalAmount = computed(() => {
    const sum = filteredTransactions.value.reduce((acc, item) => acc + (item.amount || 0), 0);
    return Number(sum.toFixed(2));
});

watch(dialog, () => {
    if (!dialog.value) {
        editingItem.value = new TransactionDto(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined
        );
    }
});

const fetchCategories = async () => {
    loading.value = true;
    CategoryService.getAllTransactionCategories().then((trC: TransactionCategory[]) => {
        categories.value = trC;
        loading.value = false;
    });
};

function editItem(item: any) {
    editingItem.value = { ...item, category: item.category.id };
    dialog.value = true;
}

function deleteItem(item: any) {
    deletingItem.value = item;
    dialogDelete.value = true;
}

function deleteItemConfirm() {
    loading.value = true;
    TransactionService.delete(deletingItem.value.id)
        .then(() => {
            fetchTransactions();
            loading.value = false;
        })
        .catch((err) => {
            loading.value = false;
            alert(`Unsuccesfull delete item: ${err}`);
        });
    closeDelete();
}

function close() {
    dialog.value = false;
    editingItem.value = new TransactionDto(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
    );
}

function closeDelete() {
    dialogDelete.value = false;
    deletingItem.value = Object.assign({}, {});
}

function validateRequest(itemToSave: any): boolean {
    if (!itemToSave.nameOfPlace || !itemToSave.category || !itemToSave.amount || !itemToSave.date) {
        alert('Required fields for transaction are not filled.');
        return false;
    }
    const selectedCategoryType = categories.value.find(c => c.id === itemToSave.category)?.type;
    if (
        (itemToSave.amount > 0 && selectedCategoryType === CategoryType.EXPENSE) ||
        (itemToSave.amount <= 0 && selectedCategoryType === CategoryType.INCOME)
    ) {
        alert('If amount is greater than 0, category MUST be Income, and if <= 0 it MUST be Expense. Saving Accounts can be either.');
        return false;
    }
    if (!addCategoryKeyword.value) {
        editingItem.value.categoryKeyword = undefined;
    }
    if (addCategoryKeyword.value && itemToSave.categoryKeyword === '') {
        alert('Category keyword can not be empty string');
        return false;
    }
    return true;
}

function save() {
    if (!validateRequest(editingItem.value)) return;
    const itemToSave: TransactionDto = editingItem.value;

    loading.value = true;
    if (editingItem.value.id !== undefined) {
        TransactionService.update(editingItem.value.id, itemToSave)
            .then((res) => {
                loading.value = false;
                fetchTransactions();
                close();
            })
            .catch((err) => {
                loading.value = false;
                alert('Unsuccessfully updated transaction: ' + err);
            });
    } else {
        TransactionService.add(itemToSave)
            .then((res) => {
                loading.value = false;
                alert(`Successfully added transaction ${res}`);
                fetchTransactions();
                close();
            })
            .catch((err) => {
                loading.value = false;
                alert('Unsuccessfully added transaction: ' + err);
            });
    }
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
        <LoadingSpinner :isLoading="loading"></LoadingSpinner>
        <v-overlay :model-value="loading" class="align-center justify-center">
            <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
        </v-overlay>

        <v-container fluid class="pa-0 max-w-[1920px] mx-auto">
            <v-card color="surface" elevation="2" class="rounded-xl mt-4 pa-6">
                <!-- Filters Section -->
                <v-row align="center" class="mb-4">
                    <v-col cols="12" sm="6" md="3">
                        <VueDatePicker
                            placeholder="Pick date range"
                            auto-apply
                            :dark="theme.global.current.value.dark"
                            v-model="rangeDateFilter"
                            :enable-time-picker="false"
                            :range="{ partialRange: false }"
                            class="modern-dp"
                        ></VueDatePicker>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                        <v-text-field
                            density="compact"
                            placeholder="Filter company name"
                            color="primary"
                            bg-color="surface"
                            variant="outlined"
                            v-model="companyNameFilter"
                            hide-details
                            prepend-inner-icon="search"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                        <v-select
                            :items="categories"
                            item-title="name"
                            item-value="id"
                            label="Choose Category Filter"
                            density="compact"
                            v-model="filterCategoryId"
                            color="primary"
                            bg-color="surface"
                            variant="outlined"
                            hide-details
                            clearable
                        ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6" md="3" class="text-right">
                        <v-btn
                            prepend-icon="add"
                            color="primary"
                            variant="elevated"
                            elevation="2"
                            @click="dialog = true"
                            height="40"
                            class="font-weight-bold"
                        >
                            Add Transaction
                        </v-btn>
                    </v-col>
                </v-row>

                <!-- Summary Section -->
                <v-row class="mb-1" v-if="transactions">
                    <v-col cols="12" class="d-flex justify-end align-center pt-0 pb-2">
                        <span class="text-subtitle-1 text-medium-emphasis mr-3">Total Amount Sum:</span>
                        <span class="text-h5 font-weight-bold" :class="totalAmount > 0 ? 'text-success' : 'text-error'">
                            {{ totalAmount }} <span class="text-subtitle-2 font-weight-regular ml-1">MKD</span>
                        </span>
                    </v-col>
                </v-row>

                <!-- Table Section -->
                <v-row>
                    <v-col cols="12">
                        <v-data-table
                            hover
                            density="compact"
                            v-if="transactions"
                            :headers="transactionsHeaders"
                            :items="filteredTransactions"
                            :loading="loading"
                            class="elevation-0 bg-transparent rounded-lg"
                        >
                            <template v-slot:item.date="{ item }">
                                <span class="font-weight-medium text-medium-emphasis">
                                    {{ formatDate(item.date) }}
                                </span>
                            </template>

                            <template v-slot:item.amount="{ item }">
                                <span :class="(item.amount || 0) > 0 ? 'text-success font-weight-bold' : 'text-error font-weight-bold'">
                                    {{ item.amount }}
                                </span>
                            </template>

                            <template v-slot:top>
                                <!-- Edit/Add Dialog -->
                                <v-dialog v-model="dialog" max-width="600px">
                                    <v-card color="surface" elevation="6" class="rounded-lg">
                                        <v-card-title class="pa-4 border-b">
                                            <span class="text-h5 font-weight-bold">{{ editingItem.id === undefined ? 'Add Transaction' : 'Edit Transaction' }}</span>
                                        </v-card-title>
                                        <v-card-text class="pa-6">
                                            <v-container class="pa-0">
                                                <v-row>
                                                    <v-col cols="12" align-self="center">
                                                        <label class="text-body-2 text-medium-emphasis mb-1 d-block">Date</label>
                                                        <VueDatePicker
                                                            v-model="editingItem.date"
                                                            auto-apply
                                                            :dark="theme.global.current.value.dark"
                                                            :enable-time-picker="false"
                                                            required
                                                            class="modern-dp"
                                                        ></VueDatePicker>
                                                    </v-col>
                                                    <v-col cols="12">
                                                        <v-text-field
                                                            v-model="editingItem.nameOfPlace"
                                                            label="Company name"
                                                            variant="outlined"
                                                            color="primary"
                                                            hide-details="auto"
                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-col cols="12">
                                                        <v-text-field
                                                            type="number"
                                                            v-model="editingItem.amount"
                                                            label="Amount (MKD)"
                                                            variant="outlined"
                                                            color="primary"
                                                            hide-details="auto"
                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-col cols="12">
                                                        <v-select
                                                            v-model="editingItem.category"
                                                            :items="categories"
                                                            item-title="name"
                                                            item-value="id"
                                                            label="Category"
                                                            variant="outlined"
                                                            color="primary"
                                                            hide-details="auto"
                                                            clearable
                                                        ></v-select>
                                                    </v-col>
                                                    <v-col cols="12" class="pb-0">
                                                        <v-checkbox
                                                            color="primary"
                                                            v-model="addCategoryKeyword"
                                                            label="Add category keyword"
                                                            hide-details
                                                            density="compact"
                                                        ></v-checkbox>
                                                    </v-col>
                                                    <v-col v-if="addCategoryKeyword" cols="12">
                                                        <v-text-field
                                                            type="text"
                                                            v-model="editingItem.categoryKeyword"
                                                            label="Category Keyword"
                                                            variant="outlined"
                                                            color="primary"
                                                            hide-details="auto"
                                                        ></v-text-field>
                                                    </v-col>
                                                </v-row>
                                            </v-container>
                                        </v-card-text>

                                        <v-card-actions class="pa-4 border-t bg-surface-light">
                                            <v-btn
                                                class="text-none font-weight-medium"
                                                color="medium-emphasis"
                                                variant="text"
                                                @click="close"
                                            >
                                                Cancel
                                            </v-btn>
                                            <v-spacer></v-spacer>
                                            <v-btn
                                                class="text-none px-6 font-weight-bold"
                                                color="primary"
                                                variant="elevated"
                                                @click="save"
                                            >
                                                Save
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>

                                <!-- Delete Dialog -->
                                <v-dialog v-model="dialogDelete" max-width="500px">
                                    <v-card color="surface" elevation="6" class="rounded-lg text-center pa-6">
                                        <v-icon size="64" color="error" class="mx-auto mb-4">warning</v-icon>
                                        <v-card-title class="text-h6 font-weight-bold mb-2 pa-0" style="white-space: normal;">
                                            Are you sure you want to delete this transaction?
                                        </v-card-title>
                                        <v-card-text class="text-body-2 text-medium-emphasis mb-6 pa-0">
                                            This action cannot be undone.
                                        </v-card-text>
                                        <v-card-actions class="pa-0 justify-center">
                                            <v-btn color="medium-emphasis" variant="text" class="text-none px-4" @click="closeDelete">
                                                Cancel
                                            </v-btn>
                                            <v-btn color="error" variant="elevated" class="text-none px-6" @click="deleteItemConfirm">
                                                Delete
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                            </template>

                            <template v-slot:[`item.actions`]="{ item }">
                                <div class="d-flex align-center">
                                    <v-btn icon variant="text" size="small" color="info" class="mr-2" @click="editItem(item)">
                                        <v-icon>edit</v-icon>
                                    </v-btn>
                                    <v-btn icon variant="text" size="small" color="error" @click="deleteItem(item)">
                                        <v-icon>delete</v-icon>
                                    </v-btn>
                                </div>
                            </template>
                        </v-data-table>
                        
                        <div v-else-if="errorMessage" class="text-center py-8 text-error">
                            <v-icon size="48" class="mb-4">error_outline</v-icon>
                            <p class="text-h6">{{ errorMessage }}</p>
                        </div>
                    </v-col>
                </v-row>
            </v-card>
        </v-container>
    </main>
</template>

<style scoped>
/* Override default datepicker input to match vuetify outlined style height */
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
</style>
