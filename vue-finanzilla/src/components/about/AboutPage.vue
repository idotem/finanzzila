<template>
  <div>
    <ChildComponent :propValue="parentProp" />
    <button @click="changeProp">Change Prop</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ChildComponent from './ChildComponent.vue';

const parentProp = ref('Initial Prop Value');

const changeProp = () => {
  parentProp.value = 'New Prop Value';
};
</script>
