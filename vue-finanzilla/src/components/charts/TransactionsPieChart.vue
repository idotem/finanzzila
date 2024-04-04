<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import Transaction from '../model/Transaction';
import type { TransactionCategory } from '../model/TransactionCategory';
import { ref, watch } from 'vue';

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
    transactionsProp: {
        type: Array as () => Transaction[],
        required: true
    },
    title: {
        type: String,
        required: false,
    }

});

const categories = ref<TransactionCategory[]>([]);
const transactions = ref<Transaction[]>([]);
const errorMessage = ref<string>('');
const groupedTransactions = ref<GroupedTransactions | undefined>(undefined)
const data = ref();


watch(() => props.transactionsProp, (newValue: Transaction[], oldValue) => {
    transactions.value = newValue;
    categories.value = newValue.map((t) => t.category);
    groupTransactions(newValue);
}, { immediate: true });

interface GroupedTransactions {
    [category: string]: {
        categoryName: string,
        totalAmount: number,
        transactions: Transaction[],
        percentFromTotal: string
    };
}

function groupTransactions(tr: Transaction[]) {
    const totalAmount = tr.reduce((acc, curr) =>
        curr.category.name !== 'INCOME' ?
            acc + Math.abs(curr.amount) : acc, 0);

    groupedTransactions.value = tr.reduce((acc: GroupedTransactions, transaction) => {
        const { amount } = transaction;
        const categoryName = transaction.category.name;
        if (categoryName == 'INCOME') {
            return acc;
        }
        if (!acc[categoryName]) {
            acc[categoryName] = {
                categoryName: categoryName,
                totalAmount: 0,
                transactions: [],
                percentFromTotal: ''
            };
        }
        acc[categoryName].totalAmount += amount;
        acc[categoryName].percentFromTotal = (Math.abs((acc[categoryName].totalAmount / totalAmount) * 100)).toFixed(2);
        acc[categoryName].transactions.push(transaction);
        return acc;
    }, {});
    const categoriesForPie = Object.values(groupedTransactions.value)
        .map((tr) => tr.percentFromTotal + '% ' + tr.categoryName)
    const totalAmountsByCategory = Object.values(groupedTransactions.value)
        .map((tr) => tr.totalAmount);
    data.value = {
        labels: categoriesForPie,
        datasets: [
            {
                backgroundColor: [
                    "#6C3483",
                    "#82E0AA",
                    "#E74C3C",
                    "#A9CCE3",
                    "#58D68D",
                    "#F8C471",
                    "#EC7063",
                    "#45B39D",
                    "#D5DBDB",
                    "#FF5733",
                    "#AEC6CF",
                    "#7D3C98",
                    "#F9E79F",
                    "#2E4053",
                    "#9B59B6",
                    "#F5B041",
                    "#FADBD8",
                    "#1ABC9C",
                    "#F39C12",
                    "#A569BD",

                ],
                data: totalAmountsByCategory,
            }
        ],
    }

}


const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    color: 'rgb(203 213 225)',
    borderColor: 'black',
    cutout: '40%',
    plugins: {
        legend: {
            align: 'start',
            color: 'white',
            position: 'right',
            labels: {
                color: 'white',
                font: {
                    size: 16,
                },
            }
        }
    },
}

</script>
<template>
    <h2 class="text-center text-slate-200">{{ title }}</h2>
    <Doughnut v-if="data" :data="data" :options="options" class="text-slate-200" />
</template>
