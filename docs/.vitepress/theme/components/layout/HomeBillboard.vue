<script setup lang="ts">
import { data as allPosts } from "../../../../blog/data.data";
import { ref, computed, onMounted, onUnmounted, watch } from "vue";

const posts = allPosts.slice(0, 5);

// Rotate through the abstract billboard images (docs/public/abstract) for posts
// that have no front cover, so every slide still shows a visual.
const abstractImages = Array.from(
  { length: 9 },
  (_, i) => `/abstract/abstract-${i + 1}.jpg`,
);
const fallbackCovers = new Map<string, string>(
  posts.map((p, i) => [p.url, abstractImages[i % abstractImages.length]]),
);
function coverOf(p: any): string {
  return p.cover || fallbackCovers.get(p.url) || abstractImages[0];
}

function fmt(raw: string): string {
  return String(raw ?? "").slice(0, 10);
}

// ── Slideshow state ────────────────────────────────────────────────
const current = ref(0);
const prev = ref(-1);
const animDir = ref<"next" | "prev">("next");
const isAnim = ref(false);
const paused = ref(false);
let timer: ReturnType<typeof setInterval> | null = null;

const total = computed(() => posts.length);

function goTo(idx: number, dir: "next" | "prev" = "next") {
  if (isAnim.value || idx === current.value) return;
  animDir.value = dir;
  prev.value = current.value;
  current.value = (idx + total.value) % total.value;
  isAnim.value = true;
  setTimeout(() => {
    isAnim.value = false;
    prev.value = -1;
  }, 600);
}

function next() {
  goTo(current.value + 1, "next");
}
function back() {
  goTo(current.value - 1, "prev");
}

function startTimer() {
  stopTimer();
  if (total.value <= 1) return;
  timer = setInterval(() => {
    if (!paused.value) next();
  }, 4500);
}
function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

onMounted(() => startTimer());
onUnmounted(() => stopTimer());

// Reset timer on manual navigation
watch(current, () => startTimer());

function pause() {
  paused.value = true;
}
function resume() {
  paused.value = false;
}

// Touch swipe
const touchStartX = ref(0);
function onTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX;
  pause();
}
function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - touchStartX.value;
  if (Math.abs(dx) > 40) dx < 0 ? next() : back();
  resume();
}

// Keyboard
function onKey(e: KeyboardEvent) {
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") back();
}
onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <div class="hbb-outer">
    <div class="hbb-inner">
      <!-- ── Slideshow ──────────────────────────────────────────── -->
      <div
        class="hbb-stage"
        @mouseenter="pause"
        @mouseleave="resume"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
        role="region"
        aria-label="最新文章輪播"
      >
        <!-- Slides -->
        <template v-for="(p, i) in posts" :key="p.url">
          <!-- Active slide -->
          <a
            v-if="i === current"
            :href="p.url"
            class="hbb-slide"
            :class="[
              'slide-enter',
              animDir === 'next' ? 'from-right' : 'from-left',
            ]"
            :style="{ '--dur': '0.6s' }"
            tabindex="0"
          >
            <img :src="coverOf(p)" :alt="p.title" class="hbb-bg" />
            <div class="hbb-overlay" />
            <div class="hbb-content">
              <div class="hbb-meta">
                <span class="hbb-badge" v-if="p.category">{{
                  p.category
                }}</span>
                <span class="hbb-date">{{ fmt(p.date) }}</span>
              </div>
              <h2 class="hbb-title">{{ p.title }}</h2>
              <p class="hbb-excerpt" v-if="p.excerpt">
                {{ p.excerpt.replace(/<[^>]*>/g, "").slice(0, 100) }}…
              </p>
              <span class="hbb-cta">閱讀全文 →</span>
            </div>
          </a>

          <!-- Leaving slide -->
          <div
            v-else-if="i === prev && isAnim"
            class="hbb-slide"
            :class="[
              'slide-leave',
              animDir === 'next' ? 'to-left' : 'to-right',
            ]"
            aria-hidden="true"
          >
            <img :src="coverOf(p)" :alt="p.title" class="hbb-bg" />
            <div class="hbb-overlay" />
            <div class="hbb-content">
              <div class="hbb-meta">
                <span class="hbb-badge" v-if="p.category">{{
                  p.category
                }}</span>
                <span class="hbb-date">{{ fmt(p.date) }}</span>
              </div>
              <h2 class="hbb-title">{{ p.title }}</h2>
            </div>
          </div>
        </template>

        <!-- ── Left / Right arrows ──────────────────────────────── -->
        <button
          class="hbb-arrow hbb-arrow-left"
          @click.prevent="back"
          aria-label="上一篇"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          class="hbb-arrow hbb-arrow-right"
          @click.prevent="next"
          aria-label="下一篇"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>

        <!-- ── Dots + progress bar ──────────────────────────────── -->
        <div class="hbb-dots">
          <button
            v-for="(p, i) in posts"
            :key="i"
            class="hbb-dot"
            :class="{ active: i === current }"
            @click.prevent="goTo(i, i > current ? 'next' : 'prev')"
            :aria-label="`切換到第 ${i + 1} 篇`"
          >
            <span
              class="hbb-dot-progress"
              :class="{ running: i === current && !paused }"
            />
          </button>
        </div>

        <!-- Slide counter -->
        <div class="hbb-counter">{{ current + 1 }} / {{ total }}</div>
      </div>

      <!-- ── Thumbnail strip ──────────────────────────────────── -->
      <!-- <div class="hbb-thumbs" v-if="posts.length > 1">
        <button
          v-for="(p, i) in posts"
          :key="p.url"
          class="hbb-thumb"
          :class="{ 'thumb-active': i === current }"
          @click="goTo(i, i > current ? 'next' : 'prev')"
        >
          <img
            :src="coverOf(p)"
            :alt="p.title"
            class="hbb-thumb-img"
          />
          <div class="hbb-thumb-info">
            <span class="hbb-thumb-title">{{ p.title }}</span>
            <span class="hbb-thumb-date">{{ fmt(p.date) }}</span>
          </div>
        </button>
      </div> -->
    </div>
  </div>
</template>

<style scoped>
/* ── Outer — matches HomeCitation / HomeProfile padding ─────────── */
.hbb-outer {
  padding: 0 24px;
  box-sizing: border-box;
}
@media (min-width: 640px) {
  .hbb-outer {
    padding: 0 48px;
  }
}
@media (min-width: 960px) {
  .hbb-outer {
    padding: 0 64px;
  }
}

.hbb-inner {
  max-width: 1152px;
  margin: 0 auto;
  padding-top: 2rem;
}

/* ── Stage ──────────────────────────────────────────────────────── */
.hbb-stage {
  position: relative;
  width: 100%;
  height: 420px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-mute);
  user-select: none;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s !important;
}
@media (max-width: 640px) {
  .hbb-stage {
    height: 280px;
    border-radius: 12px;
  }
}

:root:not(.dark) .hbb-stage {
  border: 1px solid rgba(100, 108, 255, 0.3) !important;
}

.hbb-stage:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.16) !important;
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 45%, white) !important;
}

/* ── Slides ─────────────────────────────────────────────────────── */
.hbb-slide {
  position: absolute;
  inset: 0;
  display: block;
  text-decoration: none;
  overflow: hidden;
}

/* Background image */
.hbb-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 8s ease;
  transform-origin: center center;
}
.hbb-slide.slide-enter .hbb-bg {
  animation: ken-burns 8s ease forwards;
}
@keyframes ken-burns {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.08);
  }
}

/* Gradient overlay */
.hbb-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.65) 0%,
    rgba(0, 0, 0, 0.25) 50%,
    rgba(0, 0, 0, 0.45) 100%
  );
}

/* Content */
.hbb-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.75rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
@media (max-width: 640px) {
  .hbb-content {
    padding: 1rem 1.1rem 1.25rem;
    gap: 0.35rem;
  }
}

.hbb-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.hbb-badge {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #fff;
  background: var(--vp-c-brand-1);
  padding: 2px 9px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* line-height: 1; */
}
.hbb-date {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.65);
  font-variant-numeric: tabular-nums;
}

.hbb-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
  background: none !important;
  -webkit-background-clip: unset !important;
  background-clip: unset !important;
  line-height: 1.3;
  margin: 0;
  border: none !important;
  padding: 0 !important;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@media (max-width: 640px) {
  .hbb-title {
    font-size: 1.1rem;
  }
}

.hbb-excerpt {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.55;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@media (max-width: 640px) {
  .hbb-excerpt {
    display: none;
  }
}

.hbb-cta {
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.04em;
  margin-top: 0.2rem;
  display: flex;
  align-items: center;
  gap: 4px;
}
.hbb-slide:hover .hbb-cta {
  color: #fff;
}

/* ── Slide animations ───────────────────────────────────────────── */
.slide-enter {
  animation: slide-in var(--dur, 0.6s) cubic-bezier(0.25, 0.46, 0.45, 0.94)
    forwards;
  z-index: 2;
}
.slide-leave {
  animation: slide-out var(--dur, 0.6s) cubic-bezier(0.25, 0.46, 0.45, 0.94)
    forwards;
  z-index: 1;
}

.from-right {
  --enter-from: 100%;
  --enter-to: 0%;
}
.from-left {
  --enter-from: -100%;
  --enter-to: 0%;
}
.to-left {
  --leave-to: -100%;
}
.to-right {
  --leave-to: 100%;
}

@keyframes slide-in {
  from {
    transform: translateX(var(--enter-from));
    opacity: 0.6;
  }
  to {
    transform: translateX(var(--enter-to));
    opacity: 1;
  }
}
@keyframes slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(var(--leave-to));
    opacity: 0;
  }
}

/* ── Arrows ─────────────────────────────────────────────────────── */
.hbb-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) scale(0.9);
  z-index: 10;
  width: 36px;
  height: 68px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: linear-gradient(
    155deg,
    rgba(255, 255, 255, 0.22),
    rgba(255, 255, 255, 0.07)
  );
  backdrop-filter: blur(14px) saturate(1.25);
  -webkit-backdrop-filter: blur(14px) saturate(1.25);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow:
    0 8px 22px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  transition:
    background 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    opacity 0.35s ease,
    transform 0.35s cubic-bezier(0.34, 1.45, 0.5, 1);
  opacity: 0;
}
.hbb-stage:hover .hbb-arrow {
  opacity: 1;
  transform: translateY(-50%) scale(1);
}
.hbb-arrow:hover {
  background: linear-gradient(
    155deg,
    color-mix(in srgb, var(--vp-c-brand-1) 88%, white),
    var(--vp-c-brand-1)
  );
  border-color: rgba(255, 255, 255, 0.85);
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.42),
    0 0 0 5px color-mix(in srgb, var(--vp-c-brand-1) 22%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transform: translateY(-50%) scale(1.14);
}
.hbb-arrow:active {
  transform: translateY(-50%) scale(0.95);
  transition-duration: 0.1s;
}
.hbb-arrow svg {
  width: 19px;
  height: 19px;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
  transition: transform 0.25s ease;
}
.hbb-arrow-left:hover svg {
  transform: translateX(-2px);
}
.hbb-arrow-right:hover svg {
  transform: translateX(2px);
}
.hbb-arrow-left {
  left: 0.7rem;
}
.hbb-arrow-right {
  right: 0.7rem;
}

@media (max-width: 640px) {
  .hbb-arrow {
    opacity: 0.75;
    width: 28px;
    height: 52px;
  }
  .hbb-arrow svg {
    width: 15px;
    height: 15px;
  }
}

/* ── Dots ───────────────────────────────────────────────────────── */
.hbb-dots {
  position: absolute;
  bottom: 1rem;
  right: 1.25rem;
  z-index: 10;
  display: flex;
  gap: 6px;
  align-items: center;
}

.hbb-dot {
  position: relative;
  width: 28px;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  cursor: pointer;
  overflow: hidden;
  padding: 0;
  transition:
    width 0.3s ease,
    background 0.3s;
}
.hbb-dot.active {
  width: 40px;
  background: rgba(255, 255, 255, 0.45);
}

.hbb-dot-progress {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0%;
  border-radius: 999px;
  background: #fff;
}
.hbb-dot-progress.running {
  animation: dot-fill 4.5s linear forwards;
}
@keyframes dot-fill {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

/* ── Slide counter ──────────────────────────────────────────────── */
.hbb-counter {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  z-index: 10;
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(6px);
  padding: 3px 10px;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}

/* ── Thumbnail strip ────────────────────────────────────────────── */
.hbb-thumbs {
  display: flex;
  gap: 0.55rem;
  margin-top: 0.65rem;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
}
.hbb-thumbs::-webkit-scrollbar {
  display: none;
}

.hbb-thumb {
  flex-shrink: 0;
  width: 180px;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0.65rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.18s;
  text-align: left;
}
.hbb-thumb:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.hbb-thumb.thumb-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  box-shadow: 0 2px 12px rgba(var(--vp-c-brand-rgb, 100, 108, 255), 0.2);
}

.hbb-thumb-img {
  width: 44px;
  height: 44px;
  border-radius: 7px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid var(--vp-c-divider);
}
.hbb-thumb.thumb-active .hbb-thumb-img {
  border-color: var(--vp-c-brand-1);
}

.hbb-thumb-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.hbb-thumb-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.hbb-thumb.thumb-active .hbb-thumb-title {
  color: var(--vp-c-brand-1);
}
.hbb-thumb-date {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 640px) {
  .hbb-thumb {
    width: 140px;
  }
  .hbb-thumb-img {
    width: 36px;
    height: 36px;
  }
}
</style>
