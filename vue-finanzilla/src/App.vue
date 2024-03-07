<script setup lang="ts">
import { VCard, VLayout, VMain } from 'vuetify/components';
import NavigationBar from './components/navigation/NavigationBar.vue';
</script>

<template>
  <header>
    <div class="wrapper">
      <v-card>
        <v-layout>
          <NavigationBar></NavigationBar>
          <v-main>
            <RouterView></RouterView>
          </v-main>
        </v-layout>
      </v-card>
    </div>
  </header>

</template>

<style scoped></style>
