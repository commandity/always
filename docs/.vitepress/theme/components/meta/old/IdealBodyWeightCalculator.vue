<script setup lang="ts">
import { ref, computed } from "vue";

// Devine IBW:
// Male:   IBW(kg) = 50 + 2.3 × (height_inches − 60)
// Female: IBW(kg) = 45.5 + 2.3 × (height_inches − 60)
// Only valid for height ≥ 60 inches (152.4 cm)
//
// Adjusted Body Weight (ABW) for obesity (ABW > 130% IBW):
// ABW = IBW + 0.4 × (Actual BW − IBW)
//
// Robinson formula (alternative):
// Male:   IBW(kg) = 52 + 1.9 × (height_inches − 60)
// Female: IBW(kg) = 49 + 1.7 × (height_inches − 60)
//
// Miller formula:
// Male:   IBW(kg) = 56.2 + 1.41 × (height_inches − 60)
// Female: IBW(kg) = 53.1 + 1.36 × (height_inches − 60)

type Sex = "M" | "F";

const sex = ref<Sex>("M");
const heightVal = ref(""); // cm
const weightVal = ref(""); // kg (actual body weight)
const copied = ref(false);
const showResults = ref(false);

const Hcm = computed(() => {
  const v = parseFloat(heightVal.value);
  return isNaN(v) || v < 100 ? null : v;
});
const ABW = computed(() => {
  const v = parseFloat(weightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const Hin = computed(() => (Hcm.value ? Hcm.value / 2.54 : null));
const inchesOver60 = computed(() =>
  Hin.value ? Math.max(Hin.value - 60, 0) : null,
);

const isComplete = computed(() => Hcm.value !== null && ABW.value !== null);
const heightOk = computed(() => Hcm.value !== null && Hcm.value >= 152.4);

// Devine IBW
const ibwDevine = computed(() => {
  if (!heightOk.value || inchesOver60.value === null) return null;
  const base = sex.value === "M" ? 50 : 45.5;
  return Math.round((base + 2.3 * inchesOver60.value) * 10) / 10;
});

// Robinson IBW
const ibwRobinson = computed(() => {
  if (!heightOk.value || inchesOver60.value === null) return null;
  const base = sex.value === "M" ? 52 : 49;
  const k = sex.value === "M" ? 1.9 : 1.7;
  return Math.round((base + k * inchesOver60.value) * 10) / 10;
});

// Miller IBW
const ibwMiller = computed(() => {
  if (!heightOk.value || inchesOver60.value === null) return null;
  const base = sex.value === "M" ? 56.2 : 53.1;
  const k = sex.value === "M" ? 1.41 : 1.36;
  return Math.round((base + k * inchesOver60.value) * 10) / 10;
});

// BMI
const bmi = computed(() => {
  if (!ABW.value || !Hcm.value) return null;
  const hm = Hcm.value / 100;
  return Math.round((ABW.value / (hm * hm)) * 10) / 10;
});

// Obesity check: ABW > 130% of IBW
const isObese130 = computed(() => {
  if (!ibwDevine.value || !ABW.value) return false;
  return ABW.value > 1.3 * ibwDevine.value;
});

const pctIBW = computed(() => {
  if (!ibwDevine.value || !ABW.value) return null;
  return Math.round((ABW.value / ibwDevine.value) * 100);
});

// ABW (Adjusted Body Weight) — for obese patients
const adjBW = computed(() => {
  if (!ibwDevine.value || !ABW.value || !isObese130.value) return null;
  return (
    Math.round((ibwDevine.value + 0.4 * (ABW.value - ibwDevine.value)) * 10) /
    10
  );
});

const severity = computed(() => {
  if (!ibwDevine.value) return "pending";
  if (pctIBW.value !== null && pctIBW.value <= 100) return "normal";
  if (pctIBW.value !== null && pctIBW.value <= 130) return "mild";
  return "moderate";
});

function generateOutput() {
  return (
    `# 理想體重（Devine 法）及調整體重計算\n\n` +
    `## 輸入資料\n- 性別：${sex.value === "M" ? "男性" : "女性"}\n` +
    `- 身高：${Hcm.value ?? "—"} cm（${Hin.value?.toFixed(1) ?? "—"} 英寸）\n` +
    `- 實際體重（ABW）：${ABW.value ?? "—"} kg\n- BMI：${bmi.value ?? "—"} kg/m²\n\n` +
    `## 結果\n` +
    `- **IBW（Devine）= ${ibwDevine.value ?? "—"} kg**\n` +
    `- IBW（Robinson）= ${ibwRobinson.value ?? "—"} kg\n` +
    `- IBW（Miller）= ${ibwMiller.value ?? "—"} kg\n` +
    `- 實際體重為 IBW 的 ${pctIBW.value ?? "—"}%\n` +
    (adjBW.value
      ? `- **調整體重（ABW）= ${adjBW.value} kg**（肥胖：ABW > 130% IBW）`
      : `- 無需計算調整體重（ABW ≤ 130% IBW）`)
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateOutput());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
function reset() {
  heightVal.value = "";
  weightVal.value = "";
  sex.value = "M";
  showResults.value = false;
}
</script>

<template>
  <div class="ibw">
    <div class="ibw-header">
      <div class="header-title">
        <h2 class="title">Ideal Body Weight 理想體重及調整體重</h2>
        <p class="subtitle">
          Ideal Body Weight（Devine 法）& Adjusted Body Weight for Obesity
        </p>
      </div>
      <div class="score-badge" :class="severity">
        <span class="badge-label">Devine IBW</span>
        <span class="score-number">{{ ibwDevine ?? "—" }}</span>
        <span class="score-unit" :style="{ opacity: ibwDevine ? 1 : 0 }"
          >kg</span
        >
        <span class="score-label">{{
          pctIBW !== null ? pctIBW + "% of IBW" : "—"
        }}</span>
      </div>
    </div>

    <!-- Sex tab -->
    <div class="nihss-group">
      <div class="group-header-bar sex-bar">
        <span class="group-icon">👤</span>
        <span class="group-label-text">性別選擇</span>
        <span class="group-sub-text">Devine 公式男女基準值不同</span>
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active-m': sex === 'M' }"
          @click="sex = 'M'"
        >
          <span class="tab-title">♂ 男性（Male）</span>
          <span class="tab-sub">IBW = 50 + 2.3 × (英寸 − 60)</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-f': sex === 'F' }"
          @click="sex = 'F'"
        >
          <span class="tab-title">♀ 女性（Female）</span>
          <span class="tab-sub">IBW = 45.5 + 2.3 × (英寸 − 60)</span>
        </button>
      </div>
    </div>

    <!-- Inputs -->
    <div class="nihss-group">
      <div class="group-header-bar input-bar">
        <span class="group-icon">📏</span>
        <span class="group-label-text">輸入數值</span>
        <span class="group-sub-text">身高需 ≥ 152.4 cm（5 英尺）</span>
      </div>
      <div class="group-items">
        <div
          class="ens-item"
          :class="{
            answered: Hcm !== null,
            'warn-border': Hcm !== null && !heightOk,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Ht</span></div>
            <div class="item-name-block">
              <span class="item-name">身高 Height</span>
              <span class="item-sub"
                >Devine 公式適用於身高 ≥ 152.4 cm（5
                英尺）。公式中自動轉換為英寸（÷ 2.54）</span
              >
            </div>
            <span class="item-score" :class="{ zero: Hcm === null }">
              {{ Hcm ?? "—"
              }}<small v-if="Hcm"> cm（{{ Hin?.toFixed(1) }}" )</small>
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="heightVal"
              type="number"
              min="100"
              max="250"
              step="0.1"
              placeholder="cm"
              class="ibw-input"
            />
            <span class="input-unit">cm</span>
          </div>
          <div class="warn-note" v-if="Hcm !== null && !heightOk">
            ⚠ 身高 &lt; 152.4 cm（5 英尺）：Devine 公式不適用，IBW
            估算可能不準確
          </div>
        </div>
        <div class="ens-item" :class="{ answered: ABW !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">ABW</span></div>
            <div class="item-name-block">
              <span class="item-name">實際體重 Actual Body Weight</span>
              <span class="item-sub"
                >用於計算 %IBW 及判斷是否需要計算調整體重（ABW）</span
              >
            </div>
            <span class="item-score" :class="{ zero: ABW === null }"
              >{{ ABW ?? "—" }}<small v-if="ABW"> kg</small></span
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
              class="ibw-input"
            />
            <span class="input-unit">kg</span>
          </div>
        </div>
        <!-- BMI -->
        <div class="ens-item derived-item" v-if="bmi">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum bmi-q">BMI</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">身體質量指數（自動計算）</span>
              <span class="item-sub"
                >BMI = {{ ABW }} ÷ {{ (Hcm! / 100).toFixed(2) }}² =
                {{ bmi }} kg/m²</span
              >
            </div>
            <span class="item-score" style="color: #06b6d4">{{ bmi }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Results table -->
    <div class="ibw-table" v-if="ibwDevine || ibwRobinson || ibwMiller">
      <div class="it-header">IBW 各公式比較</div>
      <div class="it-row it-main">
        <span class="it-method">Devine（首選）</span>
        <span class="it-formula"
          >{{ sex === "M" ? "50" : "45.5" }} + 2.3 ×
          {{ inchesOver60?.toFixed(1) }}</span
        >
        <span class="it-result">{{ ibwDevine ?? "—" }} kg</span>
      </div>
      <div class="it-row">
        <span class="it-method">Robinson</span>
        <span class="it-formula"
          >{{ sex === "M" ? "52" : "49" }} + {{ sex === "M" ? "1.9" : "1.7" }} ×
          {{ inchesOver60?.toFixed(1) }}</span
        >
        <span class="it-result">{{ ibwRobinson ?? "—" }} kg</span>
      </div>
      <div class="it-row">
        <span class="it-method">Miller</span>
        <span class="it-formula"
          >{{ sex === "M" ? "56.2" : "53.1" }} +
          {{ sex === "M" ? "1.41" : "1.36" }} ×
          {{ inchesOver60?.toFixed(1) }}</span
        >
        <span class="it-result">{{ ibwMiller ?? "—" }} kg</span>
      </div>
      <div class="it-row it-abw" v-if="pctIBW !== null">
        <span class="it-method">%IBW</span>
        <span class="it-formula">{{ ABW }} ÷ {{ ibwDevine }} × 100</span>
        <span class="it-result" :class="isObese130 ? 'obese-text' : 'ok-text'"
          >{{ pctIBW }}%</span
        >
      </div>
      <div class="it-row it-adj" v-if="adjBW">
        <span class="it-method">ABW（調整體重）</span>
        <span class="it-formula"
          >{{ ibwDevine }} + 0.4 × ({{ ABW }} − {{ ibwDevine }})</span
        >
        <span class="it-result adj-color">{{ adjBW }} kg</span>
      </div>
    </div>

    <!-- Obese alert -->
    <div class="obese-alert" v-if="isComplete && isObese130">
      <span class="alert-icon">⚠</span>
      <span>
        <strong>實際體重超過 IBW 的 130%（{{ pctIBW }}%）：</strong>
        建議使用<strong>調整體重（ABW = {{ adjBW }} kg）</strong
        >進行藥物劑量計算（如胺基糖苷類抗生素、Vancomycin 等）。 ABW = IBW + 0.4
        × (ABW − IBW)
      </span>
    </div>

    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >Devine 公式原為 1974
        年藥物劑量計算設計，非用於美學體重管理。不適用於身高 &lt; 152.4 cm（60
        英寸）者；此情況下公式可能低估理想體重，尤其對矮個子女性。ABW
        調整僅適用於 ABW &gt; 130% IBW 的肥胖患者。</span
      >
    </div>

    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-row">
        <span class="detail-qnum">Sex</span
        ><span class="detail-domain">性別</span
        ><span class="detail-score">{{ sex === "M" ? "♂" : "♀" }}</span
        ><span class="detail-desc">{{ sex === "M" ? "男性" : "女性" }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Ht</span
        ><span class="detail-domain">身高</span
        ><span class="detail-score">{{ Hcm ?? "—" }}</span
        ><span class="detail-desc">cm</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Hin</span
        ><span class="detail-domain">身高（英寸）</span
        ><span class="detail-score">{{ Hin?.toFixed(1) ?? "—" }}</span
        ><span class="detail-desc">inches</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">ABW</span
        ><span class="detail-domain">實際體重</span
        ><span class="detail-score">{{ ABW ?? "—" }}</span
        ><span class="detail-desc">kg</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">BMI</span
        ><span class="detail-domain">身體質量指數</span
        ><span class="detail-score">{{ bmi ?? "—" }}</span
        ><span class="detail-desc">kg/m²</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">%IBW</span
        ><span class="detail-domain">實際體重佔 IBW %</span
        ><span class="detail-score">{{ pctIBW ?? "—" }}</span
        ><span class="detail-desc">%</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">IBW</span>
        <span class="detail-domain">理想體重（Devine）</span>
        <span class="detail-score detail-score-brand">{{
          ibwDevine ?? "—"
        }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">kg</span>
          <span class="detail-desc-label">{{
            adjBW ? "有調整體重" : "無需調整"
          }}</span>
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
    <p v-if="!isComplete" class="progress-hint">請輸入身高及實際體重</p>
  </div>
</template>

<style scoped>
.ibw {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.ibw-header {
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
  text-align: center;
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
  border-color: #ef4444;
  color: #ef4444;
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
  border-left: 3px solid #06b6d4;
  margin-bottom: 0.6rem;
}
.sex-bar {
  border-left: 3px solid #6366f1;
}
.input-bar {
  border-left: 3px solid #10b981;
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
.tab-btn.tab-active-m {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.06);
}
.tab-btn.tab-active-f {
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.06);
}
.tab-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.tab-sub {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
}
.tab-btn.tab-active .tab-title {
  color: #6366f1;
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
  border-color: #10b981;
}
.ens-item.warn-border {
  border-color: #f59e0b !important;
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
  color: #10b981;
  background: rgba(16, 185, 129, 0.12);
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
  font-size: 0.85rem;
  font-weight: 800;
  color: #10b981;
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
.ibw-input {
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
.ibw-input::-webkit-outer-spin-button,
.ibw-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.ibw-input:focus {
  border-color: #10b981;
}
.ibw-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.warn-note {
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
  border-top: 1px solid var(--vp-c-divider);
}
.ibw-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.it-header {
  padding: 0.4rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.it-row {
  display: grid;
  grid-template-columns: 140px 1fr 90px;
  gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.8rem;
  align-items: center;
}
.it-row:last-child {
  border-bottom: none;
}
.it-main {
  background: var(--vp-c-brand-soft);
}
.it-adj {
  background: rgba(239, 68, 68, 0.06);
}
.it-abw {
  background: var(--vp-c-bg-mute);
}
.it-method {
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.it-formula {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.it-result {
  font-weight: 800;
  color: var(--vp-c-brand-1);
  text-align: right;
}
.obese-text {
  color: #ef4444;
}
.ok-text {
  color: #22c55e;
}
.adj-color {
  color: #ef4444;
}
.obese-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.alert-icon {
  color: #ef4444;
  flex-shrink: 0;
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
  color: #10b981;
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
  white-space: nowrap;
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
  white-space: nowrap;
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
  .ibw-header {
    flex-direction: column;
  }
  .tab-toggle {
    flex-direction: column;
  }
  .it-row {
    grid-template-columns: 110px 1fr 70px;
  }
}
</style>
