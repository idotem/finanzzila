<script setup lang="ts">
import CategoryService from '@/service/CategoryService';
import TransactionService from '@/service/TransactionService';
import {
    VExpansionPanel, VExpansionPanels, VFadeTransition, VExpansionPanelTitle,  VExpansionPanelText,
    VContainer, VRow, VCol, VIcon, VDialog,
    VSpacer, VTextField, VBtn,
    VCard, VCardTitle, VCardText, VCardActions
} from 'vuetify/components';
import { ref, onMounted } from 'vue';
import type { Category } from '../model/Category';

type TransactionTableProps = {
    categoryId?: number | undefined,
}

const props = defineProps<TransactionTableProps>();

const errorMessage = ref('');
const categories = ref<Category[]>([])
const dialog = ref<boolean>(false);
const dialogDelete = ref<boolean>(false);
const editingItem = ref<any>({})
const deletingItem = ref<any>({});


const categoriesHeaders = [
    { title: 'Name', key: 'name' },
    { title: 'Keywords', key: 'keywords' },
    { title: 'Actions', key: 'actions', sortable: false },
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
    })
}

function editItem(item: any) {
    editingItem.value = {...item, category: item.category.id};
    dialog.value = true
}

function deleteItem(item: any) {
    deletingItem.value = item;
    dialogDelete.value = true
}

function deleteItemConfirm() {
    TransactionService.delete(deletingItem.value.id)
        .then(() => {
            fetchCategories();
        })
        .catch((err) => {
            alert(`Unsuccesfull: ${err}`)
        })

    closeDelete()
}

function close() {
    dialog.value = false
    editingItem.value = Object.assign({}, {})
}

function closeDelete() {
    dialogDelete.value = false;
    deletingItem.value = Object.assign({}, {});
}

function save() {
    const itemToSave = editingItem.value;
    if(!itemToSave.nameOfPlace || !itemToSave.category || !itemToSave.amount || !itemToSave.date){
        console.error("All fields for transaction are required.", itemToSave)
        return;
    }
    if(editingItem.value.id !== undefined){
        TransactionService.update(editingItem.value.id, itemToSave).then((res) => {
            console.info("Successfully updated transaction ", res);
            fetchCategories();
            close();
        }).catch((err) => {
            console.error("Unsccessfully updated transaction ", err);
        })
    } else {
        TransactionService.add(itemToSave).then((res) => {
            console.info("Successfully added transaction ", res);
            fetchCategories();
            close();
        }).catch((err) => {
            console.error("Unsccessfully updated transaction ", err);
        })
    }
}

</script>

<template>
    <main>
        <h1 class="text-3xl text-black mb-4">Configuration</h1>
        <v-container>
          <v-row>
            <v-col cols="6">
              <v-btn prepend-icon="add" color="rgb(59 7 100)" dark @click="dialog = true" >
                <span class="text-white">Add New Category</span> 
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col md="6" sm="12">
              <v-expansion-panels>
                <v-expansion-panel v-for="category in categories" :key="category.id">
                  <v-expansion-panel-title>
                    <template v-slot:default="{ expanded }">
                      <v-row no-gutters>
                        <v-col class="d-flex justify-start" cols="4">
                          {{ category.name }}
                        </v-col>
                        <v-col v-if="expanded" class=""></v-col>
                      </v-row>
                    </template>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col md="6" sm="12">
                        <v-btn>Add Keyword</v-btn>
                      </v-col>
                      <v-col md="6" sm="12" align="end">
                        <v-icon class="me-2" size="small" @click="editItem(category)">
                          edit
                        </v-icon>
                        <v-icon size="small" @click="deleteItem(category)">
                          delete
                        </v-icon>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                      <span v-for="keyword in category.keywords" :key="keyword">{{ keyword }}</span> 
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
            <v-col md="6" sm="12">
            </v-col>
          </v-row>
        </v-container>


        <!-- <v-container>
            <v-row class="bg-cyan-950 text-slate-200 p-4 pb-10 rounded-xl shadow-black shadow-lg mb-1">
                <v-col cols="12" sm="12" md="3" class="justify-bottom">
                    <v-btn prepend-icon="add" color="rgb(59 7 100)" dark @click="dialog = true" >
                        <span class="text-white">Add New Category</span> 
                    </v-btn>
                </v-col>
                <v-col cols="12">
                    <VDataTable hover color="black" class="bg-cyan-950 text-slate-200 text-xl" v-if="categories"
                        :headers="categoriesHeaders" :items="categories">
                        <template v-slot:top>
                                <v-dialog v-model="dialog" max-width="600px">
                                    <v-card>
                                        <v-card-title>
                                            <span v-if="editingItem.date === undefined" class="text-h5">Add</span>
                                            <span v-else class="text-h5">Edit</span>
                                        </v-card-title>
                                        <v-card-text>
                                            <v-container>
                                                <v-row>
                                                    <v-col cols="12" sm="12" align-self="center">
                                                        <label>Date</label>
                                                        <VueDatePicker v-model="editingItem.date" label="Date"
                                                            auto-apply dark :enable-time-picker="false" required>
                                                        </VueDatePicker>
                                                    </v-col>
                                                    <v-col cols="12" sm="12">
                                                        <label>Category</label>
                                                        <select
                                                            class="w-full h-9 p-2 rounded-sm bg-[#212121] text-slate-300"
                                                            name="filterCategory" v-model="editingItem.category">
                                                            <option :value="undefined">Clear Choice</option>
                                                            <option v-for="category in categories" :value="category.id"
                                                                v-bind:key="category.id">
                                                                {{ category.name }}
                                                            </option>
                                                        </select>
                                                    </v-col>
                                                    <v-col cols="12" sm="12">
                                                        <v-text-field v-model="editingItem.nameOfPlace"
                                                            label="Company name"></v-text-field>
                                                    </v-col>
                                                    <v-col cols="12" sm="12">
                                                        <v-text-field type="number" v-model="editingItem.amount"
                                                            label="Amount (MKD)"></v-text-field>
                                                    </v-col>
                                                </v-row>
                                            </v-container>
                                        </v-card-text>

                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="blue-darken-1" variant="text" @click="close">
                                                Cancel
                                            </v-btn>
                                            <v-btn color="blue-darken-1" variant="text" @click="save">
                                                Save
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                                <v-dialog v-model="dialogDelete" max-width="500px">
                                    <v-card>
                                        <v-card-title class="text-h5">Are you sure you want to delete this
                                            item?</v-card-title>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="blue-darken-1" variant="text"
                                                @click="closeDelete">Cancel</v-btn>
                                            <v-btn color="blue-darken-1" variant="text"
                                                @click="deleteItemConfirm">OK</v-btn>
                                            <v-spacer></v-spacer>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                        </template>
                        <template v-slot:[`item.actions`]="{ item }">
                            <v-icon class="me-2" size="small" @click="editItem(item)">
                                edit
                            </v-icon>
                            <v-icon size="small" @click="deleteItem(item)">
                                delete
                            </v-icon>
                        </template>
                    </VDataTable>
                    <p v-else-if="errorMessage">{{ errorMessage }}</p>
                    <p v-else>Loading..</p>
                </v-col>
            </v-row>
        </v-container> -->
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
