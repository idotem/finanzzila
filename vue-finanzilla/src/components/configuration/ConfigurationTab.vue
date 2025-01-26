<script setup lang="ts">
import CategoryService from '@/service/CategoryService';
import {
    VBtn,
    VCard,
    VCardActions,
    VCardText,
    VCardTitle,
    VCol,
    VColorPicker,
    VContainer,
    VDataTable,
    VDialog,
    VIcon,
    VRadio,
    VRadioGroup,
    VRow,
    VSpacer,
    VTextField,
    VSelect
} from 'vuetify/components';
import { onMounted, ref, watch, computed } from 'vue';
import { Category } from '../model/Category';
import CategoryDto from '../model/CategoryDto';
import KeywordDto from '../model/KeywordDto';

const errorMessage = ref('');
const categories = ref<Category[]>([]);
const dialog = ref<boolean>(false);
const dialogDelete = ref<boolean>(false);
const editingCategory = ref<Category>(
    new Category(undefined, '', [], undefined, undefined, undefined)
);
const addingKeyword = ref<string>('');
const deletingItem = ref<Category | undefined>(undefined);
const showColorPicker = ref<boolean>(false);

const filters = ref({
    name: '',
    keywords: '',
    isWants: null,
    isExpense: null
});

const categoriesHeaders = [
    {
        title: 'Name',
        key: 'name',
        sortable: true,
        width: '20%',
        headerProps: {
            style: 'font-weight: 800; font-size: 1.5rem'
        }
    },
    {
        title: 'Keywords',
        key: 'keywords',
        sortable: true,
        width: '40%',
        headerProps: {
            style: 'font-weight: 800; font-size: 1.5rem'
        }
    },
    {
        title: 'Wants/Needs',
        key: 'isWants',
        sortable: true,
        width: '15%',
        headerProps: {
            style: 'font-weight: 800; font-size: 1.5rem'
        }
    },
    {
        title: 'Expense/Income',
        key: 'isExpense',
        sortable: true,
        width: '15%',
        headerProps: {
            style: 'font-weight: 800; font-size: 1.5rem'
        }
    },
    {
        key: 'actions',
        sortable: false,
        width: '10%'
    }
];

const filteredCategories = computed(() => {
    return categories.value.filter((item) => {
        if (
            filters.value.name &&
            !item.name.toLowerCase().includes(filters.value.name.toLowerCase())
        )
            return false;
        if (
            filters.value.keywords &&
            !item.keywords.some((k) =>
                k.value.toLowerCase().includes(filters.value.keywords.toLowerCase())
            )
        )
            return false;
        if (filters.value.isWants !== null && item.isWants !== filters.value.isWants) return false;
        if (filters.value.isExpense !== null && item.isExpense !== filters.value.isExpense)
            return false;
        return true;
    });
});

onMounted(async () => {
    try {
        await fetchCategories();
    } catch (error) {
        errorMessage.value = 'Error fetching data';
        console.error('Error fetching data:', error);
    }
});

watch(dialog, () => {
    console.log('EDITING CAT:', editingCategory);
    if (!dialog.value) {
        editingCategory.value = new Category(undefined, '', [], undefined, undefined, undefined);
    }
});

const fetchCategories = async () => {
    CategoryService.getAllCategories().then((trC: Category[]) => {
        categories.value = trC;
        console.log(categories);
    });
};

function editCategory(item: CategoryDto | any) {
    editingCategory.value = item;
    dialog.value = true;
}

function deleteCategory(item: any) {
    deletingItem.value = item;
    dialogDelete.value = true;
}

function deleteKeyword(keyword: KeywordDto | any) {
    const indexDeleting = editingCategory.value.keywords.indexOf(keyword);
    editingCategory.value.keywords.splice(indexDeleting, 1);
}

function deleteCategoryConfirm() {
    if (deletingItem.value?.id) {
        CategoryService.delete(deletingItem.value?.id)
            .then(() => {
                fetchCategories();
            })
            .catch((err) => {
                alert(`Unsuccesfull: ${err}`);
            });
        closeDelete();
    }
}

function close() {
    dialog.value = false;
    editingCategory.value = new CategoryDto(undefined, '', [], undefined, undefined, undefined);
}

function closeDelete() {
    dialogDelete.value = false;
    deletingItem.value = undefined;
}

function addKeywordForCategory() {
    if (addingKeyword.value === '') {
        console.log("Can't add empty keyword");
        return;
    }
    editingCategory.value.keywords.push(new KeywordDto(undefined, addingKeyword.value));
    addingKeyword.value = '';
}

function save() {
    const itemToSave = editingCategory.value;
    console.log('ITEM TO SAVE', itemToSave);
    if (!itemToSave.name) {
        console.error('Category must have a name.', itemToSave);
        return;
    }
    if (itemToSave.id !== undefined) {
        CategoryService.update(itemToSave.id, itemToSave)
            .then((res) => {
                console.info('Successfully updated category', res);
                fetchCategories();
                close();
            })
            .catch((err) => {
                console.error('Unsuccessfully updated category', err);
            });
    } else {
        CategoryService.create(itemToSave)
            .then((res) => {
                console.info('Successfully added category', res);
                fetchCategories();
                close();
            })
            .catch((err) => {
                console.error('Unsuccessfully added category', err);
            });
    }
}

function changeShowColorPicker(): void {
    showColorPicker.value = !showColorPicker.value;
}
</script>

<template>
    <main>
        <v-container>
            <v-row>
                <v-col sm="12">
                    <v-row
                        class="bg-[#073B3A] text-slate-200 p-4 m-2 pb-10 rounded-xl shadow-black shadow-lg mb-1"
                    >
                        <v-col cols="9" class="d-flex gap-4 mb-2">
                            <v-text-field
                                class="max-w-60"
                                v-model="filters.name"
                                label="Name"
                                density="compact"
                                color="white"
                                bg-color="#212121"
                            ></v-text-field>
                            <v-text-field
                                class="max-w-60"
                                v-model="filters.keywords"
                                label="Keywords"
                                density="compact"
                                color="white"
                                bg-color="#212121"
                            ></v-text-field>
                            <v-select
                                class="max-w-40"
                                v-model="filters.isWants"
                                label="Wants/Needs"
                                density="compact"
                                :items="[
                                    { title: 'All', value: null },
                                    { title: 'Wants', value: 1 },
                                    { title: 'Needs', value: 0 }
                                ]"
                                item-color="success"
                                color="white"
                                theme="dark"
                                bg-color="#212121"
                            ></v-select>
                            <v-select
                                class="max-w-40"
                                v-model="filters.isExpense"
                                label="Expense/Income"
                                density="compact"
                                :items="[
                                    { title: 'All', value: null },
                                    { title: 'Expense', value: 1 },
                                    { title: 'Income', value: 0 }
                                ]"
                                item-color="success"
                                color="white"
                                theme="dark"
                                bg-color="#212121"
                            ></v-select>
                        </v-col>
                        <v-col cols="3">
                            <v-btn
                                class="float-right"
                                prepend-icon="add"
                                color="#DAFFEF"
                                @click="dialog = true"
                                min-height="40px"
                            >
                                <span class="text-black">Add</span>
                            </v-btn>
                        </v-col>

                        <v-col cols="12">
                            <VDataTable
                                hover
                                color="black"
                                class="bg-[#073B3A] text-slate-200 text-xl width-full"
                                v-if="categories"
                                :headers="categoriesHeaders"
                                :items="filteredCategories"
                                height="59vh"
                            >
                                <template v-slot:item.name="{ item }">
                                    <div
                                        class="text-xl font-bold"
                                        :style="{ color: `${item.color}` }"
                                    >
                                        <span>
                                            {{ item.name }}
                                        </span>
                                    </div>
                                </template>
                                <template v-slot:item.keywords="{ item }">
                                    <div
                                        :style="{ color: `${item.color}` }"
                                        class="border-black border-b-4"
                                    >
                                        <span
                                            v-for="(keyword, index) in item.keywords"
                                            :key="index"
                                        >
                                            - {{ keyword.value }}
                                        </span>
                                    </div>
                                </template>
                                <template v-slot:item.isWants="{ item }">
                                    <div
                                        class="text-xl font-bold"
                                        :style="{ color: `${item.color}` }"
                                    >
                                        <span
                                            v-if="
                                                item.isWants === undefined || item.isWants === null
                                            "
                                            >Not specified</span
                                        >
                                        <span v-else-if="item.isWants === 1">Wants</span>
                                        <span v-else>Needs</span>
                                    </div>
                                </template>
                                <template v-slot:item.isExpense="{ item }">
                                    <div
                                        class="text-xl font-bold"
                                        :style="{ color: `${item.color}` }"
                                    >
                                        <span v-if="item.isExpense === 1">Expense</span>
                                        <span v-else>Income</span>
                                    </div>
                                </template>
                                <template v-slot:top>
                                    <v-dialog v-model="dialog" max-width="800px">
                                        <v-card
                                            class="bg-[#073B3A] text-slate-100"
                                            :style="{
                                                border: `1px solid ${editingCategory.color}`,
                                                borderRadius: `10px`
                                            }"
                                        >
                                            <v-card-title>
                                                <span
                                                    v-if="editingCategory?.id === undefined"
                                                    class="text-h5"
                                                    >Add</span
                                                >
                                                <span v-else class="text-h5">Edit</span>
                                            </v-card-title>
                                            <v-card-text>
                                                <v-container>
                                                    <v-row>
                                                        <v-col md="6" sm="12">
                                                            <v-col cols="12" sm="12">
                                                                <v-text-field
                                                                    v-model="editingCategory.name"
                                                                    label="Category Name"
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col cols="12" sm="12" class="h-20">
                                                                <v-btn
                                                                    class="w-full text-center text-xl"
                                                                    :style="{
                                                                        backgroundColor: `${editingCategory.color !== undefined ? editingCategory.color : 'darkcyan'}`
                                                                    }"
                                                                    type="button"
                                                                    @click="changeShowColorPicker"
                                                                >
                                                                    Pick category color
                                                                </v-btn>
                                                                <v-dialog v-model="showColorPicker">
                                                                    <v-color-picker
                                                                        class="m-auto"
                                                                        v-model="
                                                                            editingCategory.color
                                                                        "
                                                                        hide-inputs
                                                                        show-swatches
                                                                    ></v-color-picker>
                                                                    <v-btn
                                                                        class="text-base float-right m-auto w-10"
                                                                        color="success"
                                                                        variant="text"
                                                                        @click="
                                                                            changeShowColorPicker
                                                                        "
                                                                    >
                                                                        Pick
                                                                    </v-btn>
                                                                </v-dialog>
                                                            </v-col>
                                                            <v-col
                                                                cols="12"
                                                                sm="12"
                                                                :class="
                                                                    editingCategory.isExpense === 1
                                                                        ? 'text-red'
                                                                        : editingCategory.isExpense ===
                                                                            0
                                                                          ? 'text-green'
                                                                          : 'text-slate'
                                                                "
                                                            >
                                                                <v-radio-group
                                                                    id="expenseIncomeRadio"
                                                                    v-model="
                                                                        editingCategory.isExpense
                                                                    "
                                                                    v-on:input="
                                                                        $emit('input', $event)
                                                                    "
                                                                    inline
                                                                >
                                                                    <v-radio
                                                                        :class="
                                                                            editingCategory.isExpense ===
                                                                            0
                                                                                ? 'pl-2 pr-4 border-2 mr-2 border-green-500 rounded-lg'
                                                                                : 'pl-2 pr-4 border-2 mr-2 border-red-500 rounded-lg'
                                                                        "
                                                                        selected
                                                                        :value="1"
                                                                        label="Expense"
                                                                    ></v-radio>
                                                                    <v-radio
                                                                        :class="
                                                                            editingCategory.isExpense ===
                                                                            0
                                                                                ? 'pl-2 pr-4 border-2 mr-2 border-green-500 rounded-lg'
                                                                                : 'pl-2 pr-4 border-2 mr-2 border-red-500 rounded-lg'
                                                                        "
                                                                        :value="0"
                                                                        label="Income"
                                                                    ></v-radio>
                                                                </v-radio-group>
                                                            </v-col>
                                                            <v-col
                                                                cols="12"
                                                                sm="12"
                                                                :class="
                                                                    editingCategory.isWants === 1
                                                                        ? 'text-red'
                                                                        : editingCategory.isWants ===
                                                                            0
                                                                          ? 'text-green'
                                                                          : 'text-slate'
                                                                "
                                                                v-if="
                                                                    editingCategory.isExpense === 1
                                                                "
                                                            >
                                                                <v-radio-group
                                                                    id="wantsNeedsRadio"
                                                                    v-model="
                                                                        editingCategory.isWants
                                                                    "
                                                                    v-on:input="
                                                                        $emit('input', $event)
                                                                    "
                                                                    inline
                                                                >
                                                                    <v-radio
                                                                        :class="
                                                                            editingCategory.isWants ===
                                                                            0
                                                                                ? 'pl-2 pr-4 mb-2 border-2 mr-2 border-green-500 rounded-lg'
                                                                                : 'pl-2 pr-4 mb-2 border-2 mr-2 border-red-500 rounded-lg'
                                                                        "
                                                                        selected
                                                                        :value="null"
                                                                        label="Not specified"
                                                                    ></v-radio>
                                                                    <v-radio
                                                                        :class="
                                                                            editingCategory.isWants ===
                                                                            0
                                                                                ? 'pl-2 pr-4 mb-2 border-2 mr-2 border-green-500 rounded-lg'
                                                                                : 'pl-2 pr-4 mb-2 border-2 mr-2 border-red-500 rounded-lg'
                                                                        "
                                                                        :value="1"
                                                                        label="Wants"
                                                                    ></v-radio>
                                                                    <v-radio
                                                                        :class="
                                                                            editingCategory.isWants ===
                                                                            0
                                                                                ? 'pl-2 pr-4 mb-2 border-2 mr-2 border-green-500 rounded-lg'
                                                                                : 'pl-2 pr-4 mb-2 border-2 mr-2 border-red-500 rounded-lg'
                                                                        "
                                                                        :value="0"
                                                                        label="Needs"
                                                                    ></v-radio>
                                                                </v-radio-group>
                                                            </v-col>
                                                        </v-col>
                                                        <v-col sm="12" md="6">
                                                            <v-col sm="12">
                                                                <v-text-field
                                                                    v-model="addingKeyword"
                                                                    label="Add new keyword"
                                                                ></v-text-field>
                                                            </v-col>
                                                            <v-col sm="3" class="mb-4">
                                                                <v-btn
                                                                    class="bg-cyan-700"
                                                                    @click="addKeywordForCategory"
                                                                    >Add
                                                                </v-btn>
                                                            </v-col>
                                                            <v-col cols="12" sm="12">
                                                                <div
                                                                    class="h-96 divide-y overflow-y-scroll overflow-x-hidden"
                                                                >
                                                                    Keywords for category:
                                                                    <div
                                                                        v-for="(
                                                                            keyword, index
                                                                        ) in editingCategory.keywords"
                                                                        :key="index"
                                                                    >
                                                                        <v-row class="mt-2">
                                                                            <v-col sm="10">
                                                                                <v-text-field
                                                                                    width="20"
                                                                                    density="compact"
                                                                                    v-model="
                                                                                        keyword.value
                                                                                    "
                                                                                >
                                                                                </v-text-field>
                                                                            </v-col>
                                                                            <v-col sm="2">
                                                                                <v-icon
                                                                                    class="float-left mt-2"
                                                                                    size="small"
                                                                                    @click="
                                                                                        deleteKeyword(
                                                                                            keyword
                                                                                        )
                                                                                    "
                                                                                >
                                                                                    delete
                                                                                </v-icon>
                                                                            </v-col>
                                                                        </v-row>
                                                                    </div>
                                                                </div>
                                                            </v-col>
                                                        </v-col>
                                                    </v-row>
                                                </v-container>
                                            </v-card-text>

                                            <v-card-actions>
                                                <v-row>
                                                    <v-col sm="3">
                                                        <v-btn
                                                            class="float-left text-base ml-2 mb-2"
                                                            color="error"
                                                            variant="text"
                                                            @click="close"
                                                        >
                                                            Cancel
                                                        </v-btn>
                                                    </v-col>
                                                    <v-col sm="6"></v-col>
                                                    <v-col sm="3">
                                                        <v-btn
                                                            class="text-base float-right mr-2 mb-2"
                                                            color="success"
                                                            variant="text"
                                                            @click="save"
                                                        >
                                                            Save
                                                        </v-btn>
                                                    </v-col>
                                                </v-row>
                                            </v-card-actions>
                                        </v-card>
                                    </v-dialog>
                                    <v-dialog v-model="dialogDelete" max-width="600px">
                                        <v-card
                                            class="bg-[#073B3A] text-slate-100"
                                            min-height="120px"
                                        >
                                            <v-card-title class="text-h5 text-center pb-5"
                                                >Are you sure you want to delete this item?
                                            </v-card-title>
                                            <v-card-actions>
                                                <v-spacer></v-spacer>
                                                <v-btn
                                                    class="text-base"
                                                    color="error"
                                                    variant="text"
                                                    @click="closeDelete"
                                                    >Cancel
                                                </v-btn>
                                                <v-btn
                                                    class="text-base"
                                                    color="success"
                                                    variant="text"
                                                    @click="deleteCategoryConfirm"
                                                    >OK
                                                </v-btn>
                                                <v-spacer></v-spacer>
                                            </v-card-actions>
                                        </v-card>
                                    </v-dialog>
                                </template>
                                <template v-slot:[`item.actions`]="{ item }">
                                    <v-icon
                                        class="me-2"
                                        color="#DAFFEF"
                                        size="small"
                                        @click="editCategory(item)"
                                    >
                                        edit
                                    </v-icon>
                                    <v-icon size="small" color="red" @click="deleteCategory(item)">
                                        delete
                                    </v-icon>
                                </template>
                            </VDataTable>
                            <p v-else-if="errorMessage">{{ errorMessage }}</p>
                            <p v-else>Loading..</p>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>
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

.v-data-table {
    width: 100%;
    table-layout: fixed;
}

.v-data-table :deep(table) {
    width: 100%;
    table-layout: fixed;
}

.v-data-table :deep(th),
.v-data-table :deep(td) {
    width: auto;
    white-space: normal;
    overflow-wrap: break-word;
}
</style>
