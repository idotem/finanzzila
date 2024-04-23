<script setup lang="ts">
import CategoryService from '@/service/CategoryService';
import TransactionService from '@/service/TransactionService';
import {
    VDataTable, VContainer, VRow, VSheet, VCol, VIcon, VDialog,
    VDivider, VSpacer, VTextField, VBtn, VToolbar, VToolbarTitle,
    VCard, VCardTitle, VCardText, VCardActions
} from 'vuetify/components';
import VueDatePicker from '@vuepic/vue-datepicker'
import { ref, onMounted, watch } from 'vue';
import type Transaction from '../model/Transaction';
import type { TransactionCategory } from '../model/TransactionCategory';
import TransactionFilterDto from '../model/TransactionFilterDto';
import axiosInstance from '@/config/axios/axios';

type TransactionTableProps = {
    categoryId?: number | undefined,
}

const props = defineProps<TransactionTableProps>();

const transactions = ref<Transaction[]>([])
const errorMessage = ref('');
const rangeDateFilter = ref<Date[]>([]);
const filterCategoryId = ref<number | undefined>(props.categoryId);
const categories = ref<TransactionCategory[]>([])
const dialog = ref<boolean>(false);
const dialogDelete = ref<boolean>(false);
const editingItem = ref<any>({})
const deletingItem = ref<any>({});


const transactionsHeaders = [
    { title: 'Date', key: 'date' },
    { title: 'Company name', key: 'nameOfPlace' },
    { title: 'Amount (MKD)', key: 'amount' },
    { title: 'Category', key: 'category' },
    { title: 'Actions', key: 'actions', sortable: false },
];

onMounted(async () => {
    try {
        await fetchTransactions();
        await fetchCategories();
    } catch (error) {
        errorMessage.value = 'Error fetching data';
        console.error('Error fetching data:', error);
    }
});

const fetchTransactions = async () => {
    const filter: TransactionFilterDto = new TransactionFilterDto(rangeDateFilter.value[0],
        rangeDateFilter.value[1], filterCategoryId.value);
    TransactionService.getAllFiltered(filter).then((tr: Transaction[]) => {
        transactions.value = tr;
    })
}

watch(rangeDateFilter, () => {
    fetchTransactions();
});

watch(filterCategoryId, () => {
    fetchTransactions();
});

const fetchCategories = async () => {
    CategoryService.getAllCategories().then((trC: TransactionCategory[]) => {
        categories.value = trC;
    })
}
function editItem(item: any) {
    // editedIndex = desserts.indexOf(item)
    // editedItem = Object.assign({}, item)
    dialog.value = true
}

function deleteItem(item: any) {
    deletingItem.value = item;
    // editedIndex = desserts.indexOf(item)
    // editedItem = Object.assign({}, item)
    dialogDelete.value = true
}

function deleteItemConfirm() {
    TransactionService.delete(deletingItem.value.id)
        .then(() => {
            fetchTransactions()
        })
        .catch((err) => {
            alert(`Unsuccesfull: ${err}`)
        })

    // desserts.splice(this.editedIndex, 1)
    closeDelete()
}

function close() {
    dialog.value = false
    // this.$nextTick(() => {
    //     this.editedItem = Object.assign({}, this.defaultItem)
    //     this.editedIndex = -1
    // })
}

function closeDelete() {
    dialogDelete.value = false
    // this.$nextTick(() => {
    //     this.editedItem = Object.assign({}, this.defaultItem)
    //     this.editedIndex = -1
    // })
}

function save() {
    close()
}

</script>

<template>
    <main>
        <h1 class="text-3xl text-black mb-4">Transactions</h1>
        <v-container>
            <v-row class="bg-cyan-950 text-slate-200 p-4 pb-10 rounded-xl shadow-black shadow-lg mb-1">
                <v-col cols="12" sm="12" md="6">
                    <v-sheet class="bg-cyan-950 text-slate-200">
                        <label for="filterDateFrom">Pick a date range:</label>
                        <VueDatePicker auto-apply dark v-model="rangeDateFilter" :enable-time-picker="false"
                            :range="{ partialRange: false }">
                        </VueDatePicker>
                    </v-sheet>
                </v-col>
                <v-col cols="12" sm="12" md="3">
                    <v-sheet class="bg-cyan-950 text-slate-200">
                        <label class="w-full" for="filterCategory">Category:</label>
                        <select class="w-full h-9 rounded-sm bg-[#212121] text-slate-300" name="filterCategory"
                            v-model="filterCategoryId">
                            <option :value="undefined">Clear Filter</option>
                            <option v-for="category in categories" :value="category.id" v-bind:key="category.id">
                                {{ category.name }}
                            </option>
                        </select>
                    </v-sheet>
                </v-col>
                <v-col cols="12">
                    <VDataTable hover color="black" class="bg-cyan-950 text-slate-200 text-xl" v-if="transactions"
                        :headers="transactionsHeaders" :items="transactions.map((tr) => {
                            return {
                                ...tr, category:
                                    tr.category.name
                            }
                        })">
                        <template v-slot:top>
                            <v-toolbar flat>
                                <v-toolbar-title>Transactions</v-toolbar-title>
                                <v-divider class="mx-4" inset vertical></v-divider>
                                <v-spacer></v-spacer>
                                <v-dialog v-model="dialog" max-width="500px">
                                    <template v-slot:activator="{ props }">
                                        <v-btn class="mb-2" color="primary" dark v-bind="props">
                                            New Item
                                        </v-btn>
                                    </template>
                                    <v-card>
                                        <v-card-title>
                                            <span class="text-h5">Add/Edit</span>
                                        </v-card-title>

                                        <v-card-text>
                                            <v-container>
                                                <v-row>
                                                    <v-col cols="12" md="4" sm="6">
                                                        <v-text-field v-model="editingItem.date"
                                                            label="Date"></v-text-field>
                                                    </v-col>
                                                    <v-col cols="12" md="4" sm="6">
                                                        <v-text-field v-model="editingItem.nameOfPlace"
                                                            label="Company name"></v-text-field>
                                                    </v-col>
                                                    <v-col cols="12" md="4" sm="6">
                                                        <v-text-field v-model="editingItem.amount"
                                                            label="Amount (MKD)"></v-text-field>
                                                    </v-col>
                                                    <v-col cols="12" md="4" sm="6">
                                                        <select
                                                            class="w-full h-9 rounded-sm bg-[#212121] text-slate-300"
                                                            name="filterCategory" v-model="editingItem.category">
                                                            <option :value="undefined">Clear Choice</option>
                                                            <option v-for="category in categories" :value="category.id"
                                                                v-bind:key="category.id">
                                                                {{ category.name }}
                                                            </option>
                                                        </select>
                                                    </v-col>
                                                </v-row>
                                            </v-container>
                                        </v-card-text>

                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="blue-darken-1" variant="text" @click="close">
                                                Cancel
                                            </v-btn>
                                            <v-btn color="blue-darken-1" variant="text" @click="save">
                                                Save
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                                <v-dialog v-model="dialogDelete" max-width="500px">
                                    <v-card>
                                        <v-card-title class="text-h5">Are you sure you want to delete this
                                            item?</v-card-title>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="blue-darken-1" variant="text"
                                                @click="closeDelete">Cancel</v-btn>
                                            <v-btn color="blue-darken-1" variant="text"
                                                @click="deleteItemConfirm">OK</v-btn>
                                            <v-spacer></v-spacer>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                            </v-toolbar>
                        </template>
                        <template v-slot:[`item.actions`]="{ item }">
                            <v-icon class="me-2" size="small" @click="editItem(item)">
                                edit
                            </v-icon>
                            <v-icon size="small" @click="deleteItem(item)">
                                delete
                            </v-icon>
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