<script setup lang="ts">
import { ref } from 'vue';
import TransactionsTable from '../components/transaction-table/TransactionsTable.vue';
import { useRoute, type LocationQueryValue } from 'vue-router';

const route = useRoute();
const categoryId = ref<LocationQueryValue | LocationQueryValue[]>(route.query.categoryId);
const dateFilterFrom = ref<LocationQueryValue | LocationQueryValue[]>(route.query.dateFilterFrom);
const dateFilterTo = ref<LocationQueryValue | LocationQueryValue[]>(route.query.dateFilterTo);
</script>

<template>
    <TransactionsTable
        :categoryId="categoryId ? parseInt(categoryId.toString()) : undefined"
        :dateFilterFrom="dateFilterFrom ? new Date(dateFilterFrom.toString()) : undefined"
        :dateFilterTo="dateFilterTo ? new Date(dateFilterTo.toString()) : undefined"
    />
</template>
