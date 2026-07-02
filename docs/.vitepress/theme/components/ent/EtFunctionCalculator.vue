<script setup lang="ts">
import { ref } from "vue";
import Etdq7Calculator from "./Etdq7Calculator.vue";

const activeTab = ref<"etdq7">("etdq7");
</script>

<template>
  <div class="tab-selector">
    <div class="tab-bar">
      <button class="tab-btn active" @click="activeTab = 'etdq7'">
        <span class="tab-label">ETDQ-7 耳咽管功能障礙問卷</span>
        <span class="tab-sub">Eustachian Tube Dysfunction Questionnaire</span>
      </button>
    </div>
    <Etdq7Calculator v-show="activeTab === 'etdq7'" />
  </div>
</template>

<style scoped>
.tab-selector {
  max-width: 820px;
  margin: 0 auto;
}
.tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 1.5rem;
}
.tab-btn {
  position: relative;
  padding: 0.65rem 1.25rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-3);
  margin-bottom: -1px;
  transition: color 0.2s;
  white-space: nowrap;
}
.tab-btn:hover {
  color: var(--vp-c-text-1);
}
.tab-btn.active {
  color: var(--vp-c-brand-1);
}
.tab-btn::after {
  content: "";
  position: absolute;
  bottom: 0;
  inset-inline: 1.25rem;
  height: 2px;
  background: transparent;
  transition: background 0.2s;
}
.tab-btn.active::after {
  background: var(--vp-c-brand-1);
}
.tab-label {
  display: block;
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.3;
}
.tab-sub {
  display: block;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  margin-top: 1px;
}
@media (max-width: 640px) {
  .tab-btn {
    padding: 0.5rem 0.85rem;
  }
  .tab-label {
    font-size: 0.8rem;
  }
  .tab-sub {
    font-size: 0.6rem;
  }
}
</style>
