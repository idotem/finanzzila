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

const errorMessage = ref('');
const categories = ref<Category[]>([])
const dialog = ref<boolean>(false);
const dialogDelete = ref<boolean>(false);
const editingItem = ref<any>({})
const addingKeyword = ref<string>('')
const deletingItem = ref<any>({});

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
        console.log(categories)
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

function deleteKeyword(keyword: any) {
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

function addKeywordForCategory (category: Category){
    CategoryService.addKeywordForCategory(category.id, addingKeyword.value)
        .then(() => {
            fetchCategories();
        })
        .catch((err) => {
            console.log('Adding keyword for category ', category.name, ' failed with err: ', err);
        });
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
                <h1 class="text-black">Categories and keywords</h1>
                <v-btn prepend-icon="add" color="rgb(59 7 100)" dark @click="dialog = true" >
                    <span class="text-white">Add New Category</span> 
                </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col md="6" sm="12">
              <v-expansion-panels multiple>
                <v-expansion-panel bg-color="#083344" v-for="category in categories" :key="category.id">
                  <v-expansion-panel-title>
                    <template v-slot:default="{ expanded }">
                      <v-row no-gutters>
                        <v-col class="justify-start" cols="6">
                          {{ category.name }}
                        </v-col>
                        <v-col v-if="expanded" class="float-right" cols="6">
                            
                        </v-col>
                      </v-row>
                    </template>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row no-gutters>
                        <v-col sm="12" md="4" align-self="center">
                            <v-text-field placeholder="Keyword" v-model="addingKeyword"></v-text-field>
                        </v-col>
                        <v-col sm="12" md="8" align-self="center">
                            <v-btn class="ml-5" @click="addKeywordForCategory(category)">Add Keyword</v-btn>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <div class="inline-block m-1 p-1 border-2 border-black" v-for="keyword in category.keywords" :key="keyword">{{ keyword }}
                                <v-icon class="float-right" size="small" @click="deleteKeyword(category)">
                                    delete
                                </v-icon>
                            </div> 
                      </v-col>
                    </v-row>
                    <v-row>
                        <v-col sm="12">
                            <v-icon class="float-right ml-4" size="small" @click="editItem(category)">
                                edit
                            </v-icon>
                            <v-icon class="float-right" size="small" @click="deleteItem(category)">
                                delete
                            </v-icon>
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
