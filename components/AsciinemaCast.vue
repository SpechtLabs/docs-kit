<template>
  <figure class="cast">
    <div class="cast__header">
      <div class="cast__traffic" aria-hidden="true">
        <span class="cast__dot cast__dot--close"></span>
        <span class="cast__dot cast__dot--min"></span>
        <span class="cast__dot cast__dot--max"></span>
      </div>
      <div class="cast__title">{{ computedTitle }}</div>
    </div>
    <div ref="containerRef" class="cast__player"></div>
  </figure>
</template>

<script setup lang="ts">
// The real player (asciinema-player: a terminal emulator with real cursor
// positioning), so full-screen TUIs that repaint in place via escape
// sequences render correctly, not just line-oriented shell sessions.
//
// asciicast v3 recordings (relative inter-event deltas) need
// asciinema-player >= 3.10.0.
//
// The player does browser-only work at module-import time, so importing it
// statically crashes VuePress's SSR pass. It's imported in onMounted
// instead, which also keeps it out of the bundle for pages without a cast.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Player } from 'asciinema-player'

const props = withDefaults(defineProps<{
  src: string
  title?: string
  rows?: number
  autoplay?: boolean
  loop?: boolean
  speed?: number
}>(), {
  rows: 16,
  autoplay: true,
  loop: true,
  speed: 0.75,
})

const computedTitle = computed(() => props.title?.trim() || 'Terminal recording')
const containerRef = ref<HTMLElement | null>(null)
let player: Player | null = null

let unmounted = false

onMounted(async () => {
  const [{ create }] = await Promise.all([
    import('asciinema-player'),
    import('asciinema-player/dist/bundle/asciinema-player.css'),
  ])
  if (unmounted || !containerRef.value) return
  // `theme: 'auto'` (player >=3.8) tracks the site's light/dark toggle
  // instead of a fixed palette. `fit: 'width'` matches the old
  // implementation's behaviour of filling the figure's width regardless of
  // the recording's own column count.
  player = create(props.src, containerRef.value, {
    rows: props.rows,
    autoPlay: props.autoplay,
    loop: props.loop,
    speed: props.speed,
    theme: 'auto',
    fit: 'width',
    terminalFontSize: 'small',
  })
})

onBeforeUnmount(() => {
  unmounted = true
  player?.dispose()
  player = null
})
</script>

<style scoped>
.cast {
  max-width: 960px;
  margin: 1.25rem auto;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: #111418;
  box-shadow: 0 8px 22px rgb(0 0 0 / 10%);
  text-align: left;
}

.cast__header {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.35rem;
  padding: 0 0.75rem;
  border-bottom: 1px solid rgb(255 255 255 / 8%);
  background: #1b2027;
}

.cast__traffic {
  display: flex;
  gap: 0.42rem;
}

.cast__dot {
  width: 0.72rem;
  height: 0.72rem;
  border-radius: 50%;
}

.cast__dot--close {
  background: #ff5f57;
}

.cast__dot--min {
  background: #ffbd2e;
}

.cast__dot--max {
  background: #28c840;
}

.cast__title {
  overflow: hidden;
  color: #d8dee9;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cast__player {
  width: 100%;
}

/* asciinema-player renders its own controls, cursor and colour scheme; this
   component only owns the chrome above it. */
.cast__player :deep(.ap-player) {
  border-radius: 0;
}
</style>
