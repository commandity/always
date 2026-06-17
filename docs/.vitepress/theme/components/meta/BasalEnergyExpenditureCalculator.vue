<script setup lang="ts">
import { ref, computed } from "vue";
// Harris-Benedict BEE (1919, revised coefficients):
// Male:   BEE = 66.5 + 13.75×W + 5.003×H − 6.775×Age
// Female: BEE = 655.1 + 9.563×W + 1.850×H − 4.676×Age
// W = kg, H = cm, Age = years
// Total Caloric Req = BEE × Activity Factor
// AF: Sedentary 1.2, Lightly Active 1.375, Moderately Active 1.55, Very Active 1.725, Extra Active 1.9

type Sex = "M" | "F";
type AF = "sedentary" | "light" | "moderate" | "very" | "extra";
const sex = ref<Sex>("M");
const ageVal = ref("");
const weightVal = ref("");
const heightVal = ref("");
const afLevel = ref<AF>("moderate");
const copied = ref(false);
const showResults = ref(false);

const Age = computed(() => {
  const v = parseFloat(ageVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const W = computed(() => {
  const v = parseFloat(weightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const H = computed(() => {
  const v = parseFloat(heightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const isComplete = computed(
  () => Age.value !== null && W.value !== null && H.value !== null,
);

const bee = computed(() => {
  if (!isComplete.value) return null;
  let val: number;
  if (sex.value === "M")
    val = 66.5 + 13.75 * W.value! + 5.003 * H.value! - 6.775 * Age.value!;
  else val = 655.1 + 9.563 * W.value! + 1.85 * H.value! - 4.676 * Age.value!;
  return Math.round(val);
});

const afFactors: Record<AF, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extra: 1.9,
};
const af = computed(() => afFactors[afLevel.value]);
const tee = computed(() =>
  bee.value ? Math.round(bee.value * af.value) : null,
);

const afLabels: Record<AF, string> = {
  sedentary: "久坐（Sedentary）",
  light: "輕度活動（Lightly Active）",
  moderate: "中度活動（Moderately Active）",
  very: "高度活動（Very Active）",
  extra: "極高度活動（Extra Active）",
};
const afDescs: Record<AF, string> = {
  sedentary: "幾乎不運動，辦公桌工作",
  light: "每週 1–3 天輕度運動或體力工作",
  moderate: "每週 3–5 天中等強度運動",
  very: "每週 6–7 天高強度運動",
  extra: "每天劇烈運動或重體力勞動",
};

const severity = computed(() => {
  if (!bee.value) return "pending";
  if (bee.value < 1300) return "mild";
  if (bee.value < 2000) return "normal";
  return "moderate";
});

function generateOutput() {
  return (
    `# 基礎能量消耗（BEE）— Harris-Benedict 公式\n\n` +
    `## 基本資料\n- 性別：${sex.value === "M" ? "男性" : "女性"}\n` +
    `- 年齡：${Age.value ?? "—"} 歲\n- 體重：${W.value ?? "—"} kg\n- 身高：${H.value ?? "—"} cm\n` +
    `- 活動程度：${afLabels[afLevel.value]}（× ${af.value}）\n\n` +
    `## 結果\n` +
    `- **基礎能量消耗（BEE）= ${bee.value ?? "—"} kcal/day**\n` +
    `- 每日總熱量需求（TEE = BEE × ${af.value}）= ${tee.value ?? "—"} kcal/day`
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateOutput());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
function reset() {
  ageVal.value = "";
  weightVal.value = "";
  heightVal.value = "";
  sex.value = "M";
  afLevel.value = "moderate";
  showResults.value = false;
}
</script>

<template>
  <div class="bee">
    <div class="bee-header">
      <div class="header-title">
        <h2 class="title">BEE 基礎能量消耗</h2>
        <p class="subtitle">
          Basal Energy Expenditure · Harris-Benedict Estimation (1919) · W = kg
          · H = cm
        </p>
      </div>
      <div class="score-badge" :class="severity">
        <span class="badge-label">BEE</span>
        <span class="score-number">{{ bee ?? "—" }}</span>
        <span class="score-unit" :style="{ opacity: bee ? 1 : 0 }">kcal/d</span>
        <span class="score-label">TEE {{ tee ?? "—" }} kcal</span>
      </div>
    </div>

    <!-- Sex tab -->
    <div class="nihss-group">
      <div class="group-header-bar sex-bar">
        <span class="group-icon">👤</span>
        <span class="group-label-text">性別選擇</span>
        <span class="group-sub-text">Harris-Benedict 公式男女方程式不同</span>
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active-m': sex === 'M' }"
          @click="sex = 'M'"
        >
          <span class="tab-title">♂ 男性（Male）</span>
          <span class="tab-sub">BEE = 66.5 + 13.75W + 5.003H − 6.775Age</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-f': sex === 'F' }"
          @click="sex = 'F'"
        >
          <span class="tab-title">♀ 女性（Female）</span>
          <span class="tab-sub">BEE = 655.1 + 9.563W + 1.850H − 4.676Age</span>
        </button>
      </div>
    </div>

    <!-- Inputs -->
    <div class="nihss-group">
      <div class="group-header-bar input-bar">
        <span class="group-icon">📏</span>
        <span class="group-label-text">身體數值輸入</span>
        <span class="group-sub-text">年齡、體重、身高</span>
        <span
          class="group-score-tally"
          :class="sex === 'M' ? 'male-tally' : 'female-tally'"
          >{{ bee ? bee + " kcal" : "—" }}</span
        >
      </div>
      <div class="group-items">
        <div class="ens-item" :class="{ answered: Age !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Age</span></div>
            <div class="item-name-block">
              <span class="item-name">年齡 Age</span>
              <span class="item-sub"
                >隨年齡增加，基礎代謝率逐年下降（每歲約 6.775 kcal，男性）</span
              >
            </div>
            <span class="item-score" :class="{ zero: Age === null }"
              >{{ Age ?? "—" }}<small v-if="Age"> 歲</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="ageVal"
              type="number"
              min="1"
              max="120"
              step="1"
              placeholder="歲"
              class="bee-input"
            />
            <span class="input-unit">歲</span>
          </div>
        </div>
        <div class="ens-item" :class="{ answered: W !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Wt</span></div>
            <div class="item-name-block">
              <span class="item-name">體重 Weight</span>
              <span class="item-sub"
                >實際體重（kg）。肌肉量高者可能低估；肥胖者可考慮使用調整體重</span
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
              min="10"
              max="400"
              step="0.1"
              placeholder="kg"
              class="bee-input"
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
                >身高（公分）直接代入公式（不需換算為公尺）</span
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
              min="50"
              max="250"
              step="0.1"
              placeholder="cm"
              class="bee-input"
            />
            <span class="input-unit">cm</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity factor -->
    <div class="nihss-group">
      <div class="group-header-bar act-bar">
        <span class="group-icon">🏃</span>
        <span class="group-label-text">活動係數（Activity Factor）</span>
        <span class="group-sub-text">TEE = BEE × AF</span>
        <span class="group-score-tally act-tally">AF = {{ af }}</span>
      </div>
      <div class="af-grid">
        <button
          v-for="(desc, key) in afDescs"
          :key="key"
          class="af-btn"
          :class="{ 'af-active': afLevel === key }"
          @click="afLevel = key as AF"
        >
          <span class="af-name">{{ afLabels[key as AF] }}</span>
          <span class="af-factor">× {{ afFactors[key as AF] }}</span>
          <span class="af-desc">{{ desc }}</span>
        </button>
      </div>
    </div>

    <!-- Formula -->
    <div class="formula-box" v-if="isComplete && bee">
      <span class="formula-label">計算過程：</span>
      <span class="formula-text">
        BEE = {{ sex === "M" ? "66.5" : "655.1" }} +
        {{ sex === "M" ? "13.75" : "9.563" }}×{{ W }} +
        {{ sex === "M" ? "5.003" : "1.850" }}×{{ H }} −
        {{ sex === "M" ? "6.775" : "4.676" }}×{{ Age }} = {{ bee }} kcal ；TEE =
        {{ bee }} × {{ af }} = <strong>{{ tee }} kcal/day</strong>
      </span>
    </div>

    <!-- Result card -->
    <div class="ens-result" :class="severity">
      <div class="result-left">
        <span class="result-number">{{ bee ?? "—" }}</span>
        <span class="result-max" v-if="bee">kcal/d</span>
      </div>
      <div class="result-right">
        <span class="result-level">基礎能量消耗（BEE）</span>
        <span class="result-advice" v-if="tee">
          每日總熱量需求（TEE）= {{ bee }} × {{ af }} =
          <strong>{{ tee }} kcal/day</strong>
        </span>
        <span class="result-sub" v-if="tee">{{ afLabels[afLevel] }}</span>
      </div>
    </div>

    <!-- TEE table -->
    <div class="tee-table" v-if="bee">
      <div class="tt-header">各活動程度下每日總熱量需求（TEE = BEE × AF）</div>
      <div
        v-for="(fac, key) in afFactors"
        :key="key"
        class="tt-row"
        :class="{ 'tt-active': afLevel === key }"
      >
        <span class="tt-level">{{ afLabels[key as AF] }}</span>
        <span class="tt-af">× {{ fac }}</span>
        <span class="tt-val">{{ Math.round(bee! * fac) }} kcal/day</span>
      </div>
    </div>

    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >Harris-Benedict 公式（1919 年）可能高估現代人的 BEE 約
        5%。肥胖患者建議使用實際體重或 Mifflin-St Jeor
        公式。不適用於嚴重疾病、大面積燒傷或代謝極端異常的患者；此時應使用間接熱量測定（Indirect
        Calorimetry）。</span
      >
    </div>

    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-row">
        <span class="detail-qnum">Sex</span
        ><span class="detail-domain">性別</span
        ><span class="detail-score">—</span
        ><span class="detail-desc">{{ sex === "M" ? "男性" : "女性" }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Age</span
        ><span class="detail-domain">年齡</span
        ><span class="detail-score">{{ Age ?? "—" }}</span
        ><span class="detail-desc">歲</span>
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
        <span class="detail-qnum">AF</span
        ><span class="detail-domain">活動係數</span
        ><span class="detail-score">{{ af }}</span
        ><span class="detail-desc">{{ afLevel }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">TEE</span
        ><span class="detail-domain">每日總熱量需求</span
        ><span class="detail-score">{{ tee ?? "—" }}</span
        ><span class="detail-desc">kcal/d</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">BEE</span>
        <span class="detail-domain">基礎能量消耗（最終結果）</span>
        <span class="detail-score detail-score-brand">{{ bee ?? "—" }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">kcal/d</span>
          <span class="detail-desc-label">Harris-Benedict</span>
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
    <p v-if="!isComplete" class="progress-hint">請輸入年齡、體重及身高</p>
  </div>
</template>

<style scoped>
.bee {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.bee-header {
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
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
}
.score-unit {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 1px;
}
.score-label {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 2px;
}
.score-badge.pending {
  color: var(--vp-c-text-3);
}
.score-badge.normal {
  border-color: #f59e0b;
  color: #f59e0b;
}
.score-badge.mild {
  border-color: #3b82f6;
  color: #3b82f6;
}
.score-badge.moderate {
  border-color: #22c55e;
  color: #22c55e;
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
  border-left: 3px solid #a855f7;
  margin-bottom: 0.6rem;
}
.sex-bar {
  border-left: 3px solid #6366f1;
}
.input-bar {
  border-left: 3px solid #f59e0b;
}
.act-bar {
  border-left: 3px solid #22c55e;
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
.act-tally {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
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
  font-size: 0.62rem;
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
  border-color: #f59e0b;
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
.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.item-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
  padding: 1px 6px;
  border-radius: 999px;
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
  color: #f59e0b;
  min-width: 28px;
  text-align: right;
  white-space: normal;
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
.bee-input {
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
.bee-input::-webkit-outer-spin-button,
.bee-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.bee-input:focus {
  border-color: #f59e0b;
}
.bee-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.af-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.af-btn {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.18s;
}
.af-btn.af-active {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
}
.af-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.af-factor {
  font-size: 0.72rem;
  font-weight: 700;
  color: #22c55e;
  font-family: monospace;
}
.af-desc {
  font-size: 0.67rem;
  color: var(--vp-c-text-3);
}
.af-btn.af-active .af-name {
  color: #22c55e;
}
.formula-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  margin-bottom: 1rem;
  font-size: 0.78rem;
}
.formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.7;
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
  border-color: #f59e0b;
}
.ens-result.mild {
  border-color: #3b82f6;
}
.ens-result.moderate {
  border-color: #22c55e;
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
  color: #f59e0b;
}
.ens-result.mild .result-number {
  color: #3b82f6;
}
.ens-result.moderate .result-number {
  color: #22c55e;
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
  line-height: 1.5;
}
.result-sub {
  font-size: 0.78rem;
  color: var(--vp-c-brand-1);
}
.tee-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.tt-header {
  padding: 0.4rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.tt-row {
  display: grid;
  grid-template-columns: 1fr 60px 100px;
  gap: 0.5rem;
  padding: 0.42rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.tt-row:last-child {
  border-bottom: none;
}
.tt-active {
  background: var(--vp-c-brand-soft);
}
.tt-level {
  color: var(--vp-c-text-1);
  font-weight: 600;
}
.tt-af {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.tt-val {
  font-weight: 800;
  color: var(--vp-c-brand-1);
  text-align: right;
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
  color: #f59e0b;
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
  width: 120px;
  text-align: left;
  white-space: normal;
}
.detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 120px;
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
/* ── Actions ───────────────────────────────────────────────────── */
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
  .bee-header {
    flex-direction: column;
  }
  .tab-toggle,
  .af-grid {
    flex-direction: column;
  }
  .ens-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .tt-row {
    grid-template-columns: 1fr 50px 90px;
  }
}
</style>
