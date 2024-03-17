<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { VDataTable, VCard } from 'vuetify/components';
import TransactionsPieChart from '../charts/TransactionsPieChart.vue';
import Transaction from '../model/Transaction';
import { TransactionCategory } from '../model/TransactionCategory';
import TransactionService from '../service/TransactionService';
import CategoryService from '../service/CategoryService';

const props = defineProps<{
  title: string
}>()

const titlePieChart = "Transactions By Category - Pie Chart";
const titleParent = props.title;
const transactions = ref<Transaction[]>([])
const errorMessage = ref('');

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
    console.log(tr)
    transactions.value = tr;
  })
}

</script>

<template>
  <main>
    <v-card class="bg-cyan-950 text-slate-300">
      <h1 class="text-3xl">{{ titleParent }}</h1>
      <div class="w-full mb-10 pl-20 pr-20 p-5" style="height: 40rem;">
        <TransactionsPieChart v-if="transactions" :title="titlePieChart">
        </TransactionsPieChart>
        <p v-else-if="errorMessage">{{ errorMessage }}</p>
        <p v-else>Loading..</p>
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
