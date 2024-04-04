<script setup lang="ts">
import { VAppBar, VFooter, VLayout, VMain } from 'vuetify/components';
import NavigationBar from './components/navigation/NavigationBar.vue';
</script>

<template>
  <v-layout class="bg-slate-400">
    <v-app-bar color='#009688' title=" Finanzzila"></v-app-bar>

    <NavigationBar></NavigationBar>

    <v-main class="d-flex align-center justify-center h-100 pl-10 pt-20">
      <RouterView></RouterView>
    </v-main>

    <v-footer name="footer" app class="justify-center" color="#009688">
      Finanzzila
    </v-footer>
  </v-layout>

</template>

<style scoped></style>
