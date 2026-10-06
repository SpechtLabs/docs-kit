<template>
  <h2 class="section_title">Projects</h2>
  <p class="section_description">Built in public. Shared for everyone. Explore the repositories powering my experiments
    and tools.</p>
  <br />
  <div>
    <div v-if="error" class="error">Error: {{ error }}</div>
    <div v-else :style="projectsGridStyles" class="projects-grid">
      <div v-for="project in projects" :key="project.name" class="vp-home-feature">
        <article class="box">
          <div class="header">
            <h2 class="title" v-html="project.name" />
            <span class="stars" :title="starsLabel(project.stargazers_count)"
              :aria-label="starsLabel(project.stargazers_count)">
              <svg class="stars-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path fill="currentColor"
                  d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
              </svg>
              {{ project.stargazers_count }}
            </span>
          </div>
          <p class="details" v-html="project.description" />
          <div class="tags">
            <span v-for="tag in project.topics" :key="tag" class="tag">{{
              tag
              }}</span>
          </div>
          <div class="actions">
            <!-- The homepage button stretches over the whole card -->
            <VPButton class="link-homepage" theme="brand" text="Visit Homepage" :href="project.homepage"
              suffix-icon="mdi:arrow-right" />
            <VPButton class="link-github" theme="alt" text="Visit GitHub" :href="project.html_url"
              icon="simple-icons:github" />
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VPButton from "@theme/VPButton.vue";
import { computed } from "vue";
import { orgData } from "./github-data";

const props = defineProps<{
  org: string;
}>();

const starsLabel = (count: number) =>
  `${count} GitHub ${count === 1 ? "star" : "stars"}`;

const data = computed(() => orgData(props.org));
const error = computed(() => (typeof data.value === "string" ? data.value : ""));
const projects = computed(() =>
  typeof data.value === "string" ? [] : data.value.projects,
);

const projectsGridStyles = computed(() => {
  const projectCount = projects.value.length;
  let numColumns;

  if (projectCount === 0) {
    numColumns = 1; // No projects, perhaps just a single column for emptiness
  } else if (projectCount === 1) {
    numColumns = 1;
  } else if (projectCount === 2) {
    numColumns = 2;
  } else if (projectCount === 3) {
    numColumns = 3;
  } else if (projectCount === 4) {
    numColumns = 2; // Specific for 2x2
  } else {
    // For projectCount > 4
    if (projectCount % 4 === 0 || projectCount === 7) {
      numColumns = 4;
    } else if (projectCount % 3 === 0) {
      numColumns = 3;
    } else {
      // Fallback for cases like 5, 10, 11 where 4 columns is desired
      numColumns = 4;
    }
  }

  // The stylesheet caps this on narrower screens
  return { "--columns": numColumns };
});
</script>

<style scoped>
.projects-grid {
  --columns: 1;
  display: grid;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
  gap: 20px;
}

@media (max-width: 959px) {
  .projects-grid {
    grid-template-columns: repeat(min(var(--columns), 2), minmax(0, 1fr));
  }
}

@media (max-width: 639px) {
  .projects-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.error {
  text-align: center;
  font-size: 1.2em;
  padding: 20px;
}

.vp-home-feature {
  position: relative;
  display: block;
  height: 100%;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  text-decoration: none;
  transition: border-color var(--vp-t-color), background-color var(--vp-t-color);
  color: inherit;
}

.vp-home-feature:hover {
  border-color: var(--vp-c-brand-1);
}

.box {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 20px;
  font-size: 24px;
  background-color: var(--vp-c-default-soft);
  border-radius: 6px;
  transition: background-color var(--vp-t-color);
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.stars {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  line-height: 24px;
  color: var(--vp-c-text-2);
}

.title {
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.details {
  flex-grow: 1;
  padding-top: 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 24px;
  color: var(--vp-c-text-2);
}

.tags {
  margin-top: 8px;
}

.tag {
  display: inline-block;
  background-color: var(--vp-c-brand-1);
  color: var(--vp-c-bg);
  font-size: 12px;
  padding: 2px 6px;
  margin: 2px;
  border-radius: 4px;
}

/* Cards are too narrow for two buttons side by side, so stack them full width */
.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
}

.actions > .vp-button + .vp-button {
  margin-left: 0;
}

.link-homepage::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

/* Keep the GitHub button clickable above the stretched homepage button */
.link-github {
  position: relative;
  z-index: 1;
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
</style>
