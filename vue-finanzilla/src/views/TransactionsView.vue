<script setup lang="ts">
import { ref } from 'vue';
import TransactionsTable from '../components/transaction-table/TransactionsTable.vue'
import { useRoute, type LocationQueryValue } from 'vue-router'

const route = useRoute()
// const categoryId = ref<string | undefined>(typeof route.params.categoryId === "string"
//     ? route.params.categoryId
//     : route.params.categoryId.at(0));
const categoryId = ref<LocationQueryValue | LocationQueryValue[]>(route.query.categoryId);
</script>

<template>
    <TransactionsTable :categoryId="categoryId ? parseInt(categoryId) : undefined" />
</template>
