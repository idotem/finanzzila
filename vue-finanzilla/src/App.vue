<script setup lang="ts">
import { VApp, VAppBar, VBtn, VIcon, VLayout, VMain, VSpacer } from 'vuetify/components';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useTheme } from 'vuetify';
import NavigationBar from '@/navigation/NavigationBar.vue';

const theme = useTheme();
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

// Toggle Light/Dark mode
const toggleTheme = () => {
    theme.global.name.value = theme.global.current.value.dark ? 'customLightTheme' : 'customDarkTheme';
};
</script>

<template>
    <v-app>
        <v-layout style="display: flex; flex-direction: column; min-height: 100vh">
            <v-app-bar color="app-bar" class="border-b" elevation="1">
                <v-btn icon @click="toggleDrawer" v-if="isMobile">
                    <v-icon>menu</v-icon>
                </v-btn>
                <img class="ml-4 w-12" src="/logo.svg" alt="No logo" />
                <p class="ml-4 text-xl font-bold tracking-tight text-primary">Finanzzila</p>
                <v-spacer></v-spacer>
                <v-btn icon @click="toggleTheme" class="mr-2">
                    <v-icon>{{ theme.global.current.value.dark ? 'light_mode' : 'dark_mode' }}</v-icon>
                </v-btn>
            </v-app-bar>

            <NavigationBar
                :model-value="drawer"
                :isMobile="isMobile"
                @update:modelValue="drawer = $event"
            />

            <v-main class="d-flex justify-center bg-background" style="flex: 1">
                <div class="w-full max-w-[1920px]">
                    <RouterView></RouterView>
                </div>
            </v-main>
        </v-layout>
    </v-app>
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
