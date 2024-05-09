<script setup lang="ts">
import CategoryService from '@/service/CategoryService';
import {
    VContainer,
    VRow,
    VCol,
    VIcon,
    VDialog,
    VSpacer,
    VTextField,
    VBtn,
    VCard,
    VCardTitle,
    VCardText,
    VCardActions,
    VDataTable
} from 'vuetify/components';
import { ref, onMounted } from 'vue';
import type { Category } from '../model/Category';
import CategoryDto from '../model/CategoryDto';
import CreateKeywordDto from '../model/CreateKeywordDto';

const errorMessage = ref('');
const categories = ref<Category[]>([]);
const dialog = ref<boolean>(false);
const dialogDelete = ref<boolean>(false);
const editingItem = ref<CategoryDto>(new CategoryDto(undefined, '', []));
const deletingItem = ref<Category | undefined>(undefined);

const categoriesHeaders = [
    { title: 'Name', key: 'name' },
    { title: 'Keywords', key: 'keywords' },
    { title: 'Actions', key: 'actions', sortable: false }
];

onMounted(async () => {
    try {
        await fetchCategories();
    } catch (error) {
        errorMessage.value = 'Error fetching data';
        console.error('Error fetching data:', error);
    }
});

const fetchCategories = async () => {
    CategoryService.getAllCategories().then((trC: Category[]) => {
        categories.value = trC;
        console.log(categories);
    });
};

function editItem(item: any) {
    editingItem.value = {
        ...item,
        keywords: item.keywords.map((k: string) => new CreateKeywordDto(k))
    };
    dialog.value = true;
}

function deleteItem(item: any) {
    deletingItem.value = item;
    dialogDelete.value = true;
}

function deleteKeyword(keyword: any) {}

function deleteItemConfirm() {
    if (deletingItem.value) {
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
    editingItem.value = new CategoryDto(undefined, '', []);
}

function closeDelete() {
    dialogDelete.value = false;
    deletingItem.value = undefined;
}

function addKeywordForCategory(category: Category) {}

function save() {
    const itemToSave = editingItem.value;
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
</script>

<template>
    <main>
        <h1 class="text-3xl text-black mb-4">Configuration</h1>
        <v-container>
            <v-row>
                <v-col md="6" sm="12">
                    <v-row
                        class="bg-cyan-950 text-slate-200 p-4 m-2 pb-10 rounded-xl shadow-black shadow-lg mb-1"
                    >
                        <v-col sm="12">
                            <h1 class="text-lg text-white">
                                Configure categories and keywords
                            </h1>
                        </v-col>
                        <v-col cols="12" sm="12" md="6" class="justify-bottom">
                            <v-btn
                                prepend-icon="add"
                                color="rgb(59 7 100)"
                                dark
                                @click="dialog = true"
                            >
                                <span class="text-white">Add New Category</span>
                            </v-btn>
                        </v-col>
                        <v-col cols="12">
                            <VDataTable
                                hover
                                color="black"
                                class="bg-cyan-950 text-slate-200 text-xl"
                                v-if="categories"
                                :headers="categoriesHeaders"
                                :items="categories"
                            >
                                <template v-slot:item.keywords="{ item }">
                                    <span
                                        v-for="(
                                            keyword, index
                                        ) in item.keywords"
                                        :key="index"
                                    >
                                        {{ keyword }}
                                        <span
                                            v-if="
                                                index !=
                                                item.keywords.length - 1
                                            "
                                        >
                                            ,
                                        </span>
                                    </span>
                                </template>
                                <template v-slot:top>
                                    <v-dialog
                                        v-model="dialog"
                                        max-width="600px"
                                    >
                                        <v-card>
                                            <v-card-title>
                                                <span
                                                    v-if="
                                                        editingItem?.name ===
                                                        undefined
                                                    "
                                                    class="text-h5"
                                                    >Add</span
                                                >
                                                <span v-else class="text-h5"
                                                    >Edit</span
                                                >
                                            </v-card-title>
                                            <v-card-text>
                                                <v-container>
                                                    <v-row>
                                                        <v-col
                                                            cols="12"
                                                            sm="12"
                                                        >
                                                            <v-text-field
                                                                v-model="
                                                                    editingItem.name
                                                                "
                                                                label="Category Name"
                                                            ></v-text-field>
                                                        </v-col>
                                                        <v-col
                                                            cols="12"
                                                            sm="12"
                                                        >
                                                            <div
                                                                class="h-96 overflow-scroll"
                                                            >
                                                                Keywords for
                                                                category:
                                                                <div
                                                                    v-for="(
                                                                        keyword,
                                                                        index
                                                                    ) in editingItem.keywords"
                                                                    :key="index"
                                                                >
                                                                    <v-text-field
                                                                        width="20"
                                                                        density="compact"
                                                                        v-model="
                                                                            keyword.value
                                                                        "
                                                                    >
                                                                    </v-text-field>
                                                                </div>
                                                            </div>
                                                        </v-col>
                                                    </v-row>
                                                </v-container>
                                            </v-card-text>

                                            <v-card-actions>
                                                <v-spacer></v-spacer>
                                                <v-btn
                                                    color="blue-darken-1"
                                                    variant="text"
                                                    @click="close"
                                                >
                                                    Cancel
                                                </v-btn>
                                                <v-btn
                                                    color="blue-darken-1"
                                                    variant="text"
                                                    @click="save"
                                                >
                                                    Save
                                                </v-btn>
                                            </v-card-actions>
                                        </v-card>
                                    </v-dialog>
                                    <v-dialog
                                        v-model="dialogDelete"
                                        max-width="500px"
                                    >
                                        <v-card>
                                            <v-card-title class="text-h5"
                                                >Are you sure you want to delete
                                                this item?</v-card-title
                                            >
                                            <v-card-actions>
                                                <v-spacer></v-spacer>
                                                <v-btn
                                                    color="blue-darken-1"
                                                    variant="text"
                                                    @click="closeDelete"
                                                    >Cancel</v-btn
                                                >
                                                <v-btn
                                                    color="blue-darken-1"
                                                    variant="text"
                                                    @click="deleteItemConfirm"
                                                    >OK</v-btn
                                                >
                                                <v-spacer></v-spacer>
                                            </v-card-actions>
                                        </v-card>
                                    </v-dialog>
                                </template>
                                <template v-slot:[`item.actions`]="{ item }">
                                    <v-icon
                                        class="me-2"
                                        size="small"
                                        @click="editItem(item)"
                                    >
                                        edit
                                    </v-icon>
                                    <v-icon
                                        size="small"
                                        @click="deleteItem(item)"
                                    >
                                        delete
                                    </v-icon>
                                </template>
                            </VDataTable>
                            <p v-else-if="errorMessage">{{ errorMessage }}</p>
                            <p v-else>Loading..</p>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col md="6" sm="12">
                    <v-row
                        class="bg-cyan-950 text-slate-200 m-2 p-4 pb-10 rounded-xl shadow-black shadow-lg mb-1"
                    >
                        <h1 class="text-lg text-white">Another config</h1>
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
</style>
