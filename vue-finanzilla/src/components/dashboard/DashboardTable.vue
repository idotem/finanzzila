<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { VDataTable, VCard } from 'vuetify/components';
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
  <main>

    <v-card>
      <h1 class="text-3xl">{{ titleParent }}</h1>
      <div class="w-2/4 h-96 bg-black mt-10 mb-10"></div>

      <h1>Transactions</h1>
      <v-data-table color="black" class="border-2 border-black" v-if="transactions"
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
</style>
