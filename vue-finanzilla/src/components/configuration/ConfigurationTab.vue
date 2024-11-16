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
    VDataTable,
    VRadioGroup,
    VRadio,
    VColorPicker
} from 'vuetify/components';
import { ref, onMounted, watch } from 'vue';
import { Category } from '../model/Category';
import CategoryDto from '../model/CategoryDto';
import KeywordDto from '../model/KeywordDto';

const errorMessage = ref('');
const categories = ref<Category[]>([]);
const dialog = ref<boolean>(false);
const dialogDelete = ref<boolean>(false);
const editingCategory = ref<Category>(new Category(undefined, '', [], undefined, undefined));
const addingKeyword = ref<string>('');
const deletingItem = ref<Category | undefined>(undefined);
const showColorPicker = ref<boolean>(false);

const categoriesHeaders = [
    { title: 'Name', key: 'name' },
    { title: 'Keywords', key: 'keywords' },
    { title: 'Wants/Needs', key: 'isWants' },
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

watch(dialog, () => {
    if (!dialog.value) {
        editingCategory.value = new Category(undefined, '', [], undefined, undefined);
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
    editingCategory.value = new CategoryDto(undefined, '', [], undefined, undefined);
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
    showColorPicker.value = showColorPicker.value ? false : true;
}
</script>

<template>
    <main>
        <h1 class="text-3xl text-black mb-4">Configuration</h1>
        <v-container>
            <v-row>
                <v-col sm="12">
                    <v-row
                        class="bg-cyan-950 text-slate-200 p-4 m-2 pb-10 rounded-xl shadow-black shadow-lg mb-1"
                    >
                        <v-col sm="12">
                            <h1 class="text-lg text-white">Configure categories and keywords</h1>
                        </v-col>
                        <v-col sm="12" class="justify-bottom">
                            <v-btn
                                prepend-icon="add"
                                icon-color="#ffffff"
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
                                class="bg-cyan-950 text-slate-200 text-base"
                                v-if="categories"
                                :headers="categoriesHeaders"
                                :items="categories"
                                height="49vh"
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
                                            <br />
                                            <!-- <span v-if="index != item.keywords.length - 1">{{
                                            '- '
                                        }}</span> -->
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

                                <template v-slot:top>
                                    <v-dialog v-model="dialog" max-width="600px">
                                        <v-card
                                            class="bg-[#011936] text-slate-100 overflow-auto"
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
                                                                    v-model="editingCategory.color"
                                                                    hide-inputs
                                                                    show-swatches
                                                                ></v-color-picker>
                                                                <v-btn
                                                                    class="text-base float-right m-auto w-10"
                                                                    color="success"
                                                                    variant="text"
                                                                    @click="changeShowColorPicker"
                                                                >
                                                                    Pick
                                                                </v-btn>
                                                            </v-dialog>
                                                        </v-col>
                                                        <v-col cols="12" sm="12">
                                                            <label for="wantsneedsradio"
                                                                >Is this category in wants or
                                                                needs?</label
                                                            >
                                                            <v-radio-group
                                                                id="wantsneedsradio"
                                                                v-model="editingCategory.isWants"
                                                                v-on:input="$emit('input', $event)"
                                                            >
                                                                <v-radio
                                                                    value="1"
                                                                    label="Wants"
                                                                ></v-radio>
                                                                <v-radio
                                                                    value="0"
                                                                    label="Needs"
                                                                ></v-radio>
                                                            </v-radio-group>
                                                        </v-col>
                                                        <v-col sm="10">
                                                            <v-text-field
                                                                v-model="addingKeyword"
                                                                label="Add new keyword"
                                                            ></v-text-field>
                                                        </v-col>
                                                        <v-col sm="2" class="mt-3">
                                                            <v-btn @click="addKeywordForCategory"
                                                                >Add</v-btn
                                                            >
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
                                            class="bg-[#011936] text-slate-100"
                                            min-height="120px"
                                        >
                                            <v-card-title class="text-h5 text-center pb-5"
                                                >Are you sure you want to delete this
                                                item?</v-card-title
                                            >
                                            <v-card-actions>
                                                <v-spacer></v-spacer>
                                                <v-btn
                                                    class="text-base"
                                                    color="error"
                                                    variant="text"
                                                    @click="closeDelete"
                                                    >Cancel</v-btn
                                                >
                                                <v-btn
                                                    class="text-base"
                                                    color="success"
                                                    variant="text"
                                                    @click="deleteCategoryConfirm"
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
                                        color="cyan"
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
</style>
