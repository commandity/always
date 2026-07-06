<script setup lang="ts">
import { ref, computed } from "vue";

// FIB-4 = (Age × AST) / (Platelets × √ALT).  Sterling 2006.
type Etio = "nafld" | "hcv" | "hbv" | "alcohol" | "general";
const etiologies: { key: Etio; label: string; sub: string }[] = [
  {
    key: "nafld",
    label: "NAFLD / MASLD",
    sub: "非酒精性 / 代謝相關脂肪肝病 · 最常用情境",
  },
  { key: "hcv", label: "慢性 C 型肝炎（HCV）", sub: "原始驗證族群 · Sterling 2006" },
  {
    key: "hbv",
    label: "慢性 B 型肝炎（HBV）",
    sub: "已在 HBV 族群驗證，臺灣常見",
  },
  { key: "alcohol", label: "酒精性肝病", sub: "AST/ALT 比值常 > 2，需謹慎解讀" },
  { key: "general", label: "其他 / 一般", sub: "使用標準通用閾值（1.30 / 2.67）" },
];

const activeTab = ref<"fib4">("fib4");
const etiology = ref<Etio | null>(null);
const age = ref<number | null>(null);
const ast = ref<number | null>(null);
const alt = ref<number | null>(null);
const platelets = ref<number | null>(null);
const showResults = ref(false);
const copied = ref(false);

function num(e: Event): number | null {
  const v = +(e.target as HTMLInputElement).value;
  return v > 0 ? v : null;
}

const isComplete = computed(
  () =>
    etiology.value !== null &&
    age.value !== null &&
    ast.value !== null &&
    alt.value !== null &&
    platelets.value !== null,
);
const fib4 = computed<number | null>(() => {
  if (!isComplete.value) return null;
  const v =
    (age.value! * ast.value!) / (platelets.value! * Math.sqrt(alt.value!));
  return Number.isFinite(v) ? Math.round(v * 100) / 100 : null;
});
const isElderly = computed(() => (age.value ?? 0) >= 65);
const lowT = computed(() => (isElderly.value ? 2.0 : 1.3));
const highT = computed(() => (isElderly.value ? 4.0 : 2.67));
const zone = computed<"low" | "indeterminate" | "high" | null>(() => {
  if (fib4.value === null) return null;
  if (fib4.value < lowT.value) return "low";
  if (fib4.value > highT.value) return "high";
  return "indeterminate";
});
const astAltRatio = computed(() =>
  ast.value && alt.value ? Math.round((ast.value / alt.value) * 100) / 100 : null,
);

const result = computed(() => {
  if (fib4.value === null) return null;
  const f = fib4.value.toFixed(2);
  if (zone.value === "low")
    return {
      color: "normal",
      tag: "低風險",
      level: "低風險 — 晚期纖維化不太可能",
      advice: `FIB-4 ${f}，低於低風險閾值（< ${lowT.value}${isElderly.value ? "，年齡校正" : ""}）。晚期纖維化（F3–F4）陰性預測值約 90%，可暫不需進一步侵入性檢查。`,
    };
  if (zone.value === "high")
    return {
      color: "critical",
      tag: "高風險",
      level: "高風險 — 晚期纖維化 / 肝硬化可能性高",
      advice: `FIB-4 ${f}，高於高風險閾值（> ${highT.value}${isElderly.value ? "，年齡校正" : ""}）。晚期纖維化陽性預測值約 80%，建議轉介肝膽科並評估肝硬化與併發症。`,
    };
  return {
    color: "moderate",
    tag: "不確定",
    level: "不確定區間 — 需進一步評估",
    advice: `FIB-4 ${f}，落在不確定區間（${lowT.value}–${highT.value}）。建議以肝彈性造影（FibroScan / 震波彈性造影）或其他檢查進一步分層。`,
  };
});

const badgeNum = computed(() =>
  fib4.value !== null ? fib4.value.toFixed(2) : "—",
);
const badgeColor = computed(() => result.value?.color ?? "filling");

function reset() {
  etiology.value = null;
  age.value = null;
  ast.value = null;
  alt.value = null;
  platelets.value = null;
  showResults.value = false;
}
function generateMarkdown() {
  if (fib4.value === null) return "# FIB-4 肝纖維化指數評估\n\n尚未完成輸入。";
  const e = etiologies.find((x) => x.key === etiology.value)?.label ?? "";
  return (
    `# FIB-4 肝纖維化指數評估結果\n\n` +
    `- **病因情境**：${e}\n` +
    `- **年齡**：${age.value} 歲　**AST**：${ast.value} U/L　**ALT**：${alt.value} U/L　**血小板**：${platelets.value} ×10⁹/L\n` +
    `- **FIB-4 指數**：${fib4.value.toFixed(2)}\n` +
    `- **適用閾值**：低 < ${lowT.value}　高 > ${highT.value}${isElderly.value ? "（年齡 ≥ 65 校正）" : ""}\n` +
    `- **風險分層**：${result.value!.level}\n` +
    `- **建議**：${result.value!.advice}`
  );
}
async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <div class="fib4assess">
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'fib4' }"
        @click="activeTab = 'fib4'"
      >
        <span class="tab-label">FIB-4 肝纖維化指數</span>
        <span class="tab-sub">Fibrosis-4 Index for Liver Fibrosis</span>
      </button>
    </div>

    <div v-show="activeTab === 'fib4'" class="fib4">
      <div class="sb-header">
        <div class="header-title">
          <h2 class="title">FIB-4 指數</h2>
          <p class="subtitle">
            Fibrosis-4 Index · 非侵入性肝纖維化篩查（Sterling 2006）
          </p>
        </div>
        <div class="score-badge" :class="badgeColor">
          <span class="badge-top">FIB-4</span>
          <span class="score-number">{{ badgeNum }}</span>
          <span class="score-label">{{ result ? result.tag : "輸入資料" }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="badgeColor"
            :style="{
              width: fib4 !== null ? Math.min((fib4 / 6) * 100, 100) + '%' : '0%',
            }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-normal">0</span
          ><span class="tk-normal">{{ lowT }}</span
          ><span class="tk-severe">{{ highT }}</span
          ><span>6+</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◆</span>
        <span
          >FIB-4 =（年齡 × AST）÷（血小板 ×
          √ALT）。選擇病因情境並輸入四項數值即可分層晚期纖維化（F3–F4）風險；<strong>年齡
          ≥ 65 歲</strong>自動採用校正閾值以降低偽陽性。</span
        >
      </div>

      <!-- Etiology -->
      <div class="sb-group">
        <div class="group-header fib-group-header">
          <div class="group-label-block">
            <span class="group-label">病因情境</span>
            <span class="group-sub">影響閾值判讀 · 單選</span>
          </div>
        </div>
        <div class="etio-list">
          <div
            v-for="e in etiologies"
            :key="e.key"
            class="etio-item"
            :class="{ selected: etiology === e.key }"
            @click="etiology = e.key"
          >
            <div
              class="etio-radio"
              :class="{ selected: etiology === e.key }"
            >
              <div class="etio-dot" v-if="etiology === e.key" />
            </div>
            <div class="etio-content">
              <span class="etio-label">{{ e.label }}</span>
              <span class="etio-sub">{{ e.sub }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Inputs -->
      <div class="sb-group">
        <div class="group-header fib-group-header">
          <div class="group-label-block">
            <span class="group-label">實驗室數值</span>
            <span class="group-sub">年齡 · AST · ALT · 血小板</span>
          </div>
        </div>
        <div class="input-grid">
          <div class="input-field">
            <span class="field-label">年齡（歲）</span>
            <input
              type="number"
              class="num-input"
              placeholder="例：58"
              :value="age ?? ''"
              @input="age = num($event)"
            />
          </div>
          <div class="input-field">
            <span class="field-label">AST（U/L）</span>
            <input
              type="number"
              class="num-input"
              placeholder="例：45"
              :value="ast ?? ''"
              @input="ast = num($event)"
            />
          </div>
          <div class="input-field">
            <span class="field-label">ALT（U/L）</span>
            <input
              type="number"
              class="num-input"
              placeholder="例：38"
              :value="alt ?? ''"
              @input="alt = num($event)"
            />
          </div>
          <div class="input-field">
            <span class="field-label">血小板（×10⁹/L）</span>
            <input
              type="number"
              class="num-input"
              placeholder="例：180"
              :value="platelets ?? ''"
              @input="platelets = num($event)"
            />
          </div>
        </div>
      </div>

      <!-- Result -->
      <div v-if="result" class="sb-result" :class="badgeColor">
        <div class="result-left">
          <span class="result-number">{{ fib4!.toFixed(2) }}</span>
        </div>
        <div class="result-right">
          <div class="result-top">
            <span class="result-level">{{ result.level }}</span>
          </div>
          <span class="result-ahi"
            >適用閾值：低 &lt; {{ lowT }} · 高 &gt; {{ highT
            }}<template v-if="isElderly"> · 年齡 ≥ 65 校正</template></span
          >
          <span class="result-advice">{{ result.advice }}</span>
          <div class="result-sub-scores">
            <span class="sub-pill-sm fib-sm">{{ result.tag }}</span>
            <span v-if="astAltRatio !== null" class="sub-pill-sm fib-sm"
              >AST/ALT {{ astAltRatio }}</span
            >
          </div>
        </div>
      </div>
      <div v-else class="empty-note">
        <span class="note-icon">◆</span>
        <span>請選擇病因情境並輸入四項數值以計算 FIB-4 指數。</span>
      </div>

      <div v-if="showResults && result" class="results-detail">
        <div class="results-header">計算明細</div>
        <div class="detail-row">
          <span class="detail-domain">分子（年齡 × AST）</span>
          <span class="detail-score">{{ (age! * ast!).toLocaleString() }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-domain">分母（血小板 × √ALT）</span>
          <span class="detail-score">{{
            (platelets! * Math.sqrt(alt!)).toFixed(1)
          }}</span>
        </div>
        <div class="detail-row total-row">
          <span class="detail-domain">FIB-4 指數</span>
          <span class="detail-score positive">{{ fib4!.toFixed(2) }}</span>
          <span class="detail-desc">{{ result.tag }}</span>
        </div>
      </div>

      <div class="sb-actions">
        <button
          class="btn-view"
          :disabled="!result"
          @click="showResults = !showResults"
        >
          {{ showResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" :disabled="!result" @click="copyMarkdown">
          {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="reset">重置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fib4assess {
  max-width: 820px;
  margin: 0 auto;
}
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
}
.tab-btn.active .tab-sub {
  color: var(--vp-c-brand-1);
  opacity: 0.85;
}
.fib4 {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.sb-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
/* Panel subtitle — unified 0.82rem / text-2 */
.subtitle {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin: 0;
}
/* ── Score badge — enlarged + rearranged ── */
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* fixed size so the header row never reflows when the value appears */
  width: 136px;
  min-width: 136px;
  height: 108px;
  padding: 0.45rem 0.9rem;
  overflow: hidden;
  border-radius: 14px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition:
    border-color 0.3s,
    color 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.badge-top {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  margin-bottom: 1px;
}
.score-number {
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1.05;
}
.score-label {
  font-size: 0.74rem;
  font-weight: 700;
  margin-top: 4px;
  padding: 1px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 12%, transparent);
}
.score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
}
.score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
}
.score-badge.filling {
  color: var(--vp-c-text-3);
}
.score-badge.filling .score-label {
  background: var(--vp-c-bg-mute);
}
.severity-bar-wrap {
  margin-bottom: 1.5rem;
}
.severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
}
.severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.severity-fill.normal {
  background: #22c55e;
}
.severity-fill.moderate {
  background: #f97316;
}
.severity-fill.critical {
  background: #ef4444;
}
.severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
  font-weight: 700;
}
.severity-ticks .tk-normal {
  color: #22c55e;
}
.severity-ticks .tk-severe {
  color: #ef4444;
}
.intro-bar {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--vp-c-brand-1);
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}
.intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
.sb-group {
  margin-bottom: 1.5rem;
}
.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.fib-group-header {
  border-left: 4px solid var(--vp-c-brand-1);
}
.group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
/* Group label — unified 0.92rem / 700 · Group sub — 0.78rem / text-2 */
.group-label {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.group-sub {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
/* ── Etiology selectable list ── */
.etio-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.etio-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}
.etio-item:hover {
  background: var(--vp-c-bg-mute);
}
.etio-item.selected {
  border-color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 8%, var(--vp-c-bg));
}
.etio-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}
.etio-radio.selected {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
}
.etio-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
}
.etio-content {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.etio-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.etio-sub {
  font-size: 0.76rem;
  color: var(--vp-c-text-3);
}
/* ── Inputs ── */
.input-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}
.input-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.num-input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  -moz-appearance: textfield;
}
.num-input::-webkit-outer-spin-button,
.num-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.num-input::placeholder {
  font-weight: 400;
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
}
.num-input:focus {
  border-color: var(--vp-c-brand-1);
}
/* ── Result card ── */
.sb-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-result.normal {
  border-color: #22c55e;
}
.sb-result.moderate {
  border-color: #f97316;
}
.sb-result.critical {
  border-color: #ef4444;
}
.result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
  min-width: 84px;
  justify-content: center;
}
.result-number {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.sb-result.normal .result-number {
  color: #22c55e;
}
.sb-result.moderate .result-number {
  color: #f97316;
}
.sb-result.critical .result-number {
  color: #ef4444;
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
/* Section question title — unified 0.95rem / 700 */
.result-level {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-ahi {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
.result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.result-sub-scores {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
/* Sub-score pill — label/val unified 0.75 / 0.85rem */
.sub-pill-sm {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 2px 12px;
  border-radius: 999px;
}
.fib-sm {
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  color: var(--vp-c-brand-1);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}
.empty-note {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border: 1px dashed var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
  margin-bottom: 1rem;
}
.note-icon {
  color: var(--vp-c-brand-1);
}
/* ── Results detail ── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}
/* Results header — unified 0.74rem / 700 */
.results-header {
  padding: 0.6rem 1rem;
  background: var(--vp-c-bg-mute);
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--vp-c-divider);
}
.detail-row:first-of-type {
  border-top: none;
}
/* Detail domain / desc — unified 0.82 / 0.78rem */
.detail-domain {
  flex: 1;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}
.detail-score {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.detail-score.positive {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  min-width: 60px;
  text-align: right;
}
.total-row {
  background: var(--vp-c-bg-mute);
  font-weight: 700;
}
/* ── Actions ── */
.sb-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.btn-view,
.btn-copy,
.btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.btn-view {
  border: none;
  background: var(--vp-c-brand-1);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.btn-view:disabled,
.btn-copy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
@media (max-width: 640px) {
  .tab-label {
    font-size: 0.9rem;
  }
  .input-grid {
    grid-template-columns: 1fr;
  }
  .result-number {
    font-size: 2.6rem;
  }
}
</style>
