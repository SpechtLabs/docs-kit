<script setup lang="ts">
import Contributors from "./Contributors.vue";

defineProps<{
  org?: string;
  repo?: string;
}>();
</script>

<template>
  <VPHomeBox>
    <Contributors :org="org" :repo="repo" />
  </VPHomeBox>
</template>
