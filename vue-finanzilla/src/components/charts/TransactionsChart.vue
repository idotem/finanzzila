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
import { useTheme } from 'vuetify';
import Transaction from '../model/Transaction';
import type { TransactionCategory } from '../model/TransactionCategory';
import { ref, watch, computed } from 'vue';
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

const categories = ref<TransactionCategory[]>([]);
const transactions = ref<Transaction[]>([]);
const timePeriod = ref<string>('All time');
const categoriesForChart = ref<any[]>([]);
const data = ref();

const router = useRouter();
const theme = useTheme();

const chartTextColor = computed(() => theme.global.current.value.dark ? '#fff' : '#333');
const chartGridColor = computed(() => theme.global.current.value.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');

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
    rotateAxisLocal.value = axis;
}

const rotateAxisLocal = ref('x');

interface GroupedTransactions {
    [category: string]: {
        categoryId: number;
        categoryName: string;
        totalAmount: number;
        transactions: Transaction[];
        percentFromTotal: string;
        color: string;
    };
}

function groupTransactionsAverageDelimiter(
    groupedTransactionsArray: any[],
    delimiterForWhichAverageIsReturned: number
): any {
    return groupedTransactionsArray.map((tr) =>
        Math.round(Math.abs(tr.totalAmount) / delimiterForWhichAverageIsReturned)
    );
}

function groupAveragesByTimePeriod(
    groupedTransactionsArray: any[],
    timePeriod: string
): any[] {
    return groupTransactionsAverageDelimiter(
        groupedTransactionsArray,
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
            const categoryColor = transaction.category.color;
            if (categoryIsExpense === 0) {
                return acc;
            }
            if (!acc[categoryName]) {
                acc[categoryName] = {
                    categoryId: categoryId,
                    categoryName: categoryName,
                    totalAmount: 0,
                    transactions: [],
                    percentFromTotal: '',
                    color: categoryColor || '#cccccc'
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
    const sortedGroupedTransactionsArray = Object.values(groupedTransactions).sort((a, b) => parseFloat(b.percentFromTotal) - parseFloat(a.percentFromTotal));
    categoriesForChart.value = sortedGroupedTransactionsArray;
    const totalAmountsByCategory = groupAveragesByTimePeriod(sortedGroupedTransactionsArray, timePeriod);
    const categoriesLabelsForBarReduced = sortedGroupedTransactionsArray.map(
        (tr) => tr.percentFromTotal + '% ' + tr.categoryName
    );
    const categoryColors = sortedGroupedTransactionsArray.map(tr => tr.color);
    const categoryBackgroundColors = categoryColors.map(color => {
        if (color && color.startsWith('#') && color.length === 7) {
            return color + '80'; // Add 50% opacity
        }
        return color;
    });

    data.value = {
        labels: categoriesLabelsForBarReduced,
        datasets: [
            {
                label: 'Expenses',
                fill: false,
                backgroundColor: categoryBackgroundColors,
                borderColor: categoryColors,
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
                    color: chartTextColor.value
                },
                grid: {
                    color: chartGridColor.value
                }
            },
            x: {
                ticks: {
                    color: chartTextColor.value
                },
                grid: {
                    color: chartGridColor.value
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                align: 'center',
                position: 'top' as const,
                labels: {
                    color: chartTextColor.value,
                    font: {
                        size: 16
                    }
                }
            },
            datalabels: {
                anchor: 'end' as const,
                align: 'end' as const,
                color: chartTextColor.value,
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

const barChartOptions = computed(() => getBarChartOptions(rotateAxisLocal.value));

const doughtnutChartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    color: chartTextColor.value,
    borderColor: chartGridColor.value,
    cutout: '40%',
    plugins: {
        legend: {
            align: 'start' as const,
            color: chartTextColor.value,
            position: 'right' as const,
            labels: {
                color: chartTextColor.value,
                font: {
                    size: 14
                },
                filter: function (item: any) {
                    const text = item.text || '';
                    const percentMatch = text.match(/^(\d+(\.\d+)?)%/);
                    if (percentMatch) {
                        return parseFloat(percentMatch[1]) >= 1;
                    }
                    return true;
                }
            }
        },
        datalabels: {
            anchor: 'center' as const,
            color: chartTextColor.value,
            display: false,
            font: {
                weight: 'bold' as const
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
}));
</script>
<template>
    <h2 class="text-center text-xl" :class="theme.global.current.value.dark ? 'text-slate-200' : 'text-slate-800'">
        {{ props.chartTypeProp + ' - Averaged by ' + timePeriod }}
    </h2>

    <div v-if="data && props.chartTypeProp == 'Bar'" style="position: relative; min-height: 400px; height: 400px; width: 100%;">
        <v-icon
            :color="theme.global.current.value.dark ? '#ffffff' : '#333333'"
            @click="() => clickedRotateAxis()"
            icon="refresh"
            style="position: absolute; top: 0; right: 0; z-index: 10;"
            class="mr-5 hover:opacity-80 transition-opacity"
        ></v-icon>
        <Bar
            id="barChart"
            v-bind="data"
            :data="data"
            :options="barChartOptions"
        />
    </div>
    <div v-if="data && props.chartTypeProp == 'Doughnut'" class="mt-4" style="position: relative; min-height: 400px; height: 400px; width: 100%;">
        <Doughnut :data="data" :options="doughtnutChartOptions" />
    </div>
</template>
