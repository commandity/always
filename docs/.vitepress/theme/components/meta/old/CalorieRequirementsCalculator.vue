<script setup lang="ts">
import { ref, computed } from "vue";

// IOM EER Adult equations (2002/2005 DRI, used by MedCentral)
// Male:   EER = 662 − 9.53×Age + PA×(15.91×Wt[kg] + 539.6×Ht[m])
// Female: EER = 354 − 6.91×Age + PA×(9.36×Wt[kg]  + 726×Ht[m])
// PA coefficients:
//   Sedentary  M:1.00 F:1.00
//   Low Active M:1.11 F:1.12
//   Active     M:1.25 F:1.27
//   Very Active M:1.48 F:1.45

type Sex = "M" | "F";
type PALevel = "sedentary" | "low" | "active" | "veryActive";

const sex = ref<Sex>("M");
const ageVal = ref("");
const weightVal = ref(""); // kg
const heightVal = ref(""); // cm
const palLevel = ref<PALevel>("low");
const copied = ref(false);
const showResults = ref(false);

const Age = computed(() => {
  const v = parseFloat(ageVal.value);
  return isNaN(v) || v < 19 || v > 100 ? null : v;
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

const Hm = computed(() => (H.value ? H.value / 100 : null));

const paCoeff = computed(() => {
  const tbl: Record<PALevel, Record<Sex, number>> = {
    sedentary: { M: 1.0, F: 1.0 },
    low: { M: 1.11, F: 1.12 },
    active: { M: 1.25, F: 1.27 },
    veryActive: { M: 1.48, F: 1.45 },
  };
  return tbl[palLevel.value][sex.value];
});

const eer = computed(() => {
  if (!isComplete.value || !Hm.value) return null;
  let val: number;
  if (sex.value === "M")
    val =
      662 -
      9.53 * Age.value! +
      paCoeff.value * (15.91 * W.value! + 539.6 * Hm.value);
  else
    val =
      354 -
      6.91 * Age.value! +
      paCoeff.value * (9.36 * W.value! + 726 * Hm.value);
  return Math.round(val);
});

// Weight loss targets
const loss05 = computed(() =>
  eer.value ? Math.max(eer.value - 500, 1200) : null,
);
const loss10 = computed(() =>
  eer.value ? Math.max(eer.value - 1000, 1200) : null,
);

const bmi = computed(() =>
  W.value && Hm.value
    ? Math.round((W.value / (Hm.value * Hm.value)) * 10) / 10
    : null,
);

const palLabels: Record<PALevel, string> = {
  sedentary: "久坐（Sedentary）",
  low: "低度活動（Low Active）",
  active: "中度活動（Active）",
  veryActive: "非常活動（Very Active）",
};
const palDescs: Record<PALevel, string> = {
  sedentary: "僅有日常生活的輕度活動",
  low: "每日步行約 1.5–3 英里，或每週 1–2 次中等強度運動",
  active: "每日步行超過 3 英里，或每週 3–5 次中等強度運動",
  veryActive: "高強度體力勞動或每日超過 1 小時劇烈運動",
};

const eerSeverity = computed(() => {
  if (!eer.value) return "pending";
  if (eer.value < 1500) return "mild";
  if (eer.value < 2500) return "normal";
  return "moderate";
});

function generateOutput() {
  return (
    `# 成人熱量需求計算（IOM EER）\n\n` +
    `## 基本資料\n\n` +
    `- 性別：${sex.value === "M" ? "男性" : "女性"}\n` +
    `- 年齡：${Age.value ?? "—"} 歲\n` +
    `- 體重：${W.value ?? "—"} kg\n` +
    `- 身高：${H.value ?? "—"} cm（${Hm.value ?? "—"} m）\n` +
    `- BMI：${bmi.value ?? "—"} kg/m²\n` +
    `- 活動程度：${palLabels[palLevel.value]}（PA = ${paCoeff.value}）\n\n` +
    `## 結果\n\n` +
    `- **維持體重所需熱量（EER）：${eer.value ?? "—"} kcal/day**\n` +
    `- 每週減重 0.5 kg（−500 kcal/day）：${loss05.value ?? "—"} kcal/day\n` +
    `- 每週減重 1.0 kg（−1000 kcal/day）：${loss10.value ?? "—"} kcal/day`
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
  palLevel.value = "low";
  showResults.value = false;
}
</script>

<template>
  <div class="cal">
    <!-- Header -->
    <div class="cal-header">
      <div class="header-title">
        <h2 class="title">EER 成人熱量需求估算</h2>
        <p class="subtitle">
          Calorie Requirements for Weight Maintenance & Weight Loss · IOM EER
          Adult Equations
        </p>
      </div>
      <div class="score-badge" :class="eerSeverity">
        <span class="badge-label">{{
          sex === "M" ? "♂ 男性" : "♀ 女性"
        }}</span>
        <span class="score-number">{{ eer ?? "—" }}</span>
        <span class="score-unit" :style="{ opacity: eer ? 1 : 0 }"
          >kcal/day</span
        >
        <span class="score-label">維持體重</span>
      </div>
    </div>

    <!-- Sex tab -->
    <div class="nihss-group">
      <div class="group-header-bar sex-bar">
        <span class="group-icon">👤</span>
        <span class="group-label-text">性別選擇</span>
        <span class="group-sub-text">EER 方程式因性別而異</span>
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active-m': sex === 'M' }"
          @click="sex = 'M'"
        >
          <span class="tab-title">♂ 男性（Male）</span>
          <span class="tab-sub"
            >EER = 662 − 9.53×Age + PA×(15.91×W + 539.6×H)</span
          >
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-f': sex === 'F' }"
          @click="sex = 'F'"
        >
          <span class="tab-title">♀ 女性（Female）</span>
          <span class="tab-sub"
            >EER = 354 − 6.91×Age + PA×(9.36×W + 726×H)</span
          >
        </button>
      </div>
    </div>

    <!-- Inputs -->
    <div class="nihss-group">
      <div class="group-header-bar input-bar">
        <span class="group-icon">📏</span>
        <span class="group-label-text">身體數值輸入</span>
        <span class="group-sub-text">適用於 19 歲以上成人</span>
        <span
          class="group-score-tally"
          :class="sex === 'M' ? 'male-tally' : 'female-tally'"
          >{{ eer ? eer + " kcal" : "—" }}</span
        >
      </div>
      <div class="group-items">
        <div class="ens-item" :class="{ answered: Age !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Age</span></div>
            <div class="item-name-block">
              <span class="item-name">年齡 Age</span>
              <span class="item-sub"
                >適用範圍 19–100 歲。年齡影響基礎代謝率（每歲約減少 5–10
                kcal）</span
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
              min="19"
              max="100"
              step="1"
              placeholder="歲"
              class="cal-input"
            />
            <span class="input-unit">歲</span>
          </div>
        </div>
        <div class="ens-item" :class="{ answered: W !== null }">
          <div class="item-header">
            <div class="item-meta-row"><span class="item-qnum">Wt</span></div>
            <div class="item-name-block">
              <span class="item-name">體重 Body Weight</span>
              <span class="item-sub"
                >實際體重（公斤）。此計算不區分肥胖類別，直接使用實際體重</span
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
              max="300"
              step="0.1"
              placeholder="kg"
              class="cal-input"
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
                >身高（公分）。公式中自動轉換為公尺（÷ 100）進行計算</span
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
              class="cal-input"
            />
            <span class="input-unit">cm</span>
          </div>
        </div>
        <!-- BMI derived -->
        <div class="ens-item derived-item" v-if="bmi">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum bmi-q">BMI</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">身體質量指數（自動計算）</span>
              <span class="item-sub"
                >BMI = 體重(kg) ÷ 身高(m)² = {{ W }} ÷ {{ Hm?.toFixed(2) }}² =
                {{ bmi }} kg/m²</span
              >
            </div>
            <span class="item-score" style="color: #06b6d4">{{ bmi }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity level -->
    <div class="nihss-group">
      <div class="group-header-bar act-bar">
        <span class="group-icon">🏃</span>
        <span class="group-label-text">身體活動程度（PAL）</span>
        <span class="group-sub-text">PA 係數影響最終熱量估算</span>
        <span class="group-score-tally act-tally">PA = {{ paCoeff }}</span>
      </div>
      <div class="pal-grid">
        <button
          v-for="(desc, key) in palDescs"
          :key="key"
          class="pal-btn"
          :class="{ 'pal-active': palLevel === key }"
          @click="palLevel = key as PALevel"
        >
          <span class="pal-name">{{ palLabels[key as PALevel] }}</span>
          <span class="pal-pa"
            >PA =
            {{
              {
                sedentary: { M: 1.0, F: 1.0 },
                low: { M: 1.11, F: 1.12 },
                active: { M: 1.25, F: 1.27 },
                veryActive: { M: 1.48, F: 1.45 },
              }[key as PALevel][sex]
            }}</span
          >
          <span class="pal-desc">{{ desc }}</span>
        </button>
      </div>
    </div>

    <!-- Formula box -->
    <div class="formula-box" v-if="isComplete && eer">
      <span class="formula-label">計算過程：</span>
      <span class="formula-text">
        EER = {{ sex === "M" ? "662" : "354" }} −
        {{ sex === "M" ? "9.53" : "6.91" }}×{{ Age }} + {{ paCoeff }}×({{
          sex === "M" ? "15.91" : "9.36"
        }}×{{ W }} + {{ sex === "M" ? "539.6" : "726" }}×{{ Hm?.toFixed(2) }}) =
        <strong>{{ eer }} kcal/day</strong>
      </span>
    </div>

    <!-- Result card -->
    <div class="ens-result" :class="eerSeverity">
      <div class="result-left">
        <span class="result-number">{{ eer ?? "—" }}</span>
        <span class="result-max" v-if="eer">kcal/day</span>
      </div>
      <div class="result-right">
        <span class="result-level">維持體重每日熱量需求</span>
        <span class="result-advice" v-if="eer">
          {{ palLabels[palLevel] }}，PA = {{ paCoeff }}
        </span>
        <span class="result-sub" v-if="eer"> BMI {{ bmi }} kg/m² </span>
      </div>
    </div>

    <!-- Weight loss table -->
    <div class="loss-table" v-if="eer">
      <div class="lt-header">熱量目標</div>
      <div class="lt-row lt-main">
        <span class="lt-label">維持體重</span>
        <span class="lt-val">{{ eer }} kcal/day</span>
        <span class="lt-note">EER（能量平衡）</span>
      </div>
      <div class="lt-row">
        <span class="lt-label">每週減 0.5 kg</span>
        <span class="lt-val">{{ loss05 }} kcal/day</span>
        <span class="lt-note">EER − 500 kcal</span>
      </div>
      <div class="lt-row">
        <span class="lt-label">每週減 1.0 kg</span>
        <span class="lt-val">{{ loss10 }} kcal/day</span>
        <span class="lt-note">EER − 1000 kcal（最低 1200 kcal）</span>
      </div>
    </div>

    <!-- Warn -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >EER
        為估算值，適用於維持健康體重的一般成人。不適用於孕婦、哺乳婦女、極端體型者或急性疾病患者。每日熱量攝取不應低於女性
        1200 kcal 或男性 1500 kcal，以避免營養不足。</span
      >
    </div>

    <!-- Detail -->
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
        <span class="detail-qnum">PA</span
        ><span class="detail-domain">活動係數</span
        ><span class="detail-score">{{ paCoeff }}</span
        ><span class="detail-desc">{{ palLevel }}</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">EER</span>
        <span class="detail-domain">維持體重熱量需求</span>
        <span class="detail-score detail-score-brand">{{ eer ?? "—" }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">kcal/d</span>
          <span class="detail-desc-label">維持體重</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
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
.cal {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.cal-header {
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
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
}
.score-unit {
  font-size: 0.62rem;
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
  border-color: #3b82f6;
  color: #3b82f6;
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
  border-left: 3px solid #6366f1;
  margin-bottom: 0.6rem;
}
.sex-bar {
  border-left: 3px solid #6366f1;
}
.input-bar {
  border-left: 3px solid #3b82f6;
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
  border-color: #3b82f6;
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
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
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
  color: #3b82f6;
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
.cal-input {
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
.cal-input::-webkit-outer-spin-button,
.cal-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.cal-input:focus {
  border-color: #3b82f6;
}
.cal-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
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
  padding: 0.7rem 0.85rem;
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
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.pal-pa {
  font-size: 0.7rem;
  font-weight: 700;
  color: #22c55e;
  font-family: monospace;
}
.pal-desc {
  font-size: 0.68rem;
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
  font-size: 0.8rem;
}
.formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.6;
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
  border-color: #3b82f6;
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
  color: #3b82f6;
}
.result-max {
  font-size: 0.9rem;
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
.loss-table {
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
  grid-template-columns: 140px 120px 1fr;
  gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.8rem;
  align-items: center;
}
.lt-row:last-child {
  border-bottom: none;
}
.lt-main {
  background: var(--vp-c-brand-soft);
}
.lt-label {
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.lt-val {
  font-weight: 800;
  color: var(--vp-c-brand-1);
  font-family: monospace;
}
.lt-note {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
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
  color: #3b82f6;
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
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
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
  .cal-header {
    flex-direction: column;
  }
  .pal-grid {
    grid-template-columns: 1fr;
  }
  .tab-toggle {
    flex-direction: column;
  }
  .ens-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .lt-row {
    grid-template-columns: 120px 100px 1fr;
  }
}
</style>
