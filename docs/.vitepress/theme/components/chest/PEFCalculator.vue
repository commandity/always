<script setup lang="ts">
import { ref, computed } from "vue";

// Adults (18–85y): Nunn & Gregg, BMJ 1989 · Children (5–17y): Knudson (height-based)
type Sex = "male" | "female";

const activeTab = ref<"pef">("pef");
const sex = ref<Sex | null>(null);
const age = ref<number | null>(null);
const heightCm = ref<number | null>(null);
const measured = ref<number | null>(null);
const showResults = ref(false);
const copied = ref(false);

function num(e: Event): number | null {
  const v = +(e.target as HTMLInputElement).value;
  return v > 0 ? v : null;
}

const group = computed<"child" | "adult" | null>(() => {
  if (age.value === null) return null;
  if (age.value >= 5 && age.value < 18) return "child";
  if (age.value >= 18 && age.value <= 85) return "adult";
  return null;
});
const rangeNote = computed(() => {
  if (age.value === null) return null;
  if (age.value < 5) return "年齡 < 5 歲：超出參考方程式適用範圍。";
  if (age.value > 85) return "年齡 > 85 歲：超出方程式驗證範圍，僅供參考。";
  return null;
});
const isComplete = computed(
  () =>
    sex.value !== null &&
    age.value !== null &&
    heightCm.value !== null &&
    group.value !== null,
);

const predictedPEF = computed<number | null>(() => {
  if (!isComplete.value) return null;
  const h = heightCm.value!,
    a = age.value!,
    s = sex.value!;
  if (group.value === "adult")
    return s === "male"
      ? Math.round(5.48 * h - 1.93 * a - 454)
      : Math.round(3.72 * h - 2.24 * a + 2);
  return s === "male" ? Math.round(5.49 * h - 441) : Math.round(3.94 * h - 281);
});
const pctPredicted = computed<number | null>(() =>
  predictedPEF.value && measured.value
    ? Math.round((measured.value / predictedPEF.value) * 100)
    : null,
);
const green80 = computed(() =>
  predictedPEF.value ? Math.round(predictedPEF.value * 0.8) : null,
);
const yellow50 = computed(() =>
  predictedPEF.value ? Math.round(predictedPEF.value * 0.5) : null,
);

const zone = computed<"green" | "yellow" | "red" | null>(() => {
  if (pctPredicted.value === null) return null;
  if (pctPredicted.value >= 80) return "green";
  if (pctPredicted.value >= 50) return "yellow";
  return "red";
});
const zoneMap = {
  green: {
    color: "normal",
    level: "綠色區域 — 肺功能良好",
    tag: "Green ≥ 80%",
    advice: "實測 ≥ 80% 預測值，落在綠色安全區，氣道功能控制良好，維持現行治療。",
  },
  yellow: {
    color: "mild",
    level: "黃色區域 — 需注意氣道狀態",
    tag: "Yellow 50–79%",
    advice:
      "實測 50–79% 預測值，落在黃色警示區，氣道可能部分阻塞或哮喘未完全控制，依氣喘行動計畫調整用藥。",
  },
  red: {
    color: "severe",
    level: "紅色區域 — 需立即處理",
    tag: "Red < 50%",
    advice:
      "實測 < 50% 預測值，落在紅色緊急區，可能為急性發作或急性加重，立即使用急救吸入劑並儘速就醫。",
  },
} as const;
const result = computed(() => (zone.value ? zoneMap[zone.value] : null));

const badgeNum = computed(() => {
  if (pctPredicted.value !== null) return pctPredicted.value + "%";
  if (predictedPEF.value !== null) return String(predictedPEF.value);
  return "—";
});
const badgeTag = computed(() => {
  if (result.value) return result.value.tag;
  if (predictedPEF.value !== null) return "L/min 預測";
  return "輸入資料";
});
const badgeColor = computed(() => result.value?.color ?? "filling");

function reset() {
  sex.value = null;
  age.value = null;
  heightCm.value = null;
  measured.value = null;
  showResults.value = false;
}
function generateMarkdown() {
  if (!predictedPEF.value) return "# PEF 峰值呼氣流速預測\n\n尚未完成輸入。";
  const src = group.value === "adult" ? "Nunn & Gregg 1989" : "Knudson（身高）";
  let md =
    `# PEF 峰值呼氣流速預測結果\n\n` +
    `- **性別**：${sex.value === "male" ? "男性" : "女性"}\n` +
    `- **年齡**：${age.value} 歲（${group.value === "adult" ? "成人" : "兒童"}）\n` +
    `- **身高**：${heightCm.value} cm\n` +
    `- **預測 PEF**：${predictedPEF.value} L/min（${src}）\n` +
    `- **綠色下限（80%）**：${green80.value} L/min\n` +
    `- **黃色下限（50%）**：${yellow50.value} L/min\n`;
  if (measured.value && result.value)
    md +=
      `\n## 實測比較\n\n- **實測 PEF**：${measured.value} L/min（${pctPredicted.value}% 預測值）\n` +
      `- **分區**：${result.value.level}\n- **建議**：${result.value.advice}`;
  return md;
}
async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <div class="pefassess">
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'pef' }"
        @click="activeTab = 'pef'"
      >
        <span class="tab-label">PEF 峰值呼氣流速預測</span>
        <span class="tab-sub">Peak Expiratory Flow Predicted</span>
      </button>
    </div>

    <div v-show="activeTab === 'pef'" class="pef">
      <div class="sb-header">
        <div class="header-title">
          <h2 class="title">PEF 預測</h2>
          <p class="subtitle">
            Predicted Peak Expiratory Flow · 峰值呼氣流速預測（Nunn & Gregg /
            Knudson）
          </p>
        </div>
        <div class="score-badge" :class="badgeColor">
          <span class="score-number">{{ badgeNum }}</span>
          <span class="score-label">{{ badgeTag }}</span>
        </div>
      </div>

      <div v-if="pctPredicted !== null" class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="badgeColor"
            :style="{ width: Math.min(pctPredicted, 100) + '%' }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-severe">0</span><span class="tk-severe">50%</span
          ><span class="tk-mild">80%</span><span class="tk-normal">100%</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◆</span>
        <span
          >輸入性別、年齡與身高計算<strong>預測 PEF</strong>；年齡自動判定成人（Nunn
          & Gregg）或兒童（Knudson，身高導向）方程式。可另輸入實測值以判定綠 /
          黃 / 紅氣喘行動分區。</span
        >
      </div>

      <!-- Inputs -->
      <div class="sb-group">
        <div class="group-header pef-group-header">
          <div class="group-label-block">
            <span class="group-label">基本資料</span>
            <span class="group-sub">性別 · 年齡 · 身高</span>
          </div>
        </div>

        <div class="input-grid">
          <div class="input-field">
            <span class="field-label">性別</span>
            <div class="sex-btns">
              <button
                class="sex-btn"
                :class="{ 'sex-active': sex === 'male' }"
                @click="sex = 'male'"
              >
                男性
              </button>
              <button
                class="sex-btn"
                :class="{ 'sex-active-f': sex === 'female' }"
                @click="sex = 'female'"
              >
                女性
              </button>
            </div>
          </div>
          <div class="input-field">
            <span class="field-label">年齡（歲）</span>
            <input
              type="number"
              class="num-input"
              placeholder="5–85"
              :value="age ?? ''"
              @input="age = num($event)"
            />
          </div>
          <div class="input-field">
            <span class="field-label">身高（cm）</span>
            <input
              type="number"
              class="num-input"
              placeholder="例：170"
              :value="heightCm ?? ''"
              @input="heightCm = num($event)"
            />
          </div>
          <div class="input-field">
            <span class="field-label"
              >實測 PEF（L/min）<span class="opt-tag">選填</span></span
            >
            <input
              type="number"
              class="num-input"
              placeholder="用於分區"
              :value="measured ?? ''"
              @input="measured = num($event)"
            />
          </div>
        </div>
        <div v-if="rangeNote" class="range-note">⚠ {{ rangeNote }}</div>
      </div>

      <!-- Result -->
      <div
        v-if="predictedPEF !== null"
        class="sb-result"
        :class="badgeColor"
      >
        <div class="result-left">
          <span class="result-number">{{ predictedPEF }}</span>
          <span class="result-max">L/min</span>
        </div>
        <div class="result-right">
          <div class="result-top">
            <span class="result-level">{{
              result ? result.level : "預測峰值呼氣流速"
            }}</span>
          </div>
          <span class="result-ahi"
            >{{ group === "adult" ? "Nunn & Gregg 1989" : "Knudson（身高導向）"
            }}<template v-if="pctPredicted !== null">
              · 實測 {{ measured }} L/min（{{ pctPredicted }}%）</template
            ></span
          >
          <span class="result-advice">{{
            result
              ? result.advice
              : "此為預測值，請與實際峰速儀測量值比較評估肺功能。"
          }}</span>
          <div class="result-sub-scores">
            <span class="sub-pill-sm green-sm">綠 ≥ {{ green80 }}</span>
            <span class="sub-pill-sm yellow-sm">黃 {{ yellow50 }}–{{ green80 }}</span>
            <span class="sub-pill-sm red-sm">紅 &lt; {{ yellow50 }}</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-note">
        <span class="note-icon">◆</span>
        <span>請輸入性別、年齡與身高以計算預測 PEF。</span>
      </div>

      <div v-if="showResults && predictedPEF !== null" class="results-detail">
        <div class="results-header">評估明細</div>
        <div class="detail-row">
          <span class="detail-domain">預測 PEF</span>
          <span class="detail-score positive">{{ predictedPEF }} L/min</span>
        </div>
        <div class="detail-row">
          <span class="detail-domain">綠色區下限（80% 預測）</span>
          <span class="detail-score">{{ green80 }} L/min</span>
        </div>
        <div class="detail-row">
          <span class="detail-domain">黃色區下限（50% 預測）</span>
          <span class="detail-score">{{ yellow50 }} L/min</span>
        </div>
        <div v-if="pctPredicted !== null" class="detail-row total-row">
          <span class="detail-domain">實測 / 預測</span>
          <span class="detail-score positive">{{ pctPredicted }}%</span>
          <span class="detail-desc">{{ result?.tag }}</span>
        </div>
      </div>

      <div class="sb-actions">
        <button
          class="btn-view"
          :disabled="predictedPEF === null"
          @click="showResults = !showResults"
        >
          {{ showResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button
          class="btn-copy"
          :disabled="predictedPEF === null"
          @click="copyMarkdown"
        >
          {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="reset">重置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pefassess {
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
.pef {
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
.subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-number {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
}
.score-label {
  font-size: 0.64rem;
  font-weight: 700;
  margin-top: 3px;
  text-align: center;
}
.score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
}
.score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
}
.score-badge.filling {
  color: var(--vp-c-text-3);
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
.severity-fill.mild {
  background: #f59e0b;
}
.severity-fill.severe {
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
.severity-ticks .tk-mild {
  color: #f59e0b;
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
.pef-group-header {
  border-left: 4px solid var(--vp-c-brand-1);
}
.group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.group-label {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.group-sub {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
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
  display: flex;
  align-items: center;
  gap: 6px;
}
.opt-tag {
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 0 6px;
}
.sex-btns {
  display: flex;
  gap: 0.5rem;
}
.sex-btn {
  flex: 1;
  padding: 0.6rem 0;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.sex-btn:hover {
  border-color: var(--vp-c-text-3);
}
.sex-btn.sex-active {
  border-color: #3b82f6;
  color: #3b82f6;
  background: color-mix(in srgb, rgb(59, 130, 246) 14%, var(--vp-c-bg));
}
.sex-btn.sex-active-f {
  border-color: #ec4899;
  color: #ec4899;
  background: color-mix(in srgb, rgb(236, 72, 153) 14%, var(--vp-c-bg));
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
.num-input:focus {
  border-color: var(--vp-c-brand-1);
}
.range-note {
  margin-top: 0.6rem;
  font-size: 0.78rem;
  color: #d97706;
  font-weight: 600;
}
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
.sb-result.mild {
  border-color: #f59e0b;
}
.sb-result.severe {
  border-color: #ef4444;
}
.sb-result.filling {
  border-color: var(--vp-c-brand-1);
}
.result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.result-number {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-brand-1);
  transition: color 0.3s;
}
.sb-result.normal .result-number {
  color: #22c55e;
}
.sb-result.mild .result-number {
  color: #f59e0b;
}
.sb-result.severe .result-number {
  color: #ef4444;
}
.result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.result-top {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
.result-level {
  font-size: 1.05rem;
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
.sub-pill-sm {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.green-sm {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.3);
}
.yellow-sm {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
.red-sm {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
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
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.results-header {
  padding: 0.6rem 1rem;
  background: var(--vp-c-bg-mute);
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.82rem;
}
.detail-row:first-of-type {
  border-top: none;
}
.detail-domain {
  flex: 1;
  color: var(--vp-c-text-2);
}
.detail-score {
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.detail-score.positive {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  min-width: 70px;
  text-align: right;
}
.total-row {
  background: var(--vp-c-bg-mute);
  font-weight: 700;
}
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
    font-size: 2.4rem;
  }
}
</style>
