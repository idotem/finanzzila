<script setup lang="ts">
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import Transaction from '../model/Transaction';
import type { TransactionCategory } from '../model/TransactionCategory';
import { ref, watch } from 'vue';
import { Bar } from 'vue-chartjs'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
    transactionsProp: {
        type: Array as () => Transaction[],
        required: true
    },
});

const categories = ref<TransactionCategory[]>([]);
const transactions = ref<Transaction[]>([]);
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
    const categoriesForBar = Object.values(groupedTransactions.value)
        .map((tr) => tr.categoryName)
    const totalAmountsByCategory = Object.values(groupedTransactions.value)
        .map((tr) => Math.abs(tr.totalAmount));
    console.log(categoriesForBar)
    data.value = {
        labels: categoriesForBar,
        datasets: [
            {
                label: 'Expenses',
                fill: false,
                backgroundColor: [
                    "rgba(108, 52, 131, 0.5)", // #6C3483
                    "rgba(130, 224, 170, 0.5)", // #82E0AA
                    "rgba(231, 76, 60, 0.5)", // #E74C3C
                    "rgba(169, 204, 227, 0.5)", // #A9CCE3
                    "rgba(88, 214, 141, 0.5)", // #58D68D
                    "rgba(248, 196, 113, 0.5)", // #F8C471
                    "rgba(236, 112, 99, 0.5)", // #EC7063
                    "rgba(69, 179, 157, 0.5)", // #45B39D
                    "rgba(213, 219, 219, 0.5)", // #D5DBDB
                    "rgba(255, 87, 51, 0.5)", // #FF5733
                    "rgba(174, 198, 207, 0.5)", // #AEC6CF
                    "rgba(125, 60, 152, 0.5)", // #7D3C98
                    "rgba(249, 231, 159, 0.5)", // #F9E79F
                    "rgba(46, 64, 83, 0.5)", // #2E4053
                    "rgba(155, 89, 182, 0.5)", // #9B59B6
                    "rgba(245, 176, 65, 0.5)", // #F5B041
                    "rgba(250, 219, 216, 0.5)", // #FADBD8
                    "rgba(26, 188, 156, 0.5)", // #1ABC9C
                    "rgba(243, 156, 18, 0.5)", // #F39C12
                    "rgba(165, 105, 189, 0.5)" // #A569BD
                ],
                borderColor: [
                    "rgba(108, 52, 131)", // #6C3483
                    "rgba(130, 224, 170)", // #82E0AA
                    "rgba(231, 76, 60)", // #E74C3C
                    "rgba(169, 204, 227)", // #A9CCE3
                    "rgba(88, 214, 141)", // #58D68D
                    "rgba(248, 196, 113)", // #F8C471
                    "rgba(236, 112, 99)", // #EC7063
                    "rgba(69, 179, 157)", // #45B39D
                    "rgba(213, 219, 219)", // #D5DBDB
                    "rgba(255, 87, 51)", // #FF5733
                    "rgba(174, 198, 207)", // #AEC6CF
                    "rgba(125, 60, 152)", // #7D3C98
                    "rgba(249, 231, 159)", // #F9E79F
                    "rgba(46, 64, 83)", // #2E4053
                    "rgba(155, 89, 182)", // #9B59B6
                    "rgba(245, 176, 65)", // #F5B041
                    "rgba(250, 219, 216)", // #FADBD8
                    "rgba(26, 188, 156)", // #1ABC9C
                    "rgba(243, 156, 18)", // #F39C12
                    "rgba(165, 105, 189)" // #A569BD
                ],
                borderWidth: 2,
                data: totalAmountsByCategory,
            }
        ],

    }

}

const options: any = {
    // indexAxis: 'y',
    barThickness: 'flex',
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                color: 'white'
            },
            grid: {
                color: 'black'
            }
        },
        x: {
            ticks: {
                color: 'white',
            },
            grid: {
                color: 'black'
            }
        },
    },
    responsive: true,
    maintainAspectRation: false,
    plugins: {
        legend: {
            align: 'center',
            color: '',
            position: 'top',
            labels: {
                color: 'white',
                font: {
                    size: 16,
                },
            }
        },
    },
}


</script>
<template>
    <h2 class="text-center text-xl text-slate-200">Bar</h2>
    <Bar minWidth="100px" v-if="data" :data="data" :options="options" class="text-slate-200" />
</template>
