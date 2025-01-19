<script setup lang="ts">
import { ref } from 'vue';
import { VProgressCircular, VOverlay } from 'vuetify/components';

const props = defineProps({
    isLoading: {
        type: Boolean,
        default: false
    }
});

const isLoading = ref(props.isLoading);
</script>

<template>
    <main>
        <div>
            <v-overlay :opacity="0.8" v-if="isLoading">
                <v-progress-circular indeterminate size="64" color="green"></v-progress-circular>
            </v-overlay>
        </div>
    </main>
</template>
