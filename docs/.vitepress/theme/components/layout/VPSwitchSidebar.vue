<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vitepress";
import VPSwitch from "vitepress/dist/client/theme-default/components/VPSwitch.vue";
import { showSidebar, suppressTransition } from "./sidebarStore";

const route = useRoute();

const PREFIXES = ["/guide", "/reference", "/blog"] as const;

function matchP(p: string) {
  return (
    route.path.startsWith(p + "/") || route.path === p || route.path === p + "/"
  );
}

const show = computed(() => PREFIXES.some(matchP));

function toggle() {
  showSidebar.value = !showSidebar.value;
}
</script>

<template>
  <VPSwitch
    v-if="show"
    title="切換側邊欄"
    class="VPSwitchSidebar"
    :class="{ 'no-transition': suppressTransition }"
    :aria-checked="showSidebar"
    @click="toggle"
  >
    <span class="vpi-hamburger sidebar-icon" />
  </VPSwitch>
</template>

<style scoped>
.sidebar-icon {
  opacity: 1;
}

.VPSwitchSidebar[aria-checked="true"] :deep(.check) {
  transform: translateX(18px);
}

.VPSwitchSidebar.no-transition :deep(.check) {
  transition: none !important;
}

.dark .VPSwitchSidebar :deep(.check) {
  background-color: var(--vp-c-bg);
}
</style>

<style>
.vpi-hamburger {
  --icon: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='currentColor' stroke-linecap='round' stroke-width='1.5' viewBox='0 0 12 12'%3E%3Cpath d='M2 3h8M2 6h8M2 9h8'/%3E%3C/svg%3E");
}
</style>
