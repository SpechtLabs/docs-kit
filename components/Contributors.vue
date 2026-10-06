<template>
  <h2 class="section_title">Contributors</h2>
  <p class="section_description">{{ description }}</p>
  <br />
  <div>
    <div v-if="error" class="error">Error: {{ error }}</div>
    <div v-else-if="contributors.length" class="contributors-grid-container">
      <div class="contributors-grid">
        <div v-for="contributor in contributors" :key="contributor.login" class="contributor">
          <img class="contributor__avatar" :src="contributor.avatar_url"
            :alt="'The avatar used by ' + contributor.login" width="80" height="80" />
          <a class="contributor__name" :href="contributor.html_url" target="_blank" rel="noopener noreferrer">
            {{ contributor.login }}
          </a>
        </div>
      </div>
    </div>
    <div v-else class="no-contributors">No contributors found.</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { orgData, repoData } from "./github-data";

// Pass `repo` ("owner/name") for one repository's contributors, or only `org`
// for everyone who contributed to any of the org's public projects.
const props = defineProps<{
  org?: string;
  repo?: string;
}>();

const data = computed(() => {
  if (props.repo) return repoData(props.repo);
  if (props.org) return orgData(props.org);
  return "Contributors needs a `repo` or an `org`.";
});

const error = computed(() => (typeof data.value === "string" ? data.value : ""));
const contributors = computed(() =>
  typeof data.value === "string" ? [] : data.value.contributors,
);

const description = computed(() =>
  props.repo
    ? "Your contributions matter. Here's to everyone who's helped bring this to life."
    : `Your contributions matter. Here's to everyone who's helped build any of the ${props.org} projects.`,
);
</script>

<style scoped>
.contributors-grid-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.contributors-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  max-width: 1200px;
  padding: 0 10px;
}

.contributor {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin: 10px;
}

.contributor__avatar {
  border-radius: 50%;
  display: inline-block;
  margin-bottom: 8px;
}

.contributor__name {
  font-size: 14px;
  white-space: nowrap;
  text-decoration: none;
  color: var(--vp-c-text-1);
}

.contributor__name:hover {
  color: var(--vp-c-brand-1);
}

.section_title {
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 20px;
  text-align: center;
  transition: color var(--vp-t-color);
  color: var(--vp-c-text-1);
}

.section_description {
  font-size: 18px;
  font-weight: 400;
  margin-bottom: 20px;
  text-align: center;
  transition: color var(--vp-t-color);
  color: var(--vp-c-text-1);
}

.error,
.no-contributors {
  text-align: center;
  font-size: 1.2em;
  padding: 20px;
  color: var(--vp-c-text-2);
}
</style>
