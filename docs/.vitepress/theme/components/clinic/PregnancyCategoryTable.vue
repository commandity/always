<script setup lang="ts">
import { ref, computed } from "vue";
import {
  DRUGS,
  SPECIALTY_LABELS,
  CATEGORY_LABELS,
  type Specialty,
  type PregnancyCategory,
} from "./pregnancyCategories";

// ── 篩選狀態 ──────────────────────────────────
const keyword = ref("");
const activeSpecialty = ref<Specialty | "ALL">("ALL");
const activeCategories = ref<Set<PregnancyCategory>>(new Set());
const sortKey = ref<"inn" | "category">("inn");
const sortAsc = ref(true);

// 科別下拉選項（含全部）
const specialtyOptions = computed(() =>
  (["ALL", ...Object.keys(SPECIALTY_LABELS)] as (Specialty | "ALL")[]).map(
    (key) => ({
      key,
      label: key === "ALL" ? "全部科別" : SPECIALTY_LABELS[key as Specialty],
    }),
  ),
);

const categoryOrder: PregnancyCategory[] = ["A", "B", "C", "D", "X", "NR"];

// 分級 → CSS class（預先映射，避免 template 內三元運算，利於 SSR hydration）
const categoryClassMap: Record<PregnancyCategory, string> = {
  A: "is-a",
  B: "is-b",
  C: "is-c",
  D: "is-d",
  X: "is-x",
  NR: "is-nr",
};

function toggleCategory(cat: PregnancyCategory) {
  const next = new Set(activeCategories.value);
  if (next.has(cat)) next.delete(cat);
  else next.add(cat);
  activeCategories.value = next;
}

function setSort(key: "inn" | "category") {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value;
  else {
    sortKey.value = key;
    sortAsc.value = true;
  }
}

function resetFilters() {
  keyword.value = "";
  activeSpecialty.value = "ALL";
  activeCategories.value = new Set();
}

// ── 預先計算的列資料（每列已附 badgeClass 與顯示用欄位）──
const rows = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  const cats = activeCategories.value;
  const spec = activeSpecialty.value;

  const filtered = DRUGS.filter((d) => {
    if (spec !== "ALL" && !d.specialty.includes(spec)) return false;
    if (cats.size > 0 && !cats.has(d.category)) return false;
    if (kw) {
      const hay = `${d.inn} ${d.classZh} ${d.noteZh ?? ""}`.toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    return true;
  });

  const dir = sortAsc.value ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    if (sortKey.value === "category") {
      const ai = categoryOrder.indexOf(a.category);
      const bi = categoryOrder.indexOf(b.category);
      if (ai !== bi) return (ai - bi) * dir;
      return a.inn.localeCompare(b.inn);
    }
    return a.inn.localeCompare(b.inn) * dir;
  });

  return sorted.map((d) => ({
    inn: d.inn,
    category: d.category,
    categoryDetail: d.categoryDetail ?? "",
    badgeClass: categoryClassMap[d.category],
    specialtyLabels: d.specialty.map((s) => SPECIALTY_LABELS[s]).join("、"),
    classZh: d.classZh,
    noteZh: d.noteZh ?? "",
  }));
});

const total = DRUGS.length;
const resultCount = computed(() => rows.value.length);
const sortInnArrow = computed(() =>
  sortKey.value === "inn" ? (sortAsc.value ? "▲" : "▼") : "",
);
const sortCatArrow = computed(() =>
  sortKey.value === "category" ? (sortAsc.value ? "▲" : "▼") : "",
);
</script>

<template>
  <div class="pt-wrap">
    <div class="tab-bar">
      <button class="tab-btn active">
        <span class="tab-label">孕婦用藥分級</span>
        <span class="tab-sub">Pregnancy Drug Category</span>
      </button>
    </div>
    <div class="preg-table">
      <!-- 控制列 -->
      <div class="preg-table controls">
        <input
          v-model="keyword"
          class="preg-table search"
          type="search"
          placeholder="搜尋學名、藥理分類或備註…"
          aria-label="搜尋藥品"
        />
        <select
          v-model="activeSpecialty"
          class="preg-table select"
          aria-label="選擇科別"
        >
          <option
            v-for="opt in specialtyOptions"
            :key="opt.key"
            :value="opt.key"
          >
            {{ opt.label }}
          </option>
        </select>
        <button class="preg-table reset" type="button" @click="resetFilters">
          清除篩選
        </button>
      </div>

      <!-- 分級篩選 chips -->
      <div class="preg-table chips">
        <button
          v-for="cat in categoryOrder"
          :key="cat"
          type="button"
          class="preg-table chip"
          :class="[
            categoryClassMap[cat],
            { 'is-active': activeCategories.has(cat) },
          ]"
          :aria-pressed="activeCategories.has(cat)"
          @click="toggleCategory(cat)"
        >
          {{ cat }}
        </button>
      </div>

      <!-- 分級說明 -->
      <details class="preg-table legend">
        <summary class="preg-table legend-summary">分級含義說明</summary>
        <dl class="preg-table legend-dl">
          <div
            v-for="(label, cat) in CATEGORY_LABELS"
            :key="cat"
            class="preg-table legend-item"
          >
            <dt class="preg-table legend-cat" :class="categoryClassMap[cat]">
              {{ cat }}
            </dt>
            <dd class="preg-table legend-desc">{{ label }}</dd>
          </div>
        </dl>
      </details>

      <p class="preg-table count">顯示 {{ resultCount }} / {{ total }} 項</p>

      <!-- 桌面表格 -->
      <table class="preg-table grid">
        <thead>
          <tr>
            <th class="preg-table sortable" scope="col" @click="setSort('inn')">
              學名 (INN)
              <span class="preg-table arrow">{{ sortInnArrow }}</span>
            </th>
            <th
              class="preg-table sortable"
              scope="col"
              @click="setSort('category')"
            >
              分級 <span class="preg-table arrow">{{ sortCatArrow }}</span>
            </th>
            <th scope="col">藥理分類</th>
            <th scope="col">科別</th>
            <th scope="col">備註 / 孕期細節</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.inn">
            <td class="preg-table inn">{{ row.inn }}</td>
            <td>
              <span class="preg-table badge" :class="row.badgeClass">{{
                row.category
              }}</span>
            </td>
            <td>{{ row.classZh }}</td>
            <td class="preg-table spec">{{ row.specialtyLabels }}</td>
            <td class="preg-table note">
              <span v-if="row.categoryDetail" class="preg-table detail">{{
                row.categoryDetail
              }}</span>
              <span>{{ row.noteZh }}</span>
            </td>
          </tr>
          <tr v-if="resultCount === 0">
            <td colspan="5" class="preg-table empty">
              查無符合條件的藥品，請調整搜尋或篩選。
            </td>
          </tr>
        </tbody>
      </table>

      <p class="preg-table disclaimer">
        分級為歷史 FDA A/B/C/D/X 字母（FDA 已於 2015 年改採 PLLR
        敘述式仿單），台灣仍廣泛沿用。 學名一律不譯；處方前請核對最新仿單。
      </p>
    </div>
  </div>
</template>

<style scoped>
.pt-wrap {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.preg-table {
  --pt-radius: 8px;
}

div.preg-table.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0 12px;
}

input.preg-table.search {
  flex: 1 1 240px;
  min-width: 0;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--pt-radius);
}
input.preg-table.search:focus {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 1px;
  border-color: var(--vp-c-brand-1);
}

select.preg-table.select {
  padding: 8px 12px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--pt-radius);
}

button.preg-table.reset {
  padding: 8px 14px;
  font-size: 14px;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--pt-radius);
  cursor: pointer;
}
button.preg-table.reset:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand-1);
}

div.preg-table.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

button.preg-table.chip {
  min-width: 40px;
  padding: 5px 12px;
  font-weight: 600;
  font-size: 13px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: filter 0.15s ease;
}
button.preg-table.chip:hover {
  filter: brightness(0.97);
}
button.preg-table.chip.is-active {
  color: var(--vp-c-white);
}

p.preg-table.count {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

table.preg-table.grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  display: table;
}
table.preg-table.grid th,
table.preg-table.grid td {
  padding: 10px 12px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--vp-c-divider);
}
table.preg-table.grid thead th {
  background-color: var(--vp-c-bg-soft);
  font-weight: 600;
  color: var(--vp-c-text-1);
  position: sticky;
  top: 0;
}
table.preg-table.grid tbody tr:hover {
  background-color: var(--vp-c-bg-soft);
}

th.preg-table.sortable {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
span.preg-table.arrow {
  color: var(--vp-c-brand-1);
  font-size: 11px;
}

td.preg-table.inn {
  font-weight: 600;
  white-space: nowrap;
}
td.preg-table.spec {
  color: var(--vp-c-text-2);
  white-space: nowrap;
}
td.preg-table.note span.preg-table.detail {
  display: inline-block;
  margin-right: 6px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
td.preg-table.empty {
  padding: 24px;
  text-align: center;
  color: var(--vp-c-text-2);
}

/* 分級徽章與 chip 配色（柔色底 + 語意色）*/
span.preg-table.badge {
  display: inline-block;
  min-width: 22px;
  padding: 2px 8px;
  font-weight: 700;
  text-align: center;
  border-radius: 6px;
}
span.preg-table.badge.is-a,
button.preg-table.chip.is-a.is-active {
  background-color: var(--vp-c-green-1);
}
span.preg-table.badge.is-b,
button.preg-table.chip.is-b.is-active {
  background-color: var(--vp-c-green-2);
}
span.preg-table.badge.is-c,
button.preg-table.chip.is-c.is-active {
  background-color: var(--vp-c-yellow-1);
}
span.preg-table.badge.is-d,
button.preg-table.chip.is-d.is-active {
  background-color: var(--vp-c-red-1);
}
span.preg-table.badge.is-x,
button.preg-table.chip.is-x.is-active {
  background-color: var(--vp-c-red-2);
}
span.preg-table.badge.is-nr,
button.preg-table.chip.is-nr.is-active {
  background-color: var(--vp-c-gray-1);
}

span.preg-table.badge.is-a,
span.preg-table.badge.is-b {
  color: var(--vp-c-white);
}
span.preg-table.badge.is-c {
  color: #3a2e00;
}
span.preg-table.badge.is-d,
span.preg-table.badge.is-x {
  color: var(--vp-c-white);
}
span.preg-table.badge.is-nr {
  color: var(--vp-c-text-1);
}

/* Category C — light mode: --vp-c-yellow-1 is a dark amber, so brighten the
   badge background for readable contrast against the dark text */
:root:not(.dark) span.preg-table.badge.is-c,
:root:not(.dark) button.preg-table.chip.is-c.is-active {
  background-color: #f5c518;
  color: #3a2e00;
}

details.preg-table.legend {
  margin: 4px 0 10px;
  font-size: 13px;
}
summary.preg-table.legend-summary {
  cursor: pointer;
  color: var(--vp-c-text-2);
  font-weight: 600;
  user-select: none;
}
summary.preg-table.legend-summary:hover {
  color: var(--vp-c-brand-1);
}
dl.preg-table.legend-dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 16px;
  margin: 8px 0 0;
  padding: 8px 12px;
  background: var(--vp-c-bg-soft);
  border-radius: var(--pt-radius);
}
div.preg-table.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
dt.preg-table.legend-cat {
  display: inline-block;
  min-width: 22px;
  padding: 1px 8px;
  font-weight: 700;
  font-size: 12px;
  text-align: center;
  border-radius: 6px;
  color: var(--vp-c-white);
}
dt.preg-table.legend-cat.is-a {
  background-color: var(--vp-c-green-1);
}
dt.preg-table.legend-cat.is-b {
  background-color: var(--vp-c-green-2);
}
dt.preg-table.legend-cat.is-c {
  background-color: var(--vp-c-yellow-1);
  color: #3a2e00;
}
dt.preg-table.legend-cat.is-d {
  background-color: var(--vp-c-red-1);
}
dt.preg-table.legend-cat.is-x {
  background-color: var(--vp-c-red-2);
}
dt.preg-table.legend-cat.is-nr {
  background-color: var(--vp-c-gray-1);
  color: var(--vp-c-text-1);
}
dd.preg-table.legend-desc {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 12px;
}
table.preg-table.legend-tbl td {
  padding: 5px 8px;
  vertical-align: middle;
}
td.preg-table.legend-badge {
  width: 48px;
  text-align: center;
}
span.preg-table.legend-cat {
  display: inline-block;
  min-width: 22px;
  padding: 1px 8px;
  font-weight: 700;
  font-size: 12px;
  text-align: center;
  border-radius: 6px;
  color: var(--vp-c-white);
}
span.preg-table.legend-cat.is-a {
  background-color: var(--vp-c-green-1);
}
span.preg-table.legend-cat.is-b {
  background-color: var(--vp-c-green-2);
}
span.preg-table.legend-cat.is-c {
  background-color: var(--vp-c-yellow-1);
  color: #3a2e00;
}
span.preg-table.legend-cat.is-d {
  background-color: var(--vp-c-red-1);
}
span.preg-table.legend-cat.is-x {
  background-color: var(--vp-c-red-2);
}
span.preg-table.legend-cat.is-nr {
  background-color: var(--vp-c-gray-1);
  color: var(--vp-c-text-1);
}
td.preg-table.legend-desc {
  color: var(--vp-c-text-2);
  font-size: 12px;
}
div.preg-table.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
dt.preg-table.legend-cat {
  display: inline-block;
  min-width: 22px;
  padding: 1px 8px;
  font-weight: 700;
  font-size: 12px;
  text-align: center;
  border-radius: 6px;
  color: var(--vp-c-white);
}
dt.preg-table.legend-cat.is-a {
  background-color: var(--vp-c-green-1);
}
dt.preg-table.legend-cat.is-b {
  background-color: var(--vp-c-green-2);
}
dt.preg-table.legend-cat.is-c {
  background-color: var(--vp-c-yellow-1);
  color: #3a2e00;
}
dt.preg-table.legend-cat.is-d {
  background-color: var(--vp-c-red-1);
}
dt.preg-table.legend-cat.is-x {
  background-color: var(--vp-c-red-2);
}
dt.preg-table.legend-cat.is-nr {
  background-color: var(--vp-c-gray-1);
  color: var(--vp-c-text-1);
}
dd.preg-table.legend-desc {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

p.preg-table.disclaimer {
  margin-top: 14px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-soft);
  border-left: 3px solid var(--vp-c-brand-1);
  border-radius: var(--pt-radius);
}

/* 行動裝置：表格轉為卡片 */
@media (max-width: 640px) {
  table.preg-table.grid thead {
    display: none;
  }
  table.preg-table.grid,
  table.preg-table.grid tbody,
  table.preg-table.grid tr,
  table.preg-table.grid td {
    display: block;
    width: 100%;
  }
  table.preg-table.grid tr {
    margin-bottom: 12px;
    border: 1px solid var(--vp-c-divider);
    border-radius: var(--pt-radius);
    overflow: hidden;
  }
  table.preg-table.grid td {
    border-bottom: 1px solid var(--vp-c-divider);
  }
  table.preg-table.grid td:last-child {
    border-bottom: none;
  }
  .tab-label {
    font-size: 0.9rem;
  }
  .tab-sub {
    font-size: 0.72rem;
  }
}

/* ── Tab bar ────────────────────────────────────────────────────── */
.tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--vp-c-bg-mute);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
}
.tab-btn {
  flex: 1;
  padding: 0.65rem 1rem;
  background: transparent;
  border: 1.5px solid transparent;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-3);
  border-radius: 8px;
  transition: all 0.2s;
}
.tab-btn:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}
.tab-btn.active {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
}
.tab-label {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.02em;
}
.tab-sub {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-top: 2px;
  letter-spacing: 0.01em;
}
.tab-btn.active .tab-sub {
  color: var(--vp-c-brand-1);
  opacity: 0.85;
}
</style>
