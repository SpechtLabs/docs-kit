<template>
  <div ref="containerRef" class="swagger-ui"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    // The OpenAPI document, e.g. served from .vuepress/public
    url?: string;
  }>(),
  { url: "/swagger.json" },
);

const containerRef = ref<HTMLElement | null>(null);

// Swagger UI is large and touches the DOM when imported, so it's loaded only
// in the browser, and only on pages that use this component.
onMounted(async () => {
  const [{ default: SwaggerUIBundle }] = await Promise.all([
    import("swagger-ui-dist/swagger-ui-es-bundle.js"),
    import("swagger-ui-dist/swagger-ui.css"),
  ]);
  if (!containerRef.value) return;
  SwaggerUIBundle({
    url: props.url,
    domNode: containerRef.value,
  });
});
</script>

<style scoped>
/* Swagger UI overrides */
.swagger-ui {
  background: transparent !important;
  color: var(--c-text) !important;
}

.swagger-ui .opblock {
  background: var(--c-bg-soft) !important;
  border-radius: 6px;
}

.swagger-ui .scheme-container {
  background: transparent !important;
}
</style>
