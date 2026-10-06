<template>
  <div v-if="error" class="error">Error: {{ error }}</div>
  <div v-else-if="releases.length" class="releases">
    <h2 class="title">Releases</h2>

    <template v-if="availablePlatforms.length">
      <p class="description">Select your platform</p>
      <div class="platforms">
        <VPButton
          v-for="platform in availablePlatforms"
          :key="platform"
          :theme="platform === selectedPlatform ? 'brand' : 'alt'"
          :text="platforms[platform]"
          :aria-pressed="platform === selectedPlatform"
          @click="selectedPlatform = platform"
        />
      </div>
    </template>

    <div class="release-list">
      <article v-for="(release, i) in shownReleases" :key="release.id" class="release">
        <header class="release__header">
          <div class="release__heading">
            <h3 class="release__name">
              <a :href="release.html_url" target="_blank" rel="noopener noreferrer">{{ release.name }}</a>
            </h3>
            <Badge v-if="release.prerelease" text="Early Access" type="warning" />
            <time class="release__date" :datetime="release.published_at">
              {{ formatDate(release.published_at) }}
            </time>
          </div>
          <VPButton
            v-if="download(release)"
            class="release__download"
            theme="brand"
            text="Download"
            :title="download(release)?.name"
            :href="download(release)?.url"
          />
        </header>

        <template v-if="release.notes_html.trim()">
          <!-- notes_html is rendered and sanitized by GitHub at build time -->
          <div v-if="i === 0" class="release__notes" v-html="release.notes_html" />
          <details v-else class="release__more">
            <summary>Release notes</summary>
            <div class="release__notes" v-html="release.notes_html" />
          </details>
        </template>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import VPButton from "@theme/VPButton.vue";
import { computed, onMounted, ref } from "vue";
import { type Platform, type Release, platforms } from "../dist/shared/types.js";
import { repoData } from "./github-data";

const props = defineProps<{
  // "owner/name"
  repo: string;
}>();

const shownCount = 5;

const data = computed(() => repoData(props.repo));
const error = computed(() => (typeof data.value === "string" ? data.value : ""));
const releases = computed(() =>
  typeof data.value === "string" ? [] : data.value.releases,
);

const shownReleases = computed(() => releases.value.slice(0, shownCount));

// Only offer the platforms the shown releases ship, in the usual order
const availablePlatforms = computed(() =>
  (Object.keys(platforms) as Platform[]).filter((platform) =>
    shownReleases.value.some((r) => r.downloads[platform]),
  ),
);

const selectedPlatform = ref<Platform | null>(null);

function download(release: Release) {
  return selectedPlatform.value
    ? release.downloads[selectedPlatform.value]
    : undefined;
}

// UTC, so the server-rendered date and the browser's agree
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Preselect the visitor's platform. Browsers report Intel on every Mac, so
// Apple silicon, today's default, wins there when the project ships it.
function detectPlatform(): Platform | null {
  const ua = navigator.userAgent.toLowerCase();
  const os = /mac/.test(ua)
    ? "darwin"
    : /win/.test(ua)
      ? "windows"
      : /linux|x11/.test(ua)
        ? "linux"
        : null;
  if (!os) return null;
  const preferArm = os === "darwin" || /arm64|aarch64/.test(ua);
  const order = preferArm ? ["arm64", "amd64"] : ["amd64", "arm64"];
  const candidates = order.map((arch) => `${os}_${arch}` as Platform);
  return candidates.find((p) => availablePlatforms.value.includes(p)) ?? null;
}

onMounted(() => {
  selectedPlatform.value = detectPlatform();
});
</script>

<style scoped>
/* On a doc page the theme underlines links and adds an external-link icon
   to them; the cards and buttons here style their own links. */
.releases :deep(a) {
  text-decoration: none;
}

.releases :deep(a)::after {
  display: none !important;
}

.title {
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 20px;
  text-align: center;
  transition: color var(--vp-t-color);
  color: var(--vp-c-text-1);
}

.description {
  font-size: 18px;
  font-weight: 400;
  margin-bottom: 20px;
  text-align: center;
  transition: color var(--vp-t-color);
  color: var(--vp-c-text-1);
}

.platforms {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
}

/* Spacing comes from the gap, which also works when the buttons wrap */
.platforms > .vp-button + .vp-button {
  margin-left: 0;
}

.release-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.release {
  padding: 20px 24px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
}

.release__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.release__heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
}

.release__name {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.release__name a {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.release__name a:hover {
  color: var(--vp-c-brand-1);
}

.release__date {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.release__more {
  margin-top: 12px;
}

.release__more summary {
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}

/* The release notes, as rendered by GitHub */
.release__notes {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-1);
  overflow-wrap: anywhere;
}

.release__notes :deep(h1),
.release__notes :deep(h2),
.release__notes :deep(h3),
.release__notes :deep(h4) {
  margin: 16px 0 6px;
  padding: 0;
  border: none;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
}

.release__notes :deep(> :first-child) {
  margin-top: 0;
}

.release__notes :deep(ul),
.release__notes :deep(ol) {
  margin: 0;
  padding-left: 20px;
}

.release__notes :deep(li) {
  margin: 4px 0;
}

.release__notes :deep(p) {
  margin: 8px 0;
}

.release__notes :deep(a) {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.release__notes :deep(a:hover) {
  text-decoration: underline;
}

.release__notes :deep(code) {
  padding: 2px 5px;
  font-size: 0.9em;
  background-color: var(--vp-c-default-soft);
  border-radius: 4px;
}

.error {
  text-align: center;
  font-size: 1.2em;
  padding: 20px;
  color: var(--vp-c-text-2);
}
</style>
