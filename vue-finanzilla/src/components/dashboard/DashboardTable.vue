<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { VDataTable, VFileInput, VBtn, VContainer, VRow, VSheet, VCol, VSelect } from 'vuetify/components';
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import TransactionsPieChart from '../charts/TransactionsPieChart.vue';
import Transaction from '../model/Transaction';
import TransactionFilterDto from '../model/TransactionFilterDto';
import TransactionService from '../service/TransactionService';
import type { TransactionCategory } from '../model/TransactionCategory';
import CategoryService from '../service/CategoryService';

const titlePieChart = ref<string>("Transactions By Category - Pie Chart");
const transactions = ref<Transaction[]>([])
const categories = ref<TransactionCategory[]>([])
const errorMessage = ref('');
const file = ref<File | null>();
const filterDateFrom = ref<Date | undefined>(undefined);
const filterDateTo = ref<Date | undefined>(undefined);
const filterCategoryId = ref<number | undefined>(undefined);


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
  const filter: TransactionFilterDto = new TransactionFilterDto(filterDateFrom.value, filterDateTo.value, filterCategoryId.value);
  TransactionService.getAllFiltered(filter).then((tr: Transaction[]) => {
    transactions.value = tr;
  })
}

const fetchCategories = async () => {
  CategoryService.getAllCategories().then((trC: TransactionCategory[]) => {
    categories.value = trC;
  })
}


function handleFileUpload($event: Event) {
  const target = $event.target as HTMLInputElement;
  if (target && target.files) {
    file.value = target.files[0];
  }
}

async function uploadFile() {
  if (file.value) {
    try {
      await TransactionService.uploadFileTransactions(file.value)
        .then((tr: Transaction[]) => {
          transactions.value = tr;
          file.value = null;
        })
    } catch (error) {
      console.error(error);
      file.value = null;
    }
  }
};

</script>

<template>
  <main>
    <h1 class="text-3xl">Dashboard</h1>
    <v-container>
      <v-row align="start">
        <v-col cols="6" :key="1" style="height: 32rem">
          <v-sheet class="p-4 pb-10 m-2 bg-cyan-950 rounded-xl" style="height: 30rem">
            <TransactionsPieChart v-if="transactions && transactions.length !== 0" :title="titlePieChart"
              :transactionsProp="transactions">
            </TransactionsPieChart>
            <h2 v-else-if="errorMessage">{{ errorMessage }}</h2>
            <h1 v-else>No transactions, no pie</h1>
          </v-sheet>
        </v-col>
        <v-col cols="6" :key="2" style="height: 32rem">
          <v-sheet class="p-4 pb-10 m-2 bg-cyan-950 rounded-xl" style="height: 30rem">
            <TransactionsPieChart v-if="transactions && transactions.length !== 0" :title="titlePieChart"
              :transactionsProp="transactions">
            </TransactionsPieChart>
            <h2 v-else-if="errorMessage">{{ errorMessage }}</h2>
            <h1 v-else>No transactions, no pie</h1>
          </v-sheet>
        </v-col>
      </v-row>
      <v-row class="bg-cyan-950 text-slate-200 p-4 pb-10 m-2 rounded-xl">
        <v-col cols="9"></v-col>
        <v-col cols="3">
          <label for="fileInput">Upload file with transactions</label>
          <v-file-input label="" @change="handleFileUpload" accept=".xlsx"></v-file-input>
          <v-btn v-if="file" color="secondary" @click="uploadFile">Upload</v-btn>
        </v-col>
        <v-col cols="3">
          <v-sheet class="bg-cyan-950 text-slate-200">
            <label for="filterDateFrom">Date From:</label>
            <VueDatePicker dark v-model="filterDateFrom" :enable-time-picker="false">
            </VueDatePicker>
          </v-sheet>
        </v-col>
        <v-col cols="3">
          <v-sheet class="bg-cyan-950 text-slate-200">
            <label for="filterDateTo">Date To:</label>
            <VueDatePicker dark v-model="filterDateTo" :enable-time-picker="false">
            </VueDatePicker>
          </v-sheet>
        </v-col>
        <v-col cols="3">
          <v-sheet class="bg-cyan-950 text-slate-200">
            <label class="w-full" for="filterCategory">Category:</label>
            <select class="w-full h-9 rounded-sm bg-[#212121] text-slate-300" name="filterCategory"
              bg-color="teal-lighten-2" v-model="filterCategoryId">
              <option :value="undefined">Remove</option>
              <option v-for="category in categories" :value="category.id" v-bind:key="category.id">
                {{ category.name }}
              </option>
            </select>
          </v-sheet>
        </v-col>
        <v-col cols="3" class="mt-10">
          <v-sheet class="bg-cyan-950">
            <v-btn class="text-slate-300" @click="fetchTransactions">Apply Filters</v-btn>
          </v-sheet>
        </v-col>

        <v-col cols="12">
          <h1>Transactions</h1>
          <VDataTable hover color="black" class="bg-cyan-950 border-2 border-black text-slate-300" v-if="transactions"
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
