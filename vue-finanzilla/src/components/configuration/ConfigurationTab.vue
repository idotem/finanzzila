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
    VSelect,
    VChip
} from 'vuetify/components';
import { onMounted, ref, watch, computed } from 'vue';
import { Category } from '../model/Category';
import CategoryDto from '../model/CategoryDto';
import KeywordDto from '../model/KeywordDto';
import { CategoryType } from '../model/CategoryType';

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
const loading = ref<boolean>(false);

const filters = ref({
    name: '',
    keywords: '',
    isWants: null,
    type: null
});

const categoriesHeaders = [
    {
        title: 'Name',
        key: 'name',
        sortable: true,
        width: '20%',
        headerProps: { class: 'text-subtitle-1 font-weight-bold' }
    },
    {
        title: 'Keywords',
        key: 'keywords',
        sortable: true,
        width: '40%',
        headerProps: { class: 'text-subtitle-1 font-weight-bold' }
    },
    {
        title: 'Wants/Needs',
        key: 'isWants',
        sortable: true,
        width: '15%',
        headerProps: { class: 'text-subtitle-1 font-weight-bold' }
    },
    {
        title: 'Type',
        key: 'type',
        sortable: true,
        width: '15%',
        headerProps: { class: 'text-subtitle-1 font-weight-bold' }
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
        if (filters.value.type !== null && item.type !== filters.value.type)
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
    if (!dialog.value) {
        editingCategory.value = new Category(undefined, '', [], undefined, undefined, undefined);
    }
});

const fetchCategories = async () => {
    loading.value = true;
    CategoryService.getAllCategories().then((trC: Category[]) => {
        categories.value = trC;
        loading.value = false;
    }).catch(() => {
        loading.value = false;
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
        loading.value = true;
        CategoryService.delete(deletingItem.value?.id)
            .then(() => {
                fetchCategories();
                loading.value = false;
            })
            .catch((err) => {
                loading.value = false;
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
        return;
    }
    editingCategory.value.keywords.push(new KeywordDto(undefined, addingKeyword.value));
    addingKeyword.value = '';
}

function save() {
    const itemToSave = editingCategory.value;
    if (!itemToSave.name) {
        alert('Category must have a name.');
        return;
    }
    loading.value = true;
    if (itemToSave.id !== undefined) {
        CategoryService.update(itemToSave.id, itemToSave)
            .then(() => {
                fetchCategories();
                close();
                loading.value = false;
            })
            .catch(() => {
                loading.value = false;
                alert('Unsuccessfully updated category');
            });
    } else {
        CategoryService.create(itemToSave)
            .then(() => {
                fetchCategories();
                close();
                loading.value = false;
            })
            .catch(() => {
                loading.value = false;
                alert('Unsuccessfully added category');
            });
    }
}

function changeShowColorPicker(): void {
    showColorPicker.value = !showColorPicker.value;
}
</script>

<template>
    <main class="py-6 px-4">
        <v-container fluid class="pa-0 max-w-[1920px] mx-auto">
            <v-card color="surface" elevation="2" class="rounded-xl mt-4 pa-6">
                <!-- Filters Section -->
                <v-row align="center" class="mb-4" dense>
                    <v-col cols="12" sm="6" md="3">
                        <v-text-field
                            v-model="filters.name"
                            label="Filter by Name"
                            density="compact"
                            color="primary"
                            variant="outlined"
                            hide-details
                            prepend-inner-icon="search"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                        <v-text-field
                            v-model="filters.keywords"
                            label="Filter by Keyword"
                            density="compact"
                            color="primary"
                            variant="outlined"
                            hide-details
                            prepend-inner-icon="tag"
                        ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="2">
                        <v-select
                            v-model="filters.isWants"
                            label="Wants/Needs"
                            density="compact"
                            :items="[
                                { title: 'All', value: null },
                                { title: 'Wants', value: 1 },
                                { title: 'Needs', value: 0 }
                            ]"
                            color="primary"
                            variant="outlined"
                            hide-details
                        ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6" md="2">
                        <v-select
                            v-model="filters.type"
                            label="Type"
                            density="compact"
                            :items="[
                                { title: 'All', value: null },
                                { title: 'Expense', value: CategoryType.EXPENSE },
                                { title: 'Income', value: CategoryType.INCOME },
                                { title: 'Saving Account', value: CategoryType.SAVING_ACCOUNT }
                            ]"
                            color="primary"
                            variant="outlined"
                            hide-details
                        ></v-select>
                    </v-col>
                    <v-col cols="12" md="2" class="text-right">
                        <v-btn
                            prepend-icon="add"
                            color="primary"
                            variant="elevated"
                            @click="dialog = true"
                            height="40"
                            elevation="2"
                            class="font-weight-bold"
                        >
                            Add Category
                        </v-btn>
                    </v-col>
                </v-row>

                <!-- Data Table Section -->
                <v-row>
                    <v-col cols="12">
                        <v-data-table
                            hover
                            density="compact"
                            v-if="categories"
                            :headers="categoriesHeaders"
                            :items="filteredCategories"
                            :loading="loading"
                            class="elevation-0 bg-transparent rounded-lg"
                        >
                            <template v-slot:item.name="{ item }">
                                <v-chip
                                    :color="item.color || 'primary'"
                                    variant="outlined"
                                    class="font-weight-bold"
                                    size="small"
                                >
                                    {{ item.name }}
                                </v-chip>
                            </template>

                            <template v-slot:item.keywords="{ item }">
                                <div class="d-flex flex-wrap gap-1 pa-1">
                                    <v-chip
                                        v-for="(keyword, index) in item.keywords"
                                        :key="index"
                                        size="x-small"
                                        variant="tonal"
                                        :color="item.color || 'primary'"
                                        class="mr-1 mb-1"
                                    >
                                        {{ keyword.value }}
                                    </v-chip>
                                </div>
                            </template>

                            <template v-slot:item.isWants="{ item }">
                                <span v-if="item.isWants === undefined || item.isWants === null" class="text-medium-emphasis text-body-2">
                                    Not specified
                                </span>
                                <v-chip v-else-if="item.isWants === 1" size="small" color="warning" variant="tonal">Wants</v-chip>
                                <v-chip v-else size="small" color="info" variant="tonal">Needs</v-chip>
                            </template>

                            <template v-slot:item.type="{ item }">
                                <v-chip v-if="item.type === CategoryType.EXPENSE" size="small" color="error" variant="flat">Expense</v-chip>
                                <v-chip v-else-if="item.type === CategoryType.SAVING_ACCOUNT" size="small" color="purple" variant="flat">Saving Account</v-chip>
                                <v-chip v-else size="small" color="success" variant="flat">Income</v-chip>
                            </template>

                            <template v-slot:top>
                                <!-- Dialog Add/Edit -->
                                <v-dialog v-model="dialog" max-width="700px">
                                    <v-card color="surface" elevation="6" class="rounded-lg">
                                        <v-card-title class="pa-4 border-b">
                                            <span class="text-h5 font-weight-bold">{{ editingCategory?.id === undefined ? 'Add Category' : 'Edit Category' }}</span>
                                        </v-card-title>
                                        
                                        <v-card-text class="pa-6">
                                            <v-row>
                                                <!-- Left Col: Details -->
                                                <v-col cols="12" md="6">
                                                    <v-text-field
                                                        v-model="editingCategory.name"
                                                        label="Category Name"
                                                        variant="outlined"
                                                        color="primary"
                                                        class="mb-2"
                                                        hide-details="auto"
                                                    ></v-text-field>

                                                    <div class="mb-4">
                                                        <v-btn
                                                            class="w-100 text-none"
                                                            :color="editingCategory.color || 'primary'"
                                                            variant="tonal"
                                                            @click="changeShowColorPicker"
                                                        >
                                                            Pick Category Color
                                                        </v-btn>
                                                        <v-dialog v-model="showColorPicker" max-width="320">
                                                            <v-card class="rounded-lg">
                                                                <v-card-text class="pa-4 d-flex justify-center">
                                                                    <v-color-picker
                                                                        v-model="editingCategory.color"
                                                                        hide-inputs
                                                                        show-swatches
                                                                        elevation="0"
                                                                    ></v-color-picker>
                                                                </v-card-text>
                                                                <v-card-actions class="pa-2 pt-0">
                                                                    <v-spacer></v-spacer>
                                                                    <v-btn color="primary" variant="text" @click="changeShowColorPicker">Done</v-btn>
                                                                </v-card-actions>
                                                            </v-card>
                                                        </v-dialog>
                                                    </div>

                                                    <div class="mb-2">
                                                        <label class="text-body-2 font-weight-medium mb-1 d-block text-medium-emphasis">Transaction Type</label>
                                                        <v-radio-group v-model="editingCategory.type" inline hide-details>
                                                            <v-radio :value="CategoryType.EXPENSE" label="Expense" color="error"></v-radio>
                                                            <v-radio :value="CategoryType.INCOME" label="Income" color="success"></v-radio>
                                                            <v-radio :value="CategoryType.SAVING_ACCOUNT" label="Saving Account" color="purple"></v-radio>
                                                        </v-radio-group>
                                                    </div>

                                                    <div v-if="editingCategory.type === CategoryType.EXPENSE">
                                                        <label class="text-body-2 font-weight-medium mb-1 d-block text-medium-emphasis">Necessity</label>
                                                        <v-radio-group v-model="editingCategory.isWants" inline hide-details>
                                                            <v-radio :value="null" label="Not specified" color="grey"></v-radio>
                                                            <v-radio :value="1" label="Wants" color="warning"></v-radio>
                                                            <v-radio :value="0" label="Needs" color="info"></v-radio>
                                                        </v-radio-group>
                                                    </div>
                                                </v-col>

                                                <!-- Right Col: Keywords -->
                                                <v-col cols="12" md="6">
                                                    <div class="d-flex align-center gap-2 mb-4">
                                                        <v-text-field
                                                            v-model="addingKeyword"
                                                            label="Add new keyword"
                                                            variant="outlined"
                                                            color="primary"
                                                            hide-details
                                                            density="compact"
                                                            @keydown.enter="addKeywordForCategory"
                                                        ></v-text-field>
                                                        <v-btn color="primary" variant="elevated" @click="addKeywordForCategory" height="40">
                                                            Add
                                                        </v-btn>
                                                    </div>

                                                    <v-card variant="outlined" class="rounded-md border-theme-divider">
                                                        <v-card-subtitle class="pa-3 border-b border-theme-divider font-weight-bold">
                                                            Keywords List
                                                        </v-card-subtitle>
                                                        <div class="overflow-y-auto pa-2" style="max-height: 200px;">
                                                            <div v-if="editingCategory.keywords.length === 0" class="text-center py-4 text-medium-emphasis text-body-2">
                                                                No keywords added.
                                                            </div>
                                                            <div
                                                                v-for="(keyword, index) in editingCategory.keywords"
                                                                :key="index"
                                                                class="d-flex align-center justify-space-between mb-2 pa-1 px-2 rounded hover-bg"
                                                            >
                                                                <v-text-field
                                                                    v-model="keyword.value"
                                                                    density="compact"
                                                                    variant="plain"
                                                                    hide-details
                                                                    class="flex-grow-1 mr-2 keyword-input"
                                                                ></v-text-field>
                                                                <v-btn icon="close" size="x-small" color="error" variant="text" @click="deleteKeyword(keyword)"></v-btn>
                                                            </div>
                                                        </div>
                                                    </v-card>
                                                </v-col>
                                            </v-row>
                                        </v-card-text>

                                        <v-card-actions class="pa-4 border-t bg-surface-light">
                                            <v-btn class="text-none font-weight-medium" color="medium-emphasis" variant="text" @click="close">
                                                Cancel
                                            </v-btn>
                                            <v-spacer></v-spacer>
                                            <v-btn class="text-none px-6 font-weight-bold" color="primary" variant="elevated" @click="save">
                                                Save
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>

                                <!-- Dialog Delete -->
                                <v-dialog v-model="dialogDelete" max-width="400px">
                                    <v-card color="surface" class="pa-6 text-center rounded-lg" elevation="6">
                                        <v-icon size="64" color="error" class="mx-auto mb-4">delete_forever</v-icon>
                                        <v-card-title class="text-h6 font-weight-bold mb-2 pa-0 text-wrap">
                                            Delete Category?
                                        </v-card-title>
                                        <v-card-text class="text-body-2 text-medium-emphasis pa-0 mb-6">
                                            This action is permanent and cannot be undone.
                                        </v-card-text>
                                        <v-card-actions class="pa-0 justify-center">
                                            <v-btn class="text-none px-4" color="medium-emphasis" variant="text" @click="closeDelete">Cancel</v-btn>
                                            <v-btn class="text-none px-6" color="error" variant="elevated" @click="deleteCategoryConfirm">Delete</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                            </template>

                            <template v-slot:[`item.actions`]="{ item }">
                                <div class="d-flex align-center">
                                    <v-btn icon="edit" variant="text" size="small" color="info" class="mr-2" @click="editCategory(item)"></v-btn>
                                    <v-btn icon="delete" variant="text" size="small" color="error" @click="deleteCategory(item)"></v-btn>
                                </div>
                            </template>
                        </v-data-table>

                        <div v-else-if="errorMessage" class="text-center py-8 text-error">
                            <v-icon size="48" class="mb-4">error_outline</v-icon>
                            <p class="text-h6">{{ errorMessage }}</p>
                        </div>
                    </v-col>
                </v-row>
            </v-card>
        </v-container>
    </main>
</template>

<style scoped>
.border-theme-divider {
    border-color: rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.hover-bg:hover {
    background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.keyword-input :deep(input) {
    padding-top: 0;
    padding-bottom: 0;
}
</style>
