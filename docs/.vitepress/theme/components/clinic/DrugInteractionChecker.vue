<script setup lang="ts">
import { ref, computed } from "vue";
import {
  DDI_LIST,
  DFI_LIST,
  ALL_DRUGS,
  SEVERITY_LABELS,
  SEVERITY_CLASS,
  SEVERITY_RANK,
  displayDrug,
  type Severity,
} from "./drugInteractions";

// ── 選藥狀態 ──────────────────────────────────
const query = ref("");
const selected = ref<string[]>([]);
const activeSuggestion = ref(0);

const selectedSet = computed(() => new Set(selected.value));

// 搜尋建議（排除已選）
const suggestions = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return [];
  return ALL_DRUGS.filter(
    (d) => d.includes(q) && !selectedSet.value.has(d),
  ).slice(0, 8);
});

function addDrug(name: string) {
  const n = name.trim().toLowerCase();
  if (!n || selectedSet.value.has(n)) return;
  selected.value = [...selected.value, n];
  query.value = "";
  activeSuggestion.value = 0;
}
function removeDrug(name: string) {
  selected.value = selected.value.filter((d) => d !== name);
}
function clearAll() {
  selected.value = [];
  query.value = "";
}
function onEnter() {
  const s = suggestions.value;
  if (s.length) addDrug(s[activeSuggestion.value] ?? s[0]);
  else if (query.value.trim()) {
    // 允許直接加入完全相符者
    const exact = ALL_DRUGS.find((d) => d === query.value.trim().toLowerCase());
    if (exact) addDrug(exact);
  }
}
function onArrow(dir: number) {
  const n = suggestions.value.length;
  if (!n) return;
  activeSuggestion.value = (activeSuggestion.value + dir + n) % n;
}

// ── 結果 ──────────────────────────────────────
const single = computed(() => selected.value.length === 1);
const hasSelection = computed(() => selected.value.length > 0);

// 藥物–藥物：單一藥品 → 該藥所有；多藥 → 所選之間配對
const ddiResults = computed(() => {
  const set = selectedSet.value;
  if (set.size === 0) return [];
  const list = DDI_LIST.filter((d) => {
    if (single.value)
      return d.a === selected.value[0] || d.b === selected.value[0];
    return set.has(d.a) && set.has(d.b);
  });
  return [...list].sort(
    (x, y) => SEVERITY_RANK[y.severity] - SEVERITY_RANK[x.severity],
  );
});

// 藥物–食物：所有所選藥品之食物交互作用
const dfiResults = computed(() => {
  const set = selectedSet.value;
  if (set.size === 0) return [];
  const list = DFI_LIST.filter((d) => set.has(d.drug));
  return [...list].sort(
    (x, y) => SEVERITY_RANK[y.severity] - SEVERITY_RANK[x.severity],
  );
});

const noResults = computed(
  () =>
    hasSelection.value &&
    ddiResults.value.length === 0 &&
    dfiResults.value.length === 0,
);

function sevLabel(s: Severity) {
  return SEVERITY_LABELS[s];
}
function sevClass(s: Severity) {
  return SEVERITY_CLASS[s];
}

const legend: { s: Severity }[] = [
  { s: "contraindicated" },
  { s: "major" },
  { s: "moderate" },
  { s: "minor" },
];
</script>

<template>
  <div class="dxi">
    <!-- 搜尋列 -->
    <div class="dxi search-row">
      <div class="dxi search-wrap">
        <input
          v-model="query"
          class="dxi search"
          type="search"
          placeholder="輸入藥品學名（INN），可加入多個…"
          aria-label="搜尋藥品"
          autocomplete="off"
          @keydown.enter.prevent="onEnter"
          @keydown.down.prevent="onArrow(1)"
          @keydown.up.prevent="onArrow(-1)"
        />
        <ul v-if="suggestions.length" class="dxi suggest">
          <li
            v-for="(s, i) in suggestions"
            :key="s"
            class="dxi suggest-item"
            :class="{ active: i === activeSuggestion }"
            @mousedown.prevent="addDrug(s)"
            @mouseenter="activeSuggestion = i"
          >
            {{ displayDrug(s) }}
          </li>
        </ul>
      </div>
      <button v-if="hasSelection" class="dxi clear-btn" @click="clearAll">
        清除
      </button>
    </div>

    <!-- 已選藥品 -->
    <div v-if="hasSelection" class="dxi chips">
      <span v-for="d in selected" :key="d" class="dxi drug-chip">
        {{ displayDrug(d) }}
        <button
          class="dxi chip-x"
          :aria-label="`移除 ${displayDrug(d)}`"
          @click="removeDrug(d)"
        >
          ×
        </button>
      </span>
    </div>

    <!-- 提示 -->
    <p class="dxi hint">
      <template v-if="!hasSelection"
        >輸入一個藥品可查看其所有已知藥物與食物交互作用；輸入多個藥品可檢查彼此之間是否有交互作用。</template
      >
      <template v-else-if="single"
        >顯示
        <strong>{{ displayDrug(selected[0]) }}</strong>
        的所有已知交互作用。</template
      >
      <template v-else
        >檢查所選
        {{ selected.length }} 種藥品之間及各自的食物交互作用。</template
      >
    </p>

    <!-- 無結果 -->
    <div v-if="noResults" class="dxi empty">
      本清單未收錄所選藥品的交互作用。<br />
      <span class="dxi empty-sub"
        >「未收錄」不代表安全，請仍以完整交互作用資料庫與仿單確認。</span
      >
    </div>

    <!-- 藥物–藥物 -->
    <section v-if="ddiResults.length" class="dxi block">
      <div class="dxi block-title">
        <span class="dxi block-dot dd">◆</span>
        <span class="dxi block-text">藥物–藥物交互作用</span>
        <span class="dxi block-count">共 {{ ddiResults.length }} 項</span>
      </div>
      <div
        v-for="(d, i) in ddiResults"
        :key="'dd' + i"
        class="dxi card"
        :class="sevClass(d.severity)"
      >
        <div class="dxi card-head">
          <span class="dxi pair">
            {{ displayDrug(d.a) }} <span class="dxi x">＋</span>
            {{ displayDrug(d.b) }}
          </span>
          <span class="dxi badge" :class="sevClass(d.severity)">{{
            sevLabel(d.severity)
          }}</span>
        </div>
        <p class="dxi effect">
          <span class="dxi lbl">後果</span>{{ d.effect }}
        </p>
        <p class="dxi mgmt"><span class="dxi lbl mg">處置</span>{{ d.mgmt }}</p>
      </div>
    </section>

    <!-- 藥物–食物 -->
    <section v-if="dfiResults.length" class="dxi block">
      <div class="dxi block-title">
        <span class="dxi block-dot df">◆</span>
        <span class="dxi block-text">藥物–食物交互作用</span>
        <span class="dxi block-count">共 {{ dfiResults.length }} 項</span>
      </div>
      <div
        v-for="(d, i) in dfiResults"
        :key="'df' + i"
        class="dxi card"
        :class="sevClass(d.severity)"
      >
        <div class="dxi card-head">
          <span class="dxi pair">
            {{ displayDrug(d.drug) }} <span class="dxi x">＋</span>
            <span class="dxi food">{{ d.food }}</span>
          </span>
          <span class="dxi badge" :class="sevClass(d.severity)">{{
            sevLabel(d.severity)
          }}</span>
        </div>
        <p class="dxi effect">
          <span class="dxi lbl">後果</span>{{ d.effect }}
        </p>
        <p class="dxi mgmt"><span class="dxi lbl mg">處置</span>{{ d.mgmt }}</p>
      </div>
    </section>

    <!-- 圖例 -->
    <div class="dxi legend">
      <span class="dxi legend-title">嚴重度</span>
      <span
        v-for="l in legend"
        :key="l.s"
        class="dxi badge legend-badge"
        :class="sevClass(l.s)"
        >{{ sevLabel(l.s) }}</span
      >
    </div>

    <p class="dxi disclaimer">
      本工具為教學參考之常見交互作用摘要，並非完整清單；學名以 INN
      列示。實際處方請以最新仿單與專業交互作用資料庫為準。
    </p>
  </div>
</template>

<style scoped>
.dxi {
  margin: 8px 0 4px;
}

/* 搜尋列 */
.dxi.search-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}
.dxi.search-wrap {
  position: relative;
  flex: 1;
}
/* Padding-based sizing (matches PregnancyCategoryTable) so the input and
   清除 button share the same height automatically. */
.dxi.search {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-sizing: border-box;
}
.dxi.search:focus {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 1px;
  border-color: var(--vp-c-brand-1);
}
.dxi.suggest {
  position: absolute;
  z-index: 20;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 4px;
  list-style: none;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}
.dxi.suggest-item {
  padding: 8px 11px;
  border-radius: 6px;
  font-size: 15px;
  cursor: pointer;
  color: var(--vp-c-text-1);
}
.dxi.suggest-item.active,
.dxi.suggest-item:hover {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
/* Matches the 清除篩選 (reset) button in PregnancyCategoryTable. */
.dxi.clear-btn {
  padding: 8px 14px;
  font-size: 14px;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
}
.dxi.clear-btn:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand-1);
}

/* 已選藥品 chips */
.dxi.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.dxi.drug-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 7px 5px 13px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 999px;
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.dxi.chip-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  box-sizing: border-box;
  transform: translateY(-3px);
  border: none;
  border-radius: 50%;
  background-color: transparent;
  color: var(--vp-c-brand-1);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}
.dxi.chip-x:hover {
  background-color: var(--vp-c-brand-1);
  color: #fff;
}

.dxi.hint {
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

/* 無結果 */
.dxi.empty {
  padding: 24px 18px;
  text-align: center;
  font-size: 15px;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft);
  border: 1px dashed var(--vp-c-divider);
  border-radius: 10px;
  margin-bottom: 14px;
  line-height: 1.7;
}
.dxi.empty-sub {
  font-size: 13px;
  color: var(--vp-c-text-3);
}

/* 區塊 */
.dxi.block {
  margin-bottom: 18px;
}
.dxi.block-title {
  display: flex !important;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--vp-c-text-1);
  border: none;
  padding: 0;
}
.dxi.block-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
  padding: 0 0 5px;
}
.dxi.block-dot.dd {
  color: #e74c3c;
}
.dxi.block-dot.df {
  color: #e67e22;
}
.dxi.block-text {
  line-height: 1.2;
}
.dxi.block-count {
  display: inline-flex;
  align-items: center;
  align-self: center;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  background-color: var(--vp-c-brand-soft);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
  border-radius: 999px;
  padding: 2px 10px;
  line-height: 1.2;
  white-space: nowrap;
}

/* 交互作用卡片 */
.dxi.card {
  border: 1px solid var(--vp-c-divider);
  border-left-width: 4px;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 10px;
  background-color: var(--vp-c-bg-soft);
}
.dxi.card.is-x {
  border-left-color: #b03a2e;
}
.dxi.card.is-major {
  border-left-color: #e74c3c;
}
.dxi.card.is-mod {
  border-left-color: #e6a817;
}
.dxi.card.is-minor {
  border-left-color: var(--vp-c-gray-1);
}
.dxi.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.dxi.pair {
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.dxi.x {
  color: var(--vp-c-text-3);
  font-weight: 400;
  margin: 0 2px;
}
.dxi.food {
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.dxi.effect,
.dxi.mgmt {
  margin: 5px 0;
  font-size: 14.5px;
  line-height: 1.7;
  color: var(--vp-c-text-1);
}
.dxi.lbl {
  display: inline-block;
  min-width: 36px;
  margin-right: 8px;
  padding: 1px 7px;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  border-radius: 4px;
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

/* 嚴重度徽章 — 明暗模式皆易讀 */
.dxi.badge {
  display: inline-block;
  min-width: 48px;
  padding: 3px 12px;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
  border-radius: 999px;
  white-space: nowrap;
}
.dxi.badge.is-x {
  background-color: #b03a2e;
  color: #fff;
}
.dxi.badge.is-major {
  background-color: #e74c3c;
  color: #fff;
}
.dxi.badge.is-mod {
  background-color: #f5c518;
  color: #3a2e00;
}
.dxi.badge.is-minor {
  background-color: var(--vp-c-gray-1);
  color: var(--vp-c-text-1);
}

/* 圖例 */
.dxi.legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 0 4px;
  border-top: 1px solid var(--vp-c-divider);
}
.dxi.legend-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-right: 2px;
}
.dxi.disclaimer {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-3);
}

@media (max-width: 640px) {
  .dxi.card-head {
    flex-wrap: wrap;
  }
}
</style>
