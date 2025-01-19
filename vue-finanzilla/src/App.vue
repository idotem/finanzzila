<script setup lang="ts">
import { VAppBar, VBtn, VFooter, VIcon, VLayout, VMain } from 'vuetify/components';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import NavigationBar from '@/navigation/NavigationBar.vue';

const drawer = ref(true); // Controls the visibility of the drawer
const isMobile = ref(false); // Tracks if the screen size is mobile

// Function to check screen size
const checkScreenSize = () => {
    isMobile.value = window.innerWidth < 600;
    if (!isMobile.value) {
        drawer.value = true; // Ensure the drawer is open on large screens
    }
};

// Initialize screen size check and resize listener
onMounted(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
});

// Cleanup resize listener
onBeforeUnmount(() => {
    window.removeEventListener('resize', checkScreenSize);
});

// Function to toggle the drawer
const toggleDrawer = () => {
    drawer.value = !drawer.value;
};
</script>

<template>
    <v-layout class="bg-app-gray-background" style="display: flex; flex-direction: column; min-height: 100vh">
        <v-app-bar theme="white" color="#011936">
            <v-btn icon @click="toggleDrawer" v-if="isMobile">
                <v-icon>menu</v-icon>
            </v-btn>
            <img class="ml-4 w-12" src="/logo.svg" alt="No logo" />
            <p class="text-slate-300 ml-10 text-xl font-bold">Finanzzila</p>
        </v-app-bar>

        <NavigationBar
            :model-value="drawer"
            :isMobile="isMobile"
            @update:modelValue="drawer = $event"
        />

        <v-main class="d-flex align-center justify-center" style="flex: 1">
            <RouterView></RouterView>
        </v-main>

        <v-footer app class="justify-center" color="#011936">
            <p class="text-slate-300">Finanzzila</p>
        </v-footer>
    </v-layout>
</template>

<style scoped>
html,
body,
#app {
    min-height: 100%;
    margin: 0;
    padding: 0;
}

.v-application {
    min-height: 100%;
}
</style>
