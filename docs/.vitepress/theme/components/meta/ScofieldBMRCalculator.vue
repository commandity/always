<script setup lang="ts">
import { ref, computed } from "vue";

type Sex = "M" | "F";
type PAL = "sedentary" | "light" | "moderate" | "very";
type BracketKey = "lt3" | "3to10" | "10to18" | "18to30" | "30to60" | "gt60";

const sex = ref<Sex>("M");
const ageVal = ref("");
const weightVal = ref("");
const palLevel = ref<PAL>("moderate");
const copied = ref(false);
const showResults = ref(false);

const Age = computed(() => {
  const v = parseFloat(ageVal.value);
  return isNaN(v) || v < 0 ? null : v;
});
const W = computed(() => {
  const v = parseFloat(weightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const isComplete = computed(() => Age.value !== null && W.value !== null);

const bracket = computed(() => {
  const a = Age.value;
  if (a === null) return null;
  if (a < 3) return "lt3";
  if (a < 10) return "3to10";
  if (a < 18) return "10to18";
  if (a < 30) return "18to30";
  if (a < 60) return "30to60";
  return "gt60";
});

const coefs: Record<Sex, Record<BracketKey, [number, number]>> = {
  M: {
    lt3: [59.512, -30.4],
    "3to10": [22.706, 504.3],
    "10to18": [17.686, 658.2],
    "18to30": [15.057, 692.2],
    "30to60": [11.472, 873.1],
    gt60: [11.711, 587.7],
  },
  F: {
    lt3: [58.317, -31.1],
    "3to10": [20.315, 485.9],
    "10to18": [13.384, 692.6],
    "18to30": [14.818, 486.6],
    "30to60": [8.126, 845.6],
    gt60: [9.082, 658.5],
  },
};

const bmr = computed(() => {
  if (!isComplete.value || !bracket.value) return null;
  const [a, b] = coefs[sex.value][bracket.value as BracketKey];
  return Math.round((a * W.value! + b) * 10) / 10;
});

const palFactors: Record<Sex, Record<PAL, number>> = {
  M: { sedentary: 1.3, light: 1.6, moderate: 1.7, very: 2.1 },
  F: { sedentary: 1.3, light: 1.5, moderate: 1.6, very: 1.9 },
};
const pal = computed(() => palFactors[sex.value][palLevel.value]);
const tee = computed(() =>
  bmr.value ? Math.round(bmr.value * pal.value) : null,
);

const palLabels: Record<PAL, string> = {
  sedentary: "久坐 Sedentary",
  light: "輕度活動 Lightly Active",
  moderate: "中度活動 Moderate Activity",
  very: "非常活動 Very Active",
};
const palDescs: Record<PAL, string> = {
  sedentary: "非常低度身體活動，久坐且休閒活動極少",
  light: "每日例行活動包含步行，或每週 1–2 次輕至中等強度運動",
  moderate: "每週至少 3 次 20–45 分鐘中高強度運動，或需要體力勞動的工作",
  very: "每日 1 小時以上高強度運動，或重體力勞動職業（農業、建築等）",
};

const bracketLabels: Record<BracketKey, string> = {
  lt3: "< 3 歲",
  "3to10": "3–10 歲",
  "10to18": "10–18 歲",
  "18to30": "18–30 歲",
  "30to60": "30–60 歲",
  gt60: "> 60 歲",
};

const severity = computed(() => {
  if (!bmr.value) return "pending";
  if (bmr.value < 900) return "mild";
  if (bmr.value < 1800) return "normal";
  return "moderate";
});

function generateOutput() {
  const bk = bracket.value as BracketKey | null;
  return (
    `# Schofield BMR 計算\n\n` +
    `## 基本資料\n- 性別：${sex.value === "M" ? "男性" : "女性"}\n` +
    `- 年齡：${Age.value ?? "—"} 歲（年齡組別：${bk ? bracketLabels[bk] : "—"}）\n` +
    `- 體重：${W.value ?? "—"} kg\n` +
    `- 活動程度：${palLabels[palLevel.value]}（PAL = ${pal.value}）\n\n` +
    `## 結果\n` +
    `- **BMR（Schofield）= ${bmr.value ?? "—"} kcal/day**\n` +
    `- 每日總能量消耗（TEE = BMR × PAL）= ${tee.value ?? "—"} kcal/day`
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
  sex.value = "M";
  palLevel.value = "moderate";
  showResults.value = false;
}
</script>

<template>
  <div class="sco">
    <div class="sco-header">
      <div class="header-title">
        <h2 class="title">Schofield 基礎代謝率</h2>
        <p class="subtitle">
          Basal Metabolic Rate · Schofield 1985 · WHO/FAO/UNU 官方標準 ·
          全年齡適用
        </p>
      </div>
      <div class="score-badge" :class="severity">
        <span class="badge-label">{{
          bracket ? bracketLabels[bracket as BracketKey] : "BMR"
        }}</span>
        <span class="score-number">{{ bmr ?? "—" }}</span>
        <span class="score-unit" :style="{ opacity: bmr ? 1 : 0 }">kcal/d</span>
        <span class="score-label">TEE {{ tee ?? "—" }} kcal</span>
      </div>
    </div>

    <!-- Sex tab -->
    <div class="nihss-group">
      <div class="group-header-bar sex-bar">
        <span class="group-icon">👤</span>
        <span class="group-label-text">性別選擇</span>
        <span class="group-sub-text">Schofield 公式男女各有獨立係數</span>
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active-m': sex === 'M' }"
          @click="sex = 'M'"
        >
          <span class="tab-title">♂ 男性（Male）</span>
          <span class="tab-sub"
            >3–10歲：22.706W + 504.3　10–18歲：17.686W + 658.2</span
          >
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-f': sex === 'F' }"
          @click="sex = 'F'"
        >
          <span class="tab-title">♀ 女性（Female）</span>
          <span class="tab-sub"
            >3–10歲：20.315W + 485.9　10–18歲：13.384W + 692.6</span
          >
        </button>
      </div>
    </div>

    <!-- Inputs -->
    <div class="nihss-group">
      <div class="group-header-bar input-bar">
        <span class="group-icon">📏</span>
        <span class="group-label-text">年齡與體重</span>
        <span class="group-sub-text">Schofield 方程式僅需體重（不需身高）</span>
        <span
          class="group-score-tally"
          :class="sex === 'M' ? 'male-tally' : 'female-tally'"
          >{{ bmr ? bmr + " kcal" : "—" }}</span
        >
      </div>
      <div class="group-items">
        <div class="ens-item" :class="{ answered: Age !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Age</span></div>
            <div class="item-name-block">
              <span class="item-name">年齡 Age</span>
              <span class="item-sub">
                Schofield 公式涵蓋全年齡（0 歲至 60
                歲以上），自動選擇對應年齡組別
                <span v-if="bracket" class="bracket-badge"
                  >→ {{ bracketLabels[bracket as BracketKey] }}</span
                >
              </span>
            </div>
            <span class="item-score" :class="{ zero: Age === null }"
              >{{ Age ?? "—" }}<small v-if="Age"> 歲</small></span
            >
          </div>
          <div class="input-row">
            <input
              v-model="ageVal"
              type="number"
              min="0"
              max="120"
              step="0.5"
              placeholder="歲"
              class="sco-input"
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
                >Schofield
                公式僅使用體重（kg），不需身高。嬰幼兒使用實際體重</span
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
              min="2"
              max="300"
              step="0.1"
              placeholder="kg"
              class="sco-input"
            />
            <span class="input-unit">kg</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Schofield reference table — FIXED: (label, bk) not (bk, label) -->
    <div class="sco-table">
      <div class="st-header">
        Schofield 方程式參考表（{{ sex === "M" ? "男性" : "女性" }}）
      </div>
      <div
        v-for="(label, bk) in bracketLabels"
        :key="bk"
        class="st-row"
        :class="{ 'st-active': bracket === bk }"
      >
        <span class="st-age" :class="bracket === bk ? 'active-age' : ''">{{
          label
        }}</span>
        <span class="st-eq"
          >BMR = {{ coefs[sex][bk as BracketKey][0] }}W
          {{ coefs[sex][bk as BracketKey][1] >= 0 ? "+" : ""
          }}{{ coefs[sex][bk as BracketKey][1] }}</span
        >
        <span class="st-result" v-if="bracket === bk && bmr"
          >{{ bmr }} kcal/d</span
        >
        <span class="st-result" v-else>—</span>
      </div>
    </div>

    <!-- PAL selector -->
    <div class="nihss-group">
      <div class="group-header-bar pal-bar">
        <span class="group-icon">🏃</span>
        <span class="group-label-text">身體活動程度（PAL）</span>
        <span class="group-sub-text">TEE = BMR × PAL</span>
        <span class="group-score-tally pal-tally">PAL = {{ pal }}</span>
      </div>
      <div class="pal-grid">
        <button
          v-for="(desc, key) in palDescs"
          :key="key"
          class="pal-btn"
          :class="{ 'pal-active': palLevel === key }"
          @click="palLevel = key as PAL"
        >
          <span class="pal-name">{{ palLabels[key as PAL] }}</span>
          <span class="pal-factor"
            >{{ sex === "M" ? "♂" : "♀" }} PAL =
            {{ palFactors[sex][key as PAL] }}</span
          >
          <span class="pal-desc">{{ desc }}</span>
        </button>
      </div>
    </div>

    <!-- Formula -->
    <div class="formula-box" v-if="isComplete && bmr && bracket">
      <span class="formula-label">計算過程：</span>
      <span class="formula-text">
        BMR ({{ bracketLabels[bracket as BracketKey] }}) =
        {{ coefs[sex][bracket as BracketKey][0] }}×{{ W }}
        {{ coefs[sex][bracket as BracketKey][1] >= 0 ? "+" : ""
        }}{{ coefs[sex][bracket as BracketKey][1] }} = {{ bmr }} kcal ；TEE =
        {{ bmr }} × {{ pal }} = <strong>{{ tee }} kcal/day</strong>
      </span>
    </div>

    <!-- Result card -->
    <div class="ens-result" :class="severity">
      <div class="result-left">
        <span class="result-number">{{ bmr ?? "—" }}</span>
        <span class="result-max" v-if="bmr">kcal/d</span>
      </div>
      <div class="result-right">
        <span class="result-level">基礎代謝率（Schofield BMR）</span>
        <span class="result-advice" v-if="tee"
          >TEE = {{ bmr }} × {{ pal }} =
          <strong>{{ tee }} kcal/day</strong></span
        >
        <span class="result-sub" v-if="bracket"
          >年齡組別：{{ bracketLabels[bracket as BracketKey] }}</span
        >
      </div>
    </div>

    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >Schofield 公式為 WHO/FAO/UNU
        官方推薦標準，適用於一般健康人群。以歐洲人群為主要研究對象，對於非歐裔族群（如亞洲人）可能高估
        BMR 約
        5–10%。急性疾病、大面積燒傷或代謝異常患者不適用，建議使用間接熱量測定。</span
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
        <span class="detail-qnum">Age</span
        ><span class="detail-domain">年齡</span
        ><span class="detail-score">{{ Age ?? "—" }}</span
        ><span class="detail-desc">歲</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Grp</span
        ><span class="detail-domain">年齡組別</span
        ><span class="detail-score" style="font-size: 0.7rem">{{
          bracket ? bracketLabels[bracket as BracketKey] : "—"
        }}</span
        ><span class="detail-desc">Schofield</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">Wt</span
        ><span class="detail-domain">體重</span
        ><span class="detail-score">{{ W ?? "—" }}</span
        ><span class="detail-desc">kg</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">PAL</span
        ><span class="detail-domain">身體活動程度</span
        ><span class="detail-score">{{ pal }}</span
        ><span class="detail-desc">{{ palLevel }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">TEE</span
        ><span class="detail-domain">每日總能量消耗</span
        ><span class="detail-score">{{ tee ?? "—" }}</span
        ><span class="detail-desc">kcal/d</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">BMR</span>
        <span class="detail-domain">基礎代謝率（最終結果）</span>
        <span class="detail-score detail-score-brand">{{ bmr ?? "—" }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">kcal/d</span>
          <span class="detail-desc-label">Schofield</span>
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
    <p v-if="!isComplete" class="progress-hint">請輸入年齡及體重</p>
  </div>
</template>

<style scoped>
.sco {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.sco-header {
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
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-align: center;
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
  border-color: #14b8a6;
  color: #14b8a6;
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
  border-left: 3px solid #ef4444;
  margin-bottom: 0.6rem;
}
.sex-bar {
  border-left: 3px solid #6366f1;
}
.input-bar {
  border-left: 3px solid #14b8a6;
}
.pal-bar {
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
.pal-tally {
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
  border-color: #14b8a6;
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
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.12);
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
.bracket-badge {
  color: #14b8a6;
  font-weight: 700;
}
.item-score {
  font-size: 0.9rem;
  font-weight: 800;
  color: #14b8a6;
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
.sco-input {
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
.sco-input::-webkit-outer-spin-button,
.sco-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.sco-input:focus {
  border-color: #14b8a6;
}
.sco-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.sco-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}
.st-header {
  padding: 0.4rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.st-row {
  display: grid;
  grid-template-columns: 90px 1fr 90px;
  gap: 0.5rem;
  padding: 0.42rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.st-row:last-child {
  border-bottom: none;
}
.st-active {
  background: var(--vp-c-brand-soft);
}
.st-age {
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.active-age {
  color: #14b8a6;
}
.st-eq {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.st-result {
  font-weight: 800;
  color: var(--vp-c-brand-1);
  text-align: right;
}
.pal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.pal-btn {
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
.pal-btn.pal-active {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
}
.pal-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.pal-factor {
  font-size: 0.7rem;
  font-weight: 700;
  color: #22c55e;
  font-family: monospace;
}
.pal-desc {
  font-size: 0.67rem;
  color: var(--vp-c-text-3);
}
.pal-btn.pal-active .pal-name {
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
  border-color: #14b8a6;
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
  color: #14b8a6;
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
  color: #14b8a6;
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
  .sco-header {
    flex-direction: column;
  }
  .tab-toggle,
  .pal-grid {
    flex-direction: column;
  }
  .ens-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .st-row {
    grid-template-columns: 80px 1fr 70px;
  }
}
</style>
