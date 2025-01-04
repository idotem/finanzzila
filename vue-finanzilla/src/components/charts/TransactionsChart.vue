<script setup lang="ts">
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip
} from 'chart.js';
import { VIcon } from 'vuetify/components';
import Transaction from '../model/Transaction';
import type { TransactionCategory } from '../model/TransactionCategory';
import { ref, watch } from 'vue';
import { Bar, Doughnut } from 'vue-chartjs';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useRouter } from 'vue-router';
import CommonCalculations from '../common/CommonCalculations';

ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    ChartDataLabels,
    ArcElement
);
type TransactionChartProps = {
    transactionsProp: Transaction[];
    timePeriodProp: string;
    dateFilterProp: Date[] | null;
    chartTypeProp: string;
};

const props = defineProps<TransactionChartProps>();
// const props = defineProps({
//     transactionsProp: {
//         type: Array as () => Transaction[],
//         required: true
//     },
//     timePeriodProp: {
//         type: String,
//         required: true
//     },
//     chartTypeProp: {
//         type: String as () => 'Bar' | 'Doughnut',
//         required: true
//     },
//     dateFilterProp: {
//         type: Array as () => Date[],
//         required: true
//     }
// });

const categories = ref<TransactionCategory[]>([]);
const transactions = ref<Transaction[]>([]);
const timePeriod = ref<string>('All time');
const categoriesForChart = ref<any[]>([]);
const data = ref();

const router = useRouter();

watch(
    () => props,
    (newValue) => {
        transactions.value = newValue.transactionsProp;
        categories.value = newValue.transactionsProp?.map((t) => t.category);
        timePeriod.value = newValue.timePeriodProp;
        groupTransactions(newValue.transactionsProp, newValue.timePeriodProp);
    },
    { immediate: true, deep: true }
);

function clickedRotateAxis(): void {
    const axis = barChartOptions.value.indexAxis == 'x' ? 'y' : 'x';
    barChartOptions.value = getBarChartOptions(axis);
}

interface GroupedTransactions {
    [category: string]: {
        categoryId: number;
        categoryName: string;
        totalAmount: number;
        transactions: Transaction[];
        percentFromTotal: string;
    };
}

function groupTransactionsAverageDelimiter(
    groupedTransactions: GroupedTransactions,
    delimiterForWhichAverageIsReturned: number
): any {
    return Object.values(groupedTransactions).map((tr) =>
        Math.round(Math.abs(tr.totalAmount) / delimiterForWhichAverageIsReturned)
    );
}

function groupAveragesByTimePeriod(
    groupedTransactions: GroupedTransactions,
    timePeriod: string
): GroupedTransactions {
    return groupTransactionsAverageDelimiter(
        groupedTransactions,
        CommonCalculations.getDelimiterBasedOnTimePeriod(transactions.value, timePeriod)
    );
}

function groupTransactions(tr: Transaction[], timePeriod: string) {
    const totalAmount = tr.reduce(
        (acc, curr) => (curr.category.isExpense === 1 ? acc + Math.abs(curr.amount) : acc),
        0
    );
    const groupedTransactions: GroupedTransactions = tr.reduce(
        (acc: GroupedTransactions, transaction) => {
            const { amount } = transaction;
            const categoryName = transaction.category.name;
            const categoryIsExpense = transaction.category.isExpense;
            const categoryId = transaction.category.id;
            if (categoryIsExpense === 0) {
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
            acc[categoryName].percentFromTotal = Math.abs(
                (acc[categoryName].totalAmount / totalAmount) * 100
            ).toFixed(2);
            acc[categoryName].transactions.push(transaction);
            return acc;
        },
        {}
    );
    categoriesForChart.value = Object.values(groupedTransactions);
    const totalAmountsByCategory = groupAveragesByTimePeriod(groupedTransactions, timePeriod);
    const categoriesLabelsForBarReduced = Object.values(groupedTransactions).map(
        (tr) => tr.percentFromTotal + '% ' + tr.categoryName
    );
    data.value = {
        labels: categoriesLabelsForBarReduced,
        datasets: [
            {
                label: 'Expenses',
                fill: false,
                backgroundColor: [
                    'rgba(108, 52, 131, 0.5)', // #6C3483
                    'rgba(130, 224, 170, 0.5)', // #82E0AA
                    'rgba(231, 76, 60, 0.5)', // #E74C3C
                    'rgba(169, 204, 227, 0.5)', // #A9CCE3
                    'rgba(88, 214, 141, 0.5)', // #58D68D
                    'rgba(248, 196, 113, 0.5)', // #F8C471
                    'rgba(236, 112, 99, 0.5)', // #EC7063
                    'rgba(69, 179, 157, 0.5)', // #45B39D
                    'rgba(213, 219, 219, 0.5)', // #D5DBDB
                    'rgba(255, 87, 51, 0.5)', // #FF5733
                    'rgba(174, 198, 207, 0.5)', // #AEC6CF
                    'rgba(125, 60, 152, 0.5)', // #7D3C98
                    'rgba(249, 231, 159, 0.5)', // #F9E79F
                    'rgba(46, 64, 83, 0.5)', // #2E4053
                    'rgba(155, 89, 182, 0.5)', // #9B59B6
                    'rgba(245, 176, 65, 0.5)', // #F5B041
                    'rgba(250, 219, 216, 0.5)', // #FADBD8
                    'rgba(26, 188, 156, 0.5)', // #1ABC9C
                    'rgba(243, 156, 18, 0.5)', // #F39C12
                    'rgba(165, 105, 189, 0.5)' // #A569BD
                ],
                borderColor: [
                    'rgba(108, 52, 131)', // #6C3483
                    'rgba(130, 224, 170)', // #82E0AA
                    'rgba(231, 76, 60)', // #E74C3C
                    'rgba(169, 204, 227)', // #A9CCE3
                    'rgba(88, 214, 141)', // #58D68D
                    'rgba(248, 196, 113)', // #F8C471
                    'rgba(236, 112, 99)', // #EC7063
                    'rgba(69, 179, 157)', // #45B39D
                    'rgba(213, 219, 219)', // #D5DBDB
                    'rgba(255, 87, 51)', // #FF5733
                    'rgba(174, 198, 207)', // #AEC6CF
                    'rgba(125, 60, 152)', // #7D3C98
                    'rgba(249, 231, 159)', // #F9E79F
                    'rgba(46, 64, 83)', // #2E4053
                    'rgba(155, 89, 182)', // #9B59B6
                    'rgba(245, 176, 65)', // #F5B041
                    'rgba(250, 219, 216)', // #FADBD8
                    'rgba(26, 188, 156)', // #1ABC9C
                    'rgba(243, 156, 18)', // #F39C12
                    'rgba(165, 105, 189)' // #A569BD
                ],
                borderWidth: 2,
                data: totalAmountsByCategory
            }
        ]
    };

    return;
}

function getBarChartOptions(rotateAxis: string): any {
    return {
        indexAxis: rotateAxis,
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
                    color: 'white'
                },
                grid: {
                    color: 'black'
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                align: 'center',
                position: 'top',
                labels: {
                    color: 'white',
                    font: {
                        size: 16
                    }
                }
            },
            datalabels: {
                anchor: 'end',
                align: 'end',
                color: 'white',
                offset: 6,
                display: 'auto',
                font: {
                    weight: 'bold'
                },
                backgroundColor: function (context: any) {
                    return context.dataset.backgroundColor;
                },
                borderColor: function (context: any) {
                    return context.dataset.borderColor;
                },
                borderRadius: 2,
                borderWidth: 1,
                padding: 2
            }
        },
        onClick: function (event: any, elements: any) {
            const firstPoint = elements[0];
            if (!firstPoint) {
                return;
            }
            const categoryId = categoriesForChart.value[firstPoint.index].categoryId;
            const dateFilterFrom: any = props.dateFilterProp ? props.dateFilterProp[0] : undefined;
            const dateFilterTo: any = props.dateFilterProp ? props.dateFilterProp[1] : undefined;

            router.push({
                name: 'Transactions',
                query: {
                    categoryId: categoryId,
                    dateFilterFrom: dateFilterFrom,
                    dateFilterTo: dateFilterTo
                }
            });
        }
    };
}

const barChartOptions = ref<any>(getBarChartOptions('x'));

// const barChartOptions: any =
const doughtnutChartOptions: any = {
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
                    size: 16
                }
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
        const firstPoint = elements[0];
        if (!firstPoint) {
            return;
        }
        const categoryId = categoriesForChart.value[firstPoint.index].categoryId;
        const dateFilterFrom: any = props.dateFilterProp ? props.dateFilterProp[0] : undefined;
        const dateFilterTo: any = props.dateFilterProp ? props.dateFilterProp[1] : undefined;

        router.push({
            name: 'Transactions',
            query: {
                categoryId: categoryId,
                dateFilterFrom: dateFilterFrom,
                dateFilterTo: dateFilterTo
            }
        });
    }
};
</script>
<template>
    <h2 class="text-center text-xl text-slate-200">
        {{ props.chartTypeProp + ' - Averaged by ' + timePeriod }}
    </h2>

    <div v-if="data && props.chartTypeProp == 'Bar'" style="height: 95%">
        <v-icon
            color="#ffffff"
            @click="() => clickedRotateAxis()"
            icon="refresh"
            class="float-right mr-5"
        ></v-icon>
        <Bar
            id="barChart"
            v-bind="data"
            :data="data"
            :options="barChartOptions"
            class="text-slate-200"
        />
    </div>
    <div v-if="data && props.chartTypeProp == 'Doughnut'" class="mt-4" style="height: 95%">
        <Doughnut :data="data" :options="doughtnutChartOptions" class="text-slate-200" />
    </div>
</template>
