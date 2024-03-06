<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { VNavigationDrawer, VCard, VLayout, VList, VListItem, VMain } from 'vuetify/components';
</script>

<template>
  <header>
    <div class="wrapper">
      <v-card>
        <v-layout>
          <v-navigation-drawer floating permanent>
            <v-list density="compact" nav>
              <v-list-item prepend-icon="mdi-view-dashboard" title="Home" value="home">
                <RouterLink to="/"></RouterLink>
              </v-list-item>
              <v-list-item prepend-icon="mdi-forum" title="About" value="about">
                <RouterLink to="/about"></RouterLink>
              </v-list-item>
            </v-list>
          </v-navigation-drawer>
          <v-main>
            <RouterView></RouterView>
          </v-main>
        </v-layout>
      </v-card>
    </div>
  </header>

</template>

<style scoped></style>
