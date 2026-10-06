<script setup lang="ts">
import Projects from "./Projects.vue";

defineProps<{
  org: string;
}>();
</script>

<template>
  <VPHomeBox>
    <Projects :org="org" />
  </VPHomeBox>
</template>
