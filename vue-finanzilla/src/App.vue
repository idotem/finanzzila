<script setup lang="ts">
import { VAppBar, VFooter, VLayout, VMain } from 'vuetify/components';
import NavigationBar from './navigation/NavigationBar.vue';
</script>

<template>
    <v-layout class="bg-teal-500">
        <v-app-bar theme="white" color="#011936">
            <img class="ml-4 w-12" src="/logo.svg" alt="No logo" />
            <p class="text-slate-300 ml-10 text-xl font-bold">Finanzzila</p>
        </v-app-bar>

        <NavigationBar></NavigationBar>

        <v-main class="d-flex align-center justify-center h-100 pt-20">
            <RouterView></RouterView>
        </v-main>

        <v-footer name="footer" app class="justify-center" color="#011936">
            <p class="text-slate-300">Finanzzila</p>
        </v-footer>
    </v-layout>
</template>

<style scoped></style>
