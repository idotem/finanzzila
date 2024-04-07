<script setup lang="ts">
import { VAppBar, VFooter, VLayout, VMain } from 'vuetify/components';
import NavigationBar from './navigation/NavigationBar.vue';
</script>

<template>
  <v-layout class="bg-teal-500 ">
    <v-app-bar theme="white" color='rgb(59 7 100)' title="Finanzzila"></v-app-bar>

    <NavigationBar></NavigationBar>

    <v-main class="d-flex align-center justify-center h-100 pl-10 pt-20">
      <RouterView></RouterView>
    </v-main>

    <v-footer name="footer" app class="justify-center" color="rgb(59 7 100)">
      <p class="text-slate-300">Finanzzila</p>
    </v-footer>
  </v-layout>

</template>

<style scoped></style>
