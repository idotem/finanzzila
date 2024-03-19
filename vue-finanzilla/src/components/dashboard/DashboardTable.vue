<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { VDataTable, VCard, VFileInput, VBtn } from 'vuetify/components';
import TransactionsPieChart from '../charts/TransactionsPieChart.vue';
import Transaction from '../model/Transaction';
import TransactionService from '../service/TransactionService';

const titlePieChart = ref<string>("Transactions By Category - Pie Chart");
const transactions = ref<Transaction[]>([])
const errorMessage = ref('');
const file = ref<File | null>();

onMounted(async () => {
  try {
    await fetchTransactions();
  } catch (error) {
    errorMessage.value = 'Error fetching data';
    console.error('Error fetching data:', error);
  }
});

const fetchTransactions = async () => {
  TransactionService.getAllFiltered().then((tr: Transaction[]) => {
    // transactions.value = tr.map((t) => {
    //   return { ...t, category: t.category.name }
    // }
    // );
    transactions.value = tr;
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
    <v-card class="bg-cyan-950 text-slate-300">
      <h1 class="text-3xl">Dashboard</h1>
      <div class="w-full h-40">
        <div class="w-1/5 float-end pr-10">
          <label for="fileInput">Upload file with transactions</label>
          <v-file-input label="" @change="handleFileUpload" accept=".xlsx"></v-file-input>
          <v-btn v-if="file" color="secondary" @click="uploadFile">Upload</v-btn>
        </div>
      </div>
      <div class="w-full mb-10 pl-20 pr-20 p-5" style="height: 40rem;">
        <TransactionsPieChart v-if="transactions && transactions.length !== 0" :title="titlePieChart"
          :transactionsProp="transactions">
        </TransactionsPieChart>
        <h2 v-else-if="errorMessage">{{ errorMessage }}</h2>
        <h1 v-else>No transactions, no pie</h1>
      </div>

      <h1>Transactions</h1>
      <v-data-table color="black" class="bg-cyan-950 border-2 border-black text-slate-300" v-if="transactions"
        :items="transactions"></v-data-table>
      <p v-else-if="errorMessage">{{ errorMessage }}</p>
      <p v-else>Loading..</p>
    </v-card>
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
</style>, type Ref
