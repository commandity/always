<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";

const playlist = [
  { name: "Relax House", id: "36YnV9STBqc" },
  { name: "Chill Synthwave", id: "4xDzrJKXOOY" },
  { name: "Lofi Girl", id: "X4VbdwhkE10" },
  { name: "Chill Out Music Mix", id: "m52ynxt1mOo" },
  { name: "Jazz Hip Hop", id: "E2vONfzoyRI" },
  { name: "Relaxing Piano", id: "4khIPP--FDU" },
  { name: "432Hz + 528Hz", id: "4FZ_AlWO0AI" },
];

let player = null;
let apiReady = false;

const playing = ref(false);
const visible = ref(false);
const loading = ref(true);
const error = ref(false);
const volume = ref(30);
const muted = ref(false);
const current = ref(0);
const showList = ref(false);
const infoRef = ref(null);
const labelRef = ref(null);
const labelOverflows = ref(false);
let prevVolume = 20;
const animDuration = 25000;
let accumulatedTime = 0;
let lastTickTime = 0;
const animDelay = ref("0s");

function tick() {
  if (lastTickTime > 0) {
    const now = Date.now();
    accumulatedTime = (accumulatedTime + now - lastTickTime) % animDuration;
    lastTickTime = now;
  }
}

function resumeAnim() {
  tick();
  lastTickTime = Date.now();
  animDelay.value = `-${accumulatedTime / 1000}s`;
}

function pauseAnim() {
  tick();
  lastTickTime = 0;
  animDelay.value = `-${accumulatedTime / 1000}s`;
}

function switchAnim() {
  tick();
  animDelay.value = `-${accumulatedTime / 1000}s`;
}

function checkOverflow() {
  if (!labelRef.value) return;
  const el = labelRef.value;
  const overflow = el.scrollWidth - el.parentElement.offsetWidth;
  labelOverflows.value = overflow > 0;
  if (overflow > 0) {
    el.style.setProperty("--scroll", -overflow + "px");
  }
}

function onShow() {
  nextTick(() => checkOverflow());
}

watch(current, () => onShow());
watch(visible, (v) => {
  if (v) onShow();
  if (playing.value) switchAnim();
});

watch(playing, (v) => {
  if (v) resumeAnim();
  else pauseAnim();
});

function onListClick() {
  showList.value = !showList.value;
}

function onDocClick(e) {
  if (showList.value && infoRef.value && !infoRef.value.contains(e.target)) {
    showList.value = false;
  }
}

function onSelect(idx) {
  if (idx === current.value) {
    showList.value = false;
    return;
  }
  switchTrack(idx);
}

function switchTrack(idx) {
  if (idx < 0) idx = playlist.length - 1;
  else if (idx >= playlist.length) idx = 0;
  current.value = idx;
  if (player && apiReady) {
    loading.value = true;
    error.value = false;
    player.loadVideoById(playlist[idx].id);
  }
}

function initPlayer() {
  try {
    player = new YT.Player("youtube-player", {
      height: "0",
      width: "0",
      videoId: playlist[current.value].id,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: () => {
          apiReady = true;
          loading.value = false;
          player.setVolume(volume.value);
        },
        onStateChange: (e) => {
          playing.value = e.data === YT.PlayerState.PLAYING;
          if (
            e.data === YT.PlayerState.PLAYING ||
            e.data === YT.PlayerState.BUFFERING
          ) {
            loading.value = false;
            error.value = false;
          }
        },
        onError: () => {
          error.value = true;
          loading.value = false;
        },
      },
    });
  } catch {
    error.value = true;
    loading.value = false;
  }
}

onMounted(async () => {
  document.addEventListener("click", onDocClick);
  await nextTick();
  onShow();

  if (!window.YT) {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }

  if (window.YT && window.YT.Player) {
    initPlayer();
  } else {
    window.onYouTubeIframeAPIReady = initPlayer;
  }

  setTimeout(() => {
    if (loading.value) {
      error.value = true;
      loading.value = false;
    }
  }, 10000);
});

onUnmounted(() => {
  document.removeEventListener("click", onDocClick);
  window.onYouTubeIframeAPIReady = null;
  if (player) {
    player.destroy();
    player = null;
  }
});

function togglePlay() {
  if (!player || !apiReady) return;
  if (playing.value) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function setVolume(e) {
  const v = parseInt(e.target.value);
  volume.value = v;
  prevVolume = v;
  if (player && apiReady) {
    player.unMute();
    muted.value = false;
    player.setVolume(v);
  }
}

function toggleMute() {
  if (!player || !apiReady) return;
  if (muted.value) {
    player.unMute();
    muted.value = false;
    volume.value = prevVolume;
    player.setVolume(prevVolume);
  } else {
    player.mute();
    muted.value = true;
    prevVolume = volume.value;
    volume.value = 0;
  }
}

function toggleVisible() {
  visible.value = !visible.value;
}
</script>

<template>
  <div id="youtube-player"></div>

  <transition name="fade">
    <div
      v-if="visible"
      class="music-container"
      :class="{ play: playing }"
      :style="playing ? { animationDelay: animDelay } : undefined"
    >
      <button
        class="play-btn"
        @click="togglePlay"
        :title="playing ? '暫停' : '播放'"
        :disabled="loading || error"
      >
        <i v-if="loading" class="fas fa-spinner fa-pulse"></i>
        <i v-else-if="error" class="fas fa-exclamation-triangle"></i>
        <i v-else class="fas" :class="playing ? 'fa-pause' : 'fa-play'"></i>
      </button>

      <div class="track-nav">
        <button
          class="nav-btn"
          @click="switchTrack(current - 1)"
          title="上一首"
        >
          <i class="fas fa-step-backward"></i>
        </button>
        <button
          class="nav-btn"
          @click="switchTrack(current + 1)"
          title="下一首"
        >
          <i class="fas fa-step-forward"></i>
        </button>
      </div>

      <div ref="infoRef" class="info" @click="onListClick">
        <div class="label-row">
          <div class="label">
            <span
              ref="labelRef"
              class="label-text"
              :class="{ chyron: labelOverflows }"
              >{{ playlist[current].name }}</span
            >
          </div>
          <i class="fas fa-caret-down"></i>
        </div>
        <div class="status">
          <template v-if="loading">載入中…</template>
          <template v-else-if="error">無法播放</template>
          <template v-else>{{ playing ? "正在播放" : "已暫停" }}</template>
        </div>
        <div class="list-wrap" v-if="showList">
          <button
            v-for="(t, i) in playlist"
            :key="i"
            class="list-item"
            :class="{ active: i === current }"
            @click.stop="onSelect(i)"
          >
            {{ t.name }}
          </button>
        </div>
      </div>

      <div class="volume-wrap">
        <i
          class="fas"
          :class="muted ? 'fa-volume-mute' : 'fa-volume-up'"
          @click="toggleMute"
          style="cursor: pointer; width: 1.1em; text-align: center"
        ></i>
        <input
          type="range"
          class="volume-slider"
          min="0"
          max="100"
          :value="volume"
          @input="setVolume"
        />
      </div>

      <button class="close-btn" @click="visible = false" title="隱藏">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </transition>

  <transition name="fade">
    <button
      v-if="!visible"
      class="show-toggle"
      :class="{ play: playing }"
      :style="playing ? { animationDelay: animDelay } : undefined"
      @click="visible = true"
      title="顯示播放器"
    >
      <i class="fa-solid fa-music"></i>
    </button>
  </transition>
</template>

<style>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css");
</style>

<style scoped>
.music-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 24px;
  padding: 12px 14px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.play-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(
    135deg,
    var(--vp-c-brand-1) 0%,
    var(--vp-c-brand-2) 100%
  );
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 14px
    color-mix(in srgb, var(--vp-c-brand-1) 50%, transparent);
  transition: all 0.2s;
}
.play-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px
    color-mix(in srgb, var(--vp-c-brand-1) 60%, transparent);
}
.play-btn:active {
  transform: scale(0.95);
}
.play-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.play-btn:disabled:hover {
  transform: none;
  box-shadow: 0 4px 14px
    color-mix(in srgb, var(--vp-c-brand-1) 50%, transparent);
}

.track-nav {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.nav-btn:hover {
  background: rgba(128, 128, 128, 0.15);
  color: var(--vp-c-text-1);
}

.info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 110px;
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
  user-select: none;
}
.label-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.label-row .fa-caret-down {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.label {
  width: 90px;
  overflow: hidden;
}
.label-text {
  display: inline-block;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  white-space: nowrap;
}
.label-text.chyron {
  animation: chyron 10s ease-in-out infinite;
}
@keyframes chyron {
  0%,
  15% {
    transform: translateX(0);
  }
  40%,
  60% {
    transform: translateX(var(--scroll));
  }
  85%,
  100% {
    transform: translateX(0);
  }
}
.status {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.list-wrap {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.list-item {
  all: unset;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  cursor: pointer;
  white-space: nowrap;
}
.list-item:hover {
  background: var(--vp-c-brand-soft);
}
.list-item.active {
  background: color-mix(in srgb, var(--vp-c-brand-1) 15%, transparent);
  color: var(--vp-c-brand-1);
}

.volume-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}
.volume-slider {
  width: 60px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--vp-c-text-3);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  cursor: pointer;
}
.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  cursor: pointer;
  border: none;
}

.close-btn {
  background: none;
  border: none;
  color: var(--vp-c-text-3);
  font-size: 16px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 8px;
  transition: all 0.2s;
  line-height: 1;
}
.close-btn:hover {
  color: var(--vp-c-text-1);
  background: rgba(0, 0, 0, 0.06);
}

.show-toggle {
  position: fixed;
  right: 16px;
  bottom: 24px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(
    135deg,
    var(--vp-c-brand-1) 0%,
    var(--vp-c-brand-2) 100%
  );
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px
    color-mix(in srgb, var(--vp-c-brand-1) 50%, transparent);
  transition: all 0.2s;
  z-index: 9999;
}
.show-toggle:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px
    color-mix(in srgb, var(--vp-c-brand-1) 60%, transparent);
}
.show-toggle:active {
  transform: scale(0.95);
}
.show-toggle.play {
  animation: glow-pulse 40s linear infinite;
}
.music-container.play {
  animation: glow-pulse 40s linear infinite;
}
@keyframes glow-pulse {
  0%,
  4%,
  8%,
  12%,
  16%,
  20%,
  24%,
  28%,
  32%,
  36%,
  40%,
  44%,
  48%,
  52%,
  56%,
  60%,
  64%,
  68%,
  72%,
  76%,
  80%,
  84%,
  88%,
  92%,
  96%,
  100% {
    box-shadow:
      0 0 0 transparent,
      0 0 0 transparent,
      0 0 0 transparent;
  }
  2% {
    box-shadow:
      0 0 6px hsla(0, 100%, 75%, 0.95),
      0 0 16px hsla(0, 100%, 65%, 0.55),
      0 0 25px hsla(0, 100%, 55%, 0.25);
  }
  6% {
    box-shadow:
      0 0 6px hsla(330, 100%, 80%, 0.95),
      0 0 16px hsla(330, 100%, 70%, 0.55),
      0 0 25px hsla(330, 100%, 60%, 0.25);
  }
  10% {
    box-shadow:
      0 0 6px hsla(220, 100%, 75%, 0.95),
      0 0 16px hsla(220, 100%, 65%, 0.55),
      0 0 25px hsla(220, 100%, 55%, 0.25);
  }
  14% {
    box-shadow:
      0 0 6px hsla(0, 100%, 75%, 0.95),
      0 0 16px hsla(0, 100%, 65%, 0.55),
      0 0 25px hsla(0, 100%, 55%, 0.25);
  }
  18% {
    box-shadow:
      0 0 6px hsla(100, 100%, 75%, 0.95),
      0 0 16px hsla(100, 100%, 65%, 0.55),
      0 0 25px hsla(100, 100%, 55%, 0.25);
  }
  22% {
    box-shadow:
      0 0 6px hsla(20, 100%, 80%, 0.95),
      0 0 16px hsla(20, 100%, 70%, 0.55),
      0 0 25px hsla(20, 100%, 60%, 0.25);
  }
  26% {
    box-shadow:
      0 0 6px hsla(100, 100%, 75%, 0.95),
      0 0 16px hsla(100, 100%, 65%, 0.55),
      0 0 25px hsla(100, 100%, 55%, 0.25);
  }
  30% {
    box-shadow:
      0 0 6px hsla(280, 100%, 80%, 0.95),
      0 0 16px hsla(280, 100%, 70%, 0.55),
      0 0 25px hsla(280, 100%, 60%, 0.25);
  }
  34% {
    box-shadow:
      0 0 6px hsla(180, 100%, 75%, 0.95),
      0 0 16px hsla(180, 100%, 65%, 0.55),
      0 0 25px hsla(180, 95%, 55%, 0.25);
  }
  38% {
    box-shadow:
      0 0 6px hsla(280, 100%, 80%, 0.95),
      0 0 16px hsla(280, 100%, 70%, 0.55),
      0 0 25px hsla(280, 100%, 60%, 0.25);
  }
  42% {
    box-shadow:
      0 0 6px hsla(40, 100%, 80%, 0.95),
      0 0 16px hsla(40, 100%, 70%, 0.55),
      0 0 25px hsla(40, 100%, 60%, 0.25);
  }
  46% {
    box-shadow:
      0 0 6px hsla(220, 100%, 75%, 0.95),
      0 0 16px hsla(220, 100%, 65%, 0.55),
      0 0 25px hsla(220, 100%, 55%, 0.25);
  }
  50% {
    box-shadow:
      0 0 6px hsla(330, 100%, 80%, 0.95),
      0 0 16px hsla(330, 100%, 70%, 0.55),
      0 0 25px hsla(330, 100%, 60%, 0.25);
  }
  54% {
    box-shadow:
      0 0 6px hsla(20, 100%, 80%, 0.95),
      0 0 16px hsla(20, 100%, 70%, 0.55),
      0 0 25px hsla(20, 100%, 60%, 0.25);
  }
  58% {
    box-shadow:
      0 0 6px hsla(0, 100%, 75%, 0.95),
      0 0 16px hsla(0, 100%, 65%, 0.55),
      0 0 25px hsla(0, 100%, 55%, 0.25);
  }
  62% {
    box-shadow:
      0 0 6px hsla(20, 100%, 80%, 0.95),
      0 0 16px hsla(20, 100%, 70%, 0.55),
      0 0 25px hsla(20, 100%, 60%, 0.25);
  }
  66% {
    box-shadow:
      0 0 6px hsla(280, 100%, 80%, 0.95),
      0 0 16px hsla(280, 100%, 70%, 0.55),
      0 0 25px hsla(280, 100%, 60%, 0.25);
  }
  70% {
    box-shadow:
      0 0 6px hsla(180, 100%, 75%, 0.95),
      0 0 16px hsla(180, 100%, 65%, 0.55),
      0 0 25px hsla(180, 95%, 55%, 0.25);
  }
  74% {
    box-shadow:
      0 0 6px hsla(100, 100%, 75%, 0.95),
      0 0 16px hsla(100, 100%, 65%, 0.55),
      0 0 25px hsla(100, 100%, 55%, 0.25);
  }
  78% {
    box-shadow:
      0 0 6px hsla(40, 100%, 80%, 0.95),
      0 0 16px hsla(40, 100%, 70%, 0.55),
      0 0 25px hsla(40, 100%, 60%, 0.25);
  }
  82% {
    box-shadow:
      0 0 6px hsla(220, 100%, 75%, 0.95),
      0 0 16px hsla(220, 100%, 65%, 0.55),
      0 0 25px hsla(220, 100%, 55%, 0.25);
  }
  86% {
    box-shadow:
      0 0 6px hsla(330, 100%, 80%, 0.95),
      0 0 16px hsla(330, 100%, 70%, 0.55),
      0 0 25px hsla(330, 100%, 60%, 0.25);
  }
  90% {
    box-shadow:
      0 0 6px hsla(0, 100%, 75%, 0.95),
      0 0 16px hsla(0, 100%, 65%, 0.55),
      0 0 25px hsla(0, 100%, 55%, 0.25);
  }
  94% {
    box-shadow:
      0 0 6px hsla(220, 100%, 75%, 0.95),
      0 0 16px hsla(220, 100%, 65%, 0.55),
      0 0 25px hsla(220, 100%, 55%, 0.25);
  }
  98% {
    box-shadow:
      0 0 6px hsla(20, 100%, 80%, 0.95),
      0 0 16px hsla(20, 100%, 70%, 0.55),
      0 0 25px hsla(20, 100%, 60%, 0.25);
  }
}
:root.dark .music-container {
  background: rgba(20, 20, 30, 0.55);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}
:root.dark .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
:root.dark .list-wrap {
  background: rgba(30, 30, 40, 0.95);
  backdrop-filter: blur(16px);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

@media (max-width: 600px) {
  .music-container {
    right: 12px;
    bottom: 12px;
    padding: 10px 12px;
    gap: 8px;
  }
  .play-btn {
    width: 38px;
    height: 38px;
    font-size: 14px;
  }
  .nav-btn {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }
  .volume-slider {
    width: 40px;
  }
  .info {
    width: 100px;
  }
}
</style>
