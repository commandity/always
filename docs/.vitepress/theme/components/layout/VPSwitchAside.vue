<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vitepress";
import { useMediaQuery } from "@vueuse/core";
import VPSwitch from "vitepress/dist/client/theme-default/components/VPSwitch.vue";
import { showAside, originalAsideDisabled } from "./asideStore";

const route = useRoute();
const is1280 = useMediaQuery("(min-width: 1280px)");

const PREFIXES = ["/guide", "/reference", "/blog"] as const;

function matchP(p: string) {
  return (
    route.path.startsWith(p + "/") || route.path === p || route.path === p + "/"
  );
}

const show = computed(
  () => PREFIXES.some(matchP) && is1280.value && !originalAsideDisabled.value,
);

function toggle() {
  showAside.value = !showAside.value;
}
</script>

<template>
  <VPSwitch
    v-if="show"
    title="切換側邊大綱"
    class="VPSwitchAside"
    :aria-checked="showAside"
    @click="toggle"
  >
    <span class="vpi-outline aside-icon" />
  </VPSwitch>
</template>

<style scoped>
.aside-icon {
  opacity: 1;
}

/* Inverted: ON = check on LEFT (show aside, which is on the right) */
/* OFF = check on RIGHT (hide aside) */
.VPSwitchAside :deep(.check) {
  transform: translateX(18px);
}

.VPSwitchAside[aria-checked="true"] :deep(.check) {
  transform: translateX(0);
}

.dark .VPSwitchAside :deep(.check) {
  background-color: var(--vp-c-bg);
}

@media (max-width: 1279px) {
  .VPSwitchAside {
    display: none;
  }
}
</style>

<style>
.vpi-outline {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='currentColor' stroke-linecap='round' stroke-width='1.5' viewBox='0 0 12 12'%3E%3Cpath d='M2 3h8M2 6h8M2 9h8'/%3E%3C/svg%3E");
}
</style>
