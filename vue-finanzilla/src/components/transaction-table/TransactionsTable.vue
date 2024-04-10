<script setup lang="ts">
import CategoryService from '@/service/CategoryService';
import TransactionService from '@/service/TransactionService';
import { VDataTable, VContainer, VRow, VSheet, VCol } from 'vuetify/components';
import VueDatePicker from '@vuepic/vue-datepicker'
import { ref, onMounted, watch } from 'vue';
import type Transaction from '../model/Transaction';
import type { TransactionCategory } from '../model/TransactionCategory';
import TransactionFilterDto from '../model/TransactionFilterDto';

const props = defineProps({
    categoryId: {
        type: Number,
        required: false
    },
});

const transactions = ref<Transaction[]>([])
const categories = ref<TransactionCategory[]>([])
const errorMessage = ref('');
const rangeDateFilter = ref<Date[]>([]);
const filterCategoryId = ref<number | undefined>(undefined);

watch(() => props.categoryId, () => {
    console.log(props.categoryId)
    filterCategoryId.value = props.categoryId;
})

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
    const filter: TransactionFilterDto = rangeDateFilter.value !== null
        ? new TransactionFilterDto(rangeDateFilter.value[0], rangeDateFilter.value[1], filterCategoryId.value)
        : new TransactionFilterDto(undefined, undefined, undefined);
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
                        :items="transactions.map((tr) => { return { ...tr, category: tr.category.name } })">
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