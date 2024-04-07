<script setup lang="ts">
import { VNavigationDrawer, VList, VListItem } from 'vuetify/components';
</script>

<template>
    <v-navigation-drawer app rail expand-on-hover color='rgb(59 7 100)'>
        <v-list density="comfortable" nav class="bg-purple-950">
            <v-list-item prepend-icon="dashboard" to="/">
                <p class="text-slate-300 text-2xl">Dashboard</p>
            </v-list-item>
            <v-list-item prepend-icon="paid" to="/transactions">
                <p class="text-slate-300 text-2xl">Transactions</p>
            </v-list-item>
            <v-list-item prepend-icon="information" to="/about">
                <p class="text-slate-300 text-2xl">About</p>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<style scoped></style>