<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { VDataTable } from 'vuetify/components';
const props = defineProps<{
  title: string
}>()

const titleParent = props.title;
const transactions: any = ref([])
const errorMessage = ref(undefined);

onMounted(() => {
  fetchTransactions();
})

const fetchTransactions = async () => {
  try {
    const response = await axios.get('http://localhost:3000/transactions');
    transactions.value = response.data;
    console.log(response.data);
  } catch (err: any) {
    errorMessage.value = err;
  }
}
console.log(transactions);
</script>

<template>
  <main class="bg-green-950 text-white">

    <h1>{{ titleParent }}</h1>
    <hr>
    <h2>Transactions</h2>
    <v-data-table class="bg-green-950 text-white" v-if="transactions" :items="transactions"></v-data-table>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else>Loading..</p>
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
