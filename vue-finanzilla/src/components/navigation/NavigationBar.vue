<script setup lang="ts">
import { VNavigationDrawer, VList, VListItem } from 'vuetify/components';
</script>

<template>
    <v-navigation-drawer app rail expand-on-hover color='#009688'>
        <v-list density="comfortable" nav class="bg-teal-600">
            <v-list-item prepend-icon="dashboard" to="/">
                Dashboard
            </v-list-item>
            <v-list-item prepend-icon="information" to="/about">
                About
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<style scoped></style>