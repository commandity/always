<script setup lang="ts">
import { ref, computed } from "vue";
// Hume formula (W=kg, H=cm):
//   Male:   LBW = 0.32810×W + 0.33929×H − 29.5336
//   Female: LBW = 0.29569×W + 0.41813×H − 43.2933
// Boer formula:
//   Male:   LBW = 0.407×W + 0.267×H − 19.2
//   Female: LBW = 0.252×W + 0.473×H − 48.3
// James formula (pharmacokinetic, BMI-based):
//   Male:   LBW = 1.10×W − 0.0128×BMI×W
//   Female: LBW = 1.07×W − 0.0148×BMI×W
// Peters (children ≤14): LBW = 3.8 × 0.0215 × W^0.6469 × H^0.7236

type Sex = "M" | "F";
const sex = ref<Sex>("M");
const weightVal = ref("");
const heightVal = ref("");
const copied = ref(false);
const showResults = ref(false);

const W = computed(() => {
  const v = parseFloat(weightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const H = computed(() => {
  const v = parseFloat(heightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const isComplete = computed(() => W.value !== null && H.value !== null);
const Hm = computed(() => (H.value ? H.value / 100 : null));
const bmi = computed(() =>
  W.value && Hm.value
    ? Math.round((W.value / (Hm.value * Hm.value)) * 10) / 10
    : null,
);

const humeRaw = computed(() => {
  if (!W.value || !H.value) return null;
  if (sex.value === "M") return 0.3281 * W.value + 0.33929 * H.value - 29.5336;
  return 0.29569 * W.value + 0.41813 * H.value - 43.2933;
});
const lbwHume = computed(() =>
  humeRaw.value !== null ? Math.round(humeRaw.value * 10) / 10 : null,
);

const boerRaw = computed(() => {
  if (!W.value || !H.value) return null;
  if (sex.value === "M") return 0.407 * W.value + 0.267 * H.value - 19.2;
  return 0.252 * W.value + 0.473 * H.value - 48.3;
});
const lbwBoer = computed(() =>
  boerRaw.value !== null ? Math.round(boerRaw.value * 10) / 10 : null,
);

const jamesRaw = computed(() => {
  if (!W.value || !bmi.value) return null;
  if (sex.value === "M") return 1.1 * W.value - 0.0128 * bmi.value * W.value;
  return 1.07 * W.value - 0.0148 * bmi.value * W.value;
});
const lbwJames = computed(() =>
  jamesRaw.value !== null ? Math.round(jamesRaw.value * 10) / 10 : null,
);

// Body fat % derived from Hume LBW
const fatPct = computed(() => {
  if (!lbwHume.value || !W.value) return null;
  return Math.round((1 - lbwHume.value / W.value) * 100 * 10) / 10;
});

const severity = computed(() => {
  if (!lbwHume.value) return "pending";
  if (fatPct.value === null) return "normal";
  if (sex.value === "M") {
    if (fatPct.value <= 17) return "normal";
    if (fatPct.value <= 24) return "mild";
    return "moderate";
  } else {
    if (fatPct.value <= 24) return "normal";
    if (fatPct.value <= 31) return "mild";
    return "moderate";
  }
});

function generateOutput() {
  return (
    `# 瘦體重（Lean Body Weight）計算\n\n` +
    `## 輸入資料\n- 性別：${sex.value === "M" ? "男性" : "女性"}\n` +
    `- 體重：${W.value ?? "—"} kg\n- 身高：${H.value ?? "—"} cm\n- BMI：${bmi.value ?? "—"} kg/m²\n\n` +
    `## 結果\n` +
    `- **LBW（Hume）= ${lbwHume.value ?? "—"} kg**\n` +
    `- LBW（Boer）= ${lbwBoer.value ?? "—"} kg\n` +
    `- LBW（James）= ${lbwJames.value ?? "—"} kg\n` +
    `- 估算體脂率（Hume）= ${fatPct.value ?? "—"}%`
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateOutput());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
function reset() {
  weightVal.value = "";
  heightVal.value = "";
  sex.value = "M";
  showResults.value = false;
}
</script>

<template>
  <div class="lbw">
    <div class="lbw-header">
      <div class="header-title">
        <h2 class="title">Lean Body Weight 瘦體重計算</h2>
        <p class="subtitle">
          Lean Body Weight · Hume / Boer / James 三公式比較 · 用於藥物劑量計算
        </p>
      </div>
      <div class="score-badge" :class="severity">
        <span class="badge-label">LBW (Hume)</span>
        <span class="score-number">{{ lbwHume ?? "—" }}</span>
        <span class="score-unit" :style="{ opacity: lbwHume ? 1 : 0 }">kg</span>
        <span class="score-label">{{
          fatPct !== null ? "體脂 " + fatPct + "%" : "—"
        }}</span>
      </div>
    </div>

    <!-- Sex tab -->
    <div class="nihss-group">
      <div class="group-header-bar sex-bar">
        <span class="group-icon">👤</span>
        <span class="group-label-text">性別選擇</span>
        <span class="group-sub-text">各公式係數因性別而異</span>
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active-m': sex === 'M' }"
          @click="sex = 'M'"
        >
          <span class="tab-title">♂ 男性（Male）</span>
          <span class="tab-sub">Hume: 0.328W + 0.339H − 29.53</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-f': sex === 'F' }"
          @click="sex = 'F'"
        >
          <span class="tab-title">♀ 女性（Female）</span>
          <span class="tab-sub">Hume: 0.296W + 0.418H − 43.29</span>
        </button>
      </div>
    </div>

    <!-- Inputs -->
    <div class="nihss-group">
      <div class="group-header-bar input-bar">
        <span class="group-icon">📏</span>
        <span class="group-label-text">身體數值輸入</span>
        <span class="group-sub-text">W = kg · H = cm</span>
        <span
          class="group-score-tally"
          :class="sex === 'M' ? 'male-tally' : 'female-tally'"
          >{{ lbwHume ? lbwHume + " kg" : "—" }}</span
        >
      </div>
      <div class="group-items">
        <div class="ens-item" :class="{ answered: W !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Wt</span></div>
            <div class="item-name-block">
              <span class="item-name">體重 Body Weight</span>
              <span class="item-sub"
                >使用實際體重（Actual Body Weight）。Hume 與 Boer
                公式使用體重與身高；James 公式使用體重與 BMI</span
              >
            </div>
            <span class="item-score" :class="{ zero: W === null }"
              >{{ W ?? "—" }}<small v-if="W"> kg</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="weightVal"
              type="number"
              min="20"
              max="400"
              step="0.1"
              placeholder="kg"
              class="lbw-input"
            />
            <span class="input-unit">kg</span>
          </div>
        </div>
        <div class="ens-item" :class="{ answered: H !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Ht</span></div>
            <div class="item-name-block">
              <span class="item-name">身高 Height</span>
              <span class="item-sub"
                >Hume 和 Boer 公式需要身高（公分）。James 公式僅使用體重與
                BMI</span
              >
            </div>
            <span class="item-score" :class="{ zero: H === null }"
              >{{ H ?? "—" }}<small v-if="H"> cm</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="heightVal"
              type="number"
              min="100"
              max="250"
              step="0.1"
              placeholder="cm"
              class="lbw-input"
            />
            <span class="input-unit">cm</span>
          </div>
        </div>
        <div class="ens-item derived-item" v-if="bmi">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum bmi-q">BMI</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">身體質量指數（自動計算）</span>
              <span class="item-sub"
                >BMI = {{ W }} ÷ {{ Hm?.toFixed(2) }}² =
                {{ bmi }} kg/m²　→　用於 James 公式</span
              >
            </div>
            <span class="item-score" style="color: #06b6d4">{{ bmi }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Results comparison table -->
    <div class="lbw-table" v-if="lbwHume || lbwBoer || lbwJames">
      <div class="lt-header">三公式比較結果</div>
      <div class="lt-row lt-main">
        <span class="lt-method">Hume（首選）</span>
        <span class="lt-formula"
          >{{ sex === "M" ? "0.328" : "0.296" }}×{{ W }} +
          {{ sex === "M" ? "0.339" : "0.418" }}×{{ H }} −
          {{ sex === "M" ? "29.53" : "43.29" }}</span
        >
        <span class="lt-result">{{ lbwHume ?? "—" }} kg</span>
        <span class="lt-note">臨床最廣泛使用</span>
      </div>
      <div class="lt-row">
        <span class="lt-method">Boer</span>
        <span class="lt-formula"
          >{{ sex === "M" ? "0.407" : "0.252" }}×{{ W }} +
          {{ sex === "M" ? "0.267" : "0.473" }}×{{ H }} −
          {{ sex === "M" ? "19.2" : "48.3" }}</span
        >
        <span class="lt-result">{{ lbwBoer ?? "—" }} kg</span>
        <span class="lt-note">CT 顯影劑劑量</span>
      </div>
      <div class="lt-row">
        <span class="lt-method">James</span>
        <span class="lt-formula"
          >{{ sex === "M" ? "1.10" : "1.07" }}×{{ W }} −
          {{ sex === "M" ? "0.0128" : "0.0148" }}×{{ bmi ?? "—" }}×{{ W }}</span
        >
        <span class="lt-result">{{ lbwJames ?? "—" }} kg</span>
        <span class="lt-note">藥代動力學</span>
      </div>
      <div class="lt-row lt-fat" v-if="fatPct !== null">
        <span class="lt-method">體脂率估算</span>
        <span class="lt-formula">1 − ({{ lbwHume }} ÷ {{ W }}) × 100</span>
        <span class="lt-result" :class="severity">{{ fatPct }}%</span>
        <span class="lt-note">基於 Hume LBW</span>
      </div>
    </div>

    <!-- Result card -->
    <div class="ens-result" :class="severity">
      <div class="result-left">
        <span class="result-number">{{ lbwHume ?? "—" }}</span>
        <span class="result-max" v-if="lbwHume">kg</span>
      </div>
      <div class="result-right">
        <span class="result-level">瘦體重（Hume 公式）</span>
        <span class="result-advice" v-if="lbwHume">
          Boer = {{ lbwBoer }} kg · James = {{ lbwJames }} kg
        </span>
        <span class="result-sub" v-if="fatPct !== null"
          >估算體脂率 {{ fatPct }}%（基於 Hume）</span
        >
      </div>
    </div>

    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >James 公式在 BMI &gt; 30（男性）或 &gt;
        35（女性）的肥胖患者中可能出現異常值（LBW 接近或超過
        TBW）；此情況建議改用 Boer
        公式。瘦體重估算值僅供藥物劑量計算參考，不能取代 DEXA
        等客觀測量方式。</span
      >
    </div>

    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <!-- FIXED: detail-score now shows ♂/♀ symbol; detail-desc shows 男性/女性 label -->
      <div class="detail-row">
        <span class="detail-qnum">Sex</span>
        <span class="detail-domain">性別</span>
        <span class="detail-score">{{ sex === "M" ? "♂" : "♀" }}</span>
        <span class="detail-desc">{{ sex === "M" ? "男性" : "女性" }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Wt</span
        ><span class="detail-domain">體重</span
        ><span class="detail-score">{{ W ?? "—" }}</span
        ><span class="detail-desc">kg</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Ht</span
        ><span class="detail-domain">身高</span
        ><span class="detail-score">{{ H ?? "—" }}</span
        ><span class="detail-desc">cm</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">BMI</span
        ><span class="detail-domain">身體質量指數</span
        ><span class="detail-score">{{ bmi ?? "—" }}</span
        ><span class="detail-desc">kg/m²</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Boer</span
        ><span class="detail-domain">LBW（Boer 公式）</span
        ><span class="detail-score">{{ lbwBoer ?? "—" }}</span
        ><span class="detail-desc">kg</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">James</span
        ><span class="detail-domain">LBW（James 公式）</span
        ><span class="detail-score">{{ lbwJames ?? "—" }}</span
        ><span class="detail-desc">kg</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">Hume</span>
        <span class="detail-domain">瘦體重（Hume — 主要結果）</span>
        <span class="detail-score detail-score-brand">{{
          lbwHume ?? "—"
        }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">kg</span>
          <span class="detail-desc-label">體脂 {{ fatPct ?? "—" }}%</span>
        </div>
      </div>
    </div>

    <div class="ens-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyOutput">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">請輸入體重及身高</p>
  </div>
</template>

<style scoped>
.lbw {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.lbw-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap;
}
.header-title {
  flex: 1;
  min-width: 0;
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
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.score-badge {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  min-height: 88px;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.badge-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.score-number {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
}
.score-unit {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 1px;
}
.score-label {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 2px;
}
.score-badge.pending {
  color: var(--vp-c-text-3);
}
.score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
}
.score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
}
.nihss-group {
  margin-bottom: 1.5rem;
}
.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #3b82f6;
  margin-bottom: 0.6rem;
}
.sex-bar {
  border-left: 3px solid #6366f1;
}
.input-bar {
  border-left: 3px solid #a855f7;
}
.group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.male-tally {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
}
.female-tally {
  color: #f472b6;
  background: rgba(244, 114, 182, 0.12);
}
.tab-toggle {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.tab-btn {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.65rem 1rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s;
}
.tab-btn.tab-active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.tab-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.tab-sub {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
}
.tab-btn.tab-active .tab-title {
  color: #6366f1;
}
.tab-btn.tab-active-m {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.06);
}
.tab-btn.tab-active-f {
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.06);
}
.tab-btn.tab-active-m .tab-title {
  color: #38bdf8;
}
.tab-btn.tab-active-f .tab-title {
  color: #f472b6;
}
.group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ens-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.ens-item.answered {
  border-color: #a855f7;
}
.ens-item.derived-item {
  border-color: #06b6d4;
  opacity: 0.85;
}
.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.derived-item .item-header {
  border-bottom: none;
}
.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.item-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
  padding: 1px 6px;
  border-radius: 999px;
}
.bmi-q {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.item-score {
  font-size: 0.9rem;
  font-weight: 800;
  color: #a855f7;
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.item-score.zero {
  color: var(--vp-c-text-3);
}
.input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.lbw-input {
  flex: 1;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  font-family: inherit;
  padding: 0.45rem 0.75rem;
  outline: none;
  transition: border-color 0.2s;
  -moz-appearance: textfield;
}
.lbw-input::-webkit-outer-spin-button,
.lbw-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.lbw-input:focus {
  border-color: #a855f7;
}
.lbw-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.lbw-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.lt-header {
  padding: 0.4rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.lt-row {
  display: grid;
  grid-template-columns: 100px 1fr 70px 90px;
  gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.lt-row:last-child {
  border-bottom: none;
}
.lt-main {
  background: var(--vp-c-brand-soft);
}
.lt-fat {
  background: var(--vp-c-bg-mute);
}
.lt-method {
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.lt-formula {
  font-family: monospace;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.lt-result {
  font-weight: 800;
  color: var(--vp-c-brand-1);
}
.lt-result.normal {
  color: #22c55e;
}
.lt-result.mild {
  color: #f59e0b;
}
.lt-result.moderate {
  color: #f97316;
}
.lt-note {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.ens-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: border-color 0.3s;
}
.ens-result.normal {
  border-color: #22c55e;
}
.ens-result.mild {
  border-color: #f59e0b;
}
.ens-result.moderate {
  border-color: #f97316;
}
.result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.result-number {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.ens-result.normal .result-number {
  color: #22c55e;
}
.ens-result.mild .result-number {
  color: #f59e0b;
}
.ens-result.moderate .result-number {
  color: #f97316;
}
.result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
.result-sub {
  font-size: 0.78rem;
  color: var(--vp-c-brand-1);
}
.warn-box {
  display: flex;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.3);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-total {
  background: var(--vp-c-bg-mute);
}
.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #a855f7;
  flex-shrink: 0;
  width: 44px;
  padding-top: 1px;
}
.detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.detail-score-brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
}
.detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
.ens-actions {
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
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.btn-view:active:not(:disabled) {
  transform: translateY(0);
}
.btn-view:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
.progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}
@media (max-width: 640px) {
  .lbw-header {
    flex-direction: column;
  }
  .tab-toggle {
    flex-direction: column;
  }
  .ens-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .lt-row {
    grid-template-columns: 90px 1fr 60px;
  }
  .lt-row span:last-child {
    display: none;
  }
}
</style>
