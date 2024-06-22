<script setup lang="ts">
import { VNavigationDrawer, VList, VListItem } from 'vuetify/components';
</script>

<template>
    <v-navigation-drawer app rail expand-on-hover color="#022754">
        <v-list density="comfortable" nav color="#1ABC9C" bg-color="#022754">
            <v-list-item prepend-icon="dashboard" to="/">
                <p class="text-slate-300 text-xl">Dashboard</p>
            </v-list-item>
            <v-list-item prepend-icon="paid" to="/transactions">
                <p class="text-slate-300 text-xl">Transactions</p>
            </v-list-item>
            <v-list-item prepend-icon="paid" to="/configuration">
                <p class="text-slate-300 text-xl">Config</p>
            </v-list-item>
            <v-list-item prepend-icon="information" to="/about">
                <p class="text-slate-300 text-xl">About</p>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<style scoped></style>
