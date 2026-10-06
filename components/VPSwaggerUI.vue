<script setup lang="ts">
import SwaggerUI from "./SwaggerUI.vue";

defineProps<{
  url?: string;
}>();
</script>

<template>
  <VPHomeBox>
    <SwaggerUI :url="url" />
  </VPHomeBox>
</template>
