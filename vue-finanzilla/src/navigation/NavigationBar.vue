<script setup lang="ts">
import { VList, VListItem, VNavigationDrawer } from 'vuetify/components';
import { defineEmits, defineProps } from 'vue';

// Props
type NavigationBarProps = {
    modelValue: boolean; // Controls the drawer state
    isMobile: boolean; // Indicates if the screen is mobile-sized
};

const props = defineProps<NavigationBarProps>();
const emit = defineEmits(['update:modelValue']);

// Function to handle navigation item clicks
const handleNavigation = () => {
    if (props.isMobile) {
        emit('update:modelValue', false); // Close the drawer on mobile after navigation
    }
};
</script>

<template>
    <v-navigation-drawer
        app
        rail
        :permanent="!props.isMobile"
        :model-value="props.modelValue"
        expand-on-hover
        color="#123030"
        @update:model-value="(value) => emit('update:modelValue', value)"
    >
        <v-list density="comfortable" nav color="#1ABC9C" bg-color="#123030">
            <v-list-item prepend-icon="dashboard" to="/" @click="handleNavigation">
                <p class="text-slate-300 text-xl">Dashboard</p>
            </v-list-item>
            <v-list-item prepend-icon="paid" to="/transactions" @click="handleNavigation">
                <p class="text-slate-300 text-xl">Transactions</p>
            </v-list-item>
            <v-list-item prepend-icon="settings" to="/configuration" @click="handleNavigation">
                <p class="text-slate-300 text-xl">Config</p>
            </v-list-item>
            <v-list-item prepend-icon="information" to="/about" @click="handleNavigation">
                <p class="text-slate-300 text-xl">About</p>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<style scoped></style>
