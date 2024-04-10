<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import Transaction from '../model/Transaction';
import type { TransactionCategory } from '../model/TransactionCategory';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
    transactionsProp: {
        type: Array as () => Transaction[],
        required: true
    },
});

const categories = ref<TransactionCategory[]>([]);
const categoriesForPie = ref<any[]>([]);
const transactions = ref<Transaction[]>([]);
const groupedTransactions = ref<GroupedTransactions | undefined>(undefined)
const data = ref();
const router = useRouter()

watch(() => props.transactionsProp, (newValue: Transaction[], oldValue) => {
    transactions.value = newValue;
    categories.value = newValue.map((t) => t.category);
    groupTransactions(newValue);
}, { immediate: true });

interface GroupedTransactions {
    [category: string]: {
        categoryId: number,
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
        const categoryId = transaction.category.id;
        if (categoryName == 'INCOME') {
            return acc;
        }
        if (!acc[categoryName]) {
            acc[categoryName] = {
                categoryId: categoryId,
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
    categoriesForPie.value = Object.values(groupedTransactions.value);
    const categoriesForPieReduced = Object.values(groupedTransactions.value)
        .map((tr) => tr.percentFromTotal + '% ' + tr.categoryName)
    const totalAmountsByCategory = Object.values(groupedTransactions.value)
        .map((tr) => tr.totalAmount);
    data.value = {
        labels: categoriesForPieReduced,
        datasets: [
            {
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
        },
        datalabels: {
            anchor: 'center',
            color: 'white',
            display: false,
            font: {
                weight: 'bold'
            }
        }
    },
    onClick: function (event: any, elements: any) {
        const firstPoint = (elements[0])
        if (!firstPoint) {
            console.log("Not clicked on any category.")
            return;
        }
        const categoryId = categoriesForPie.value[firstPoint.index].categoryId;
        router.push({ name: 'Transactions', params: { categoryId: categoryId } })
    }
}

</script>
<template>
    <h2 class="text-center text-xl text-slate-200">Pie - Expenses</h2>
    <Doughnut v-if="data" :data="data" :options="options" class="text-slate-200" />
</template>
