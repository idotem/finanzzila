<script setup lang="ts">
import CategoryService from '@/service/CategoryService';
import TransactionService from '@/service/TransactionService';
import {
    VDataTable,
    VContainer,
    VRow,
    VSheet,
    VCol,
    VIcon,
    VDialog,
    VSpacer,
    VTextField,
    VBtn,
    VCheckbox,
    VCard,
    VCardTitle,
    VCardText,
    VCardActions,
    VOverlay,
    VProgressCircular
} from 'vuetify/components';
import VueDatePicker from '@vuepic/vue-datepicker';
import { ref, onMounted, watch } from 'vue';
import Transaction from '../model/Transaction';
import type { TransactionCategory } from '../model/TransactionCategory';
import TransactionFilterDto from '../model/TransactionFilterDto';
import TransactionDto from '../model/TransactionDto';
import LoadingSpinner from '../configuration/LoadingSpinner.vue';

type TransactionTableProps = {
    categoryId?: number | undefined;
    dateFilterFrom?: Date | undefined | null;
    dateFilterTo?: Date | undefined | null;
};

const props = defineProps<TransactionTableProps>();

const transactions = ref<Transaction[]>([]);
const errorMessage = ref('');
const loading = ref<boolean>(false);
const rangeDateFilter = ref<Date[]>(
    props.dateFilterFrom && props.dateFilterTo ? [props.dateFilterFrom, props.dateFilterTo] : []
);
const filterCategoryId = ref<number | undefined>(props.categoryId);
const categories = ref<TransactionCategory[]>([]);
const dialog = ref<boolean>(false);
const dialogDelete = ref<boolean>(false);
const addCategoryKeyword = ref<boolean>(false);
const editingItem = ref<TransactionDto>(
    new TransactionDto(undefined, undefined, undefined, undefined, undefined, undefined)
);
const deletingItem = ref<any>({});

const transactionsHeaders = [
    { title: 'Date', key: 'date' },
    { title: 'Company name', key: 'nameOfPlace' },
    { title: 'Amount (MKD)', key: 'amount' },
    { title: 'Category', key: 'category.name' },
    { title: 'Actions', key: 'actions', sortable: false }
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
        rangeDateFilter.value ? rangeDateFilter.value[0] : undefined,
        rangeDateFilter.value ? rangeDateFilter.value[1] : undefined,
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

function validateRequest(itemToSave: any) {
    if (!itemToSave.nameOfPlace || !itemToSave.category || !itemToSave.amount || !itemToSave.date) {
        alert('Required fields for transaction are not filled.');
        return;
    }
    if (
        itemToSave.amount > 0 &&
        itemToSave.category.name == 'Income' &&
        itemToSave.amount <= 0 &&
        itemToSave.category.name != 'Income'
    ) {
        alert('If amount is greater than 0, category MUST be Income and otherway around');
    }
    if (!addCategoryKeyword.value) {
        editingItem.value.categoryKeyword = undefined;
    }
    if (itemToSave.categoryKeyword === '') {
        alert('Category keyword can not be empty string');
    }
}

function save() {
    validateRequest(editingItem.value);
    const itemToSave: TransactionDto = editingItem.value;

    loading.value = true;
    if (editingItem.value.id !== undefined) {
        TransactionService.update(editingItem.value.id, itemToSave)
            .then((res) => {
                alert(`Successfully updated transaction ${res.data?.id}`);
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
</script>

<template>
    <main>
        <h1 class="text-3xl text-black mb-4">Transactions</h1>
        <!-- <LoadingSpinner :isLoading="loading"></LoadingSpinner> -->
        <v-overlay :opacity="0.8" v-if="loading">
            <v-progress-circular indeterminate size="64" color="green"></v-progress-circular>
        </v-overlay>

        <v-container>
            <v-row
                class="bg-cyan-950 text-slate-200 p-4 pb-10 rounded-xl shadow-black shadow-lg mb-1"
            >
                <v-col sm="12" md="6">
                    <v-sheet class="bg-cyan-950 text-slate-200">
                        <VueDatePicker
                            placeholder="Pick date range"
                            auto-apply
                            dark
                            v-model="rangeDateFilter"
                            :enable-time-picker="false"
                            :range="{ partialRange: false }"
                        >
                        </VueDatePicker>
                    </v-sheet>
                </v-col>
                <v-col sm="12" md="3">
                    <v-sheet class="bg-cyan-950 text-slate-200">
                        <select
                            class="w-full h-9 rounded-sm bg-[#212121] pl-2 text-slate-300"
                            name="filterCategory"
                            v-model="filterCategoryId"
                        >
                            <option :value="undefined">Choose Category Filter</option>
                            <option
                                v-for="category in categories"
                                :value="category.id"
                                v-bind:key="category.id"
                            >
                                {{ category.name }}
                            </option>
                        </select>
                    </v-sheet>
                </v-col>
                <v-col sm="12" md="3">
                    <v-btn
                        class="float-right"
                        prepend-icon="add"
                        color="rgb(59 7 100)"
                        dark
                        @click="dialog = true"
                        min-height="44px"
                    >
                        <span class="text-white">Add New Transaction</span>
                    </v-btn>
                </v-col>
                <v-col sm="12">
                    <VDataTable
                        hover
                        color="black"
                        class="bg-cyan-950 text-slate-200 text-xl"
                        v-if="transactions"
                        :headers="transactionsHeaders"
                        :items="transactions"
                        height="59vh"
                        :loading="loading"
                    >
                        <template v-slot:top>
                            <v-dialog v-model="dialog" max-width="600px">
                                <v-card
                                    class="bg-[#011936] text-slate-100 font-bold overflow-hidden"
                                >
                                    <v-card-title>
                                        <span v-if="editingItem.date === undefined" class="text-h5"
                                            >Add</span
                                        >
                                        <span v-else class="text-h5">Edit</span>
                                    </v-card-title>
                                    <v-card-text>
                                        <v-container>
                                            <v-row>
                                                <v-col cols="12" sm="12" align-self="center">
                                                    <label>Date</label>
                                                    <VueDatePicker
                                                        v-model="editingItem.date"
                                                        label="Date"
                                                        auto-apply
                                                        dark
                                                        :enable-time-picker="false"
                                                        required
                                                    >
                                                    </VueDatePicker>
                                                </v-col>
                                                <v-col cols="12" sm="12">
                                                    <v-text-field
                                                        v-model="editingItem.nameOfPlace"
                                                        label="Company name"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col cols="12" sm="12">
                                                    <v-text-field
                                                        type="number"
                                                        v-model="editingItem.amount"
                                                        label="Amount (MKD)"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col cols="12" sm="12">
                                                    <label>Category</label>
                                                    <select
                                                        class="w-full h-9 p-2 rounded-sm bg-[#212121] text-slate-300"
                                                        name="filterCategory"
                                                        v-model="editingItem.category"
                                                        v-if="
                                                            (editingItem.amount !== undefined &&
                                                                editingItem.amount <= 0) ||
                                                            !editingItem.amount
                                                        "
                                                    >
                                                        <option :value="undefined">
                                                            Clear Choice
                                                        </option>
                                                        <option
                                                            v-for="category in categories.filter(
                                                                (cat) => cat.name !== 'Income'
                                                            )"
                                                            :value="category.id"
                                                            v-bind:key="category.id"
                                                        >
                                                            {{ category.name }}
                                                        </option>
                                                    </select>
                                                    <select
                                                        class="w-full h-9 p-2 rounded-sm bg-[#212121] text-slate-300"
                                                        name="filterCategory"
                                                        v-model="editingItem.category"
                                                        v-else
                                                    >
                                                        <option :value="undefined">
                                                            Clear Choice
                                                        </option>
                                                        <option
                                                            v-for="category in categories.filter(
                                                                (cat) => cat.name === 'Income'
                                                            )"
                                                            :value="category.id"
                                                            v-bind:key="category.id"
                                                        >
                                                            {{ category.name }}
                                                        </option>
                                                    </select>
                                                </v-col>
                                                <v-col cols="12" sm="12">
                                                    <v-checkbox
                                                        color="success"
                                                        v-model="addCategoryKeyword"
                                                        label="Add category keyword"
                                                    ></v-checkbox>
                                                </v-col>
                                                <v-col v-if="addCategoryKeyword" cols="12" sm="12">
                                                    <v-text-field
                                                        type="text"
                                                        v-model="editingItem.categoryKeyword"
                                                        label="Category Keyword"
                                                    ></v-text-field>
                                                </v-col>
                                            </v-row>
                                        </v-container>
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-row class="w-full">
                                            <v-col md="3">
                                                <v-btn
                                                    class="text-base float-left ml-2 mb-2"
                                                    color="error"
                                                    variant="text"
                                                    @click="close"
                                                >
                                                    Cancel
                                                </v-btn>
                                            </v-col>
                                            <v-col md="6"> </v-col>
                                            <v-col md="3">
                                                <v-btn
                                                    class="text-base float-right"
                                                    color="success"
                                                    variant="text"
                                                    @click="save"
                                                >
                                                    Save
                                                </v-btn>
                                            </v-col>
                                        </v-row>
                                        <v-spacer></v-spacer>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                            <v-dialog v-model="dialogDelete" max-width="600px">
                                <v-card class="bg-[#011936] text-slate-100">
                                    <v-card-title class="text-h5"
                                        >Are you sure you want to delete this item?</v-card-title
                                    >
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="error" variant="text" @click="closeDelete"
                                            >Cancel</v-btn
                                        >
                                        <v-btn
                                            color="success"
                                            variant="text"
                                            @click="deleteItemConfirm"
                                            >OK</v-btn
                                        >
                                        <v-spacer></v-spacer>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </template>
                        <template v-slot:[`item.actions`]="{ item }">
                            <v-icon class="me-2" size="small" @click="editItem(item)">
                                edit
                            </v-icon>
                            <v-icon size="small" @click="deleteItem(item)"> delete </v-icon>
                        </template>
                    </VDataTable>
                    <p v-else-if="errorMessage">{{ errorMessage }}</p>
                    <p v-else>Loading..</p>
                </v-col>
            </v-row>
        </v-container>
    </main>
</template>

<style scoped>
h1,
h2 {
    text-align: center;
}

th,
td {
    padding: 10px;
}
</style>
