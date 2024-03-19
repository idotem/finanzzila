<template>
    <div>
        <p>{{ propValue }}</p>
    </div>
</template>

<script setup>
const props = defineProps({
    propValue: {
        type: String,
        required: true
    }
});
</script>