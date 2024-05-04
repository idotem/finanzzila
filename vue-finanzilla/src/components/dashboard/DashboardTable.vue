<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { VFileInput, VBtn, VContainer, VRow, VSheet, VCol, VChip, VHover } from 'vuetify/components';
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import TransactionsPieChart from '../charts/TransactionsPieChart.vue';
import TransactionsBarChart from '../charts/TransactionsBarChart.vue';
import Transaction from '../model/Transaction';
import TransactionFilterDto from '../model/TransactionFilterDto';
import TransactionService from '../../service/TransactionService';
import type { TransactionCategory } from '../model/TransactionCategory';
import CategoryService from '../../service/CategoryService';
import { convertNumberToCurrency } from '../../utils/CurrencyConverter'

const transactions = ref<Transaction[]>([])
const categories = ref<TransactionCategory[]>([])
const errorMessage = ref('');
const files = ref<File[] | undefined>();
const rangeDateFilter = ref<Date[]>([]);
const filterCategoryId = ref<number | undefined>(undefined);
const totalExpenses = ref<number>();
const totalIncome = ref<number>();
const differenceExpensesIncome = ref<number>();
const currentCurrency = ref<string>('MKD');


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
  const filter: TransactionFilterDto = new TransactionFilterDto(rangeDateFilter.value[0], rangeDateFilter.value[1], filterCategoryId.value);
  TransactionService.getAllFiltered(filter).then((tr: Transaction[]) => {
    transactions.value = tr;
    calculateStats(tr);
  })
}

watch(rangeDateFilter, () => {
  fetchTransactions();
});

watch(filterCategoryId, () => {
  fetchTransactions();
});

const fetchCategories = async () => {
  CategoryService.getAllTransactionCategories().then((trC: TransactionCategory[]) => {
    categories.value = trC;
  })
}

function calculateStats(transactions: Transaction[]) {
  // these should be in minus(-)
  totalExpenses.value = transactions.reduce((acc, curr) => curr.category.name !== 'INCOME' ? acc += curr.amount : acc, 0)
  totalIncome.value = transactions.reduce((acc, curr) => curr.category.name === 'INCOME' ? acc += curr.amount : acc, 0)
  differenceExpensesIncome.value = totalIncome.value + totalExpenses.value;
}

async function uploadFile() {
  if (files.value && files.value.length > 0) {
    try {
      await TransactionService.uploadFileTransactions(files.value[0])
        .then((tr: Transaction[]) => {
          transactions.value = tr;
          calculateStats(tr);
          files.value = undefined;
        })
    } catch (error) {
      console.error(error);
      files.value = undefined;
    }
  }
};


</script>

<template>
  <main>
    <h1 class="text-3xl text-black">Dashboard</h1>
    <v-container>
      <v-row align="start">
        <v-col cols="10" sm="4" md="3">
          <v-file-input center-affix v-model="files" class="text-black" density="default" color="#21183C"
            label="Upload file with transactions" accept=".xlsx" prepend-icon="attach_file" variant="underlined"
            counter>
            <template v-slot:selection="{ fileNames }">
              <template v-for="(fileName, index) in fileNames" :key="fileName">
                <v-chip v-if="index < 2" class="text-purple-950 text-xl" size="large" label>
                  {{ fileName }}
                </v-chip>
              </template>
            </template>
          </v-file-input>
        </v-col>
        <v-col cols="2" class="m-auto">
          <v-hover>
            <template v-slot:default="{ isHovering, props }">
              <v-btn v-bind="props" v-if="files?.length" :color="isHovering ? '#ffffff' : '#3b0764'"
                @click="uploadFile">Upload</v-btn>
              <!-- color="#1ABC9C" -->
            </template>
          </v-hover>
        </v-col>
        <v-col cols="0" sm="1" md="3"></v-col>
        <v-col cols="12" sm="5" md="4">
          <label class="text-lg text-black" for="filterDateFrom">Pick a date range:</label>
          <VueDatePicker dark v-model="rangeDateFilter" :enable-time-picker="false" :range="{ partialRange: false }">
          </VueDatePicker>
        </v-col>
      </v-row>
      <v-row align="start" class="mb-2 mt-0">
        <v-col cols="12" md="12" xl="6" :key="1" style="height: 36rem;">
          <v-sheet class="p-4 shadow-black shadow-lg bg-cyan-950 rounded-xl"
            style="height: 34rem; overflow-x: scroll; overflow-y: hidden;">
            <div style="height: 31rem; min-width: 40rem;" v-if="transactions && transactions.length !== 0">
              <TransactionsPieChart :transactionsProp="transactions">
              </TransactionsPieChart>
            </div>
            <h2 v-else-if="errorMessage">{{ errorMessage }}</h2>
            <h1 v-else>No transactions, no pie</h1>
          </v-sheet>
        </v-col>
        <v-col cols="12" md="12" xl="6" key="2" style="height: 36rem;">
          <v-sheet class="p-4 shadow-black shadow-lg pb-10 bg-cyan-950 rounded-xl items-center"
            style="height: 34rem; overflow-x: scroll; overflow-y: hidden">
            <div style="height: 31rem; min-width: 40rem;" v-if="transactions && transactions.length !== 0">
              <TransactionsBarChart :transactionsProp="transactions">
              </TransactionsBarChart>
            </div>
            <h2 v-else-if="errorMessage">{{ errorMessage }}</h2>
            <h1 v-else>No transactions, no pie</h1>
          </v-sheet>
        </v-col>
      </v-row>
      <v-row class="bg-cyan-950 text-slate-200 p-4 pb-10 rounded-xl shadow-black shadow-lg mb-4">
        <v-col cols="12">
          <h1 class="text-center text-xl">General statistics</h1>
        </v-col>
        <v-col class="text-lg">
          <select class="w-1/5 h-9 rounded-sm bg-[#212121] text-slate-300 p-2" name="changeCurrency"
            v-model="currentCurrency">
            <option value="MKD">MKD</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <p>
            Total amount earned: {{ convertNumberToCurrency(totalIncome, currentCurrency) }}
          </p>
          <p>
            Total amount spend: {{ convertNumberToCurrency(totalExpenses, currentCurrency) }}
          </p>
          <p>
            Difference: {{ convertNumberToCurrency(differenceExpensesIncome, currentCurrency) }}
          </p>
          <p>
            First transaction date: {{ transactions.at(transactions.length - 1)?.date }}
          </p>
          <p>
            Last transaction date: {{ transactions.at(0)?.date }}
          </p>
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
