<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { VNavigationDrawer, VList, VListItem } from 'vuetify/components';
</script>

<template>
    <v-navigation-drawer floating permanent class="bg-green-950 text-white">
        <v-list density="compact" nav>
            <v-list-item prepend-icon="mdi-view-dashboard" title="Home" value="home">
                <RouterLink to="/"></RouterLink>
            </v-list-item>
            <v-list-item prepend-icon="mdi-forum" title="About" value="about">
                <RouterLink to="/about"></RouterLink>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<style></style>