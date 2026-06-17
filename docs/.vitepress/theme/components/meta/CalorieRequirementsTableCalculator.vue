<script setup lang="ts">
import { ref, computed } from "vue";

type Sex = "M" | "F";
type PAL = "sedentary" | "moderate" | "active";

const sex = ref<Sex>("M");
const copied = ref(false);
const showResults = ref(false);

const maleTable: {
  age: string;
  ageMin: number;
  ageMax: number;
  sed: number;
  mod: number;
  act: number;
}[] = [
  { age: "19–20", ageMin: 19, ageMax: 20, sed: 2600, mod: 2800, act: 3000 },
  { age: "21–25", ageMin: 21, ageMax: 25, sed: 2400, mod: 2800, act: 3000 },
  { age: "26–30", ageMin: 26, ageMax: 30, sed: 2400, mod: 2600, act: 3000 },
  { age: "31–35", ageMin: 31, ageMax: 35, sed: 2400, mod: 2600, act: 3000 },
  { age: "36–40", ageMin: 36, ageMax: 40, sed: 2400, mod: 2600, act: 2800 },
  { age: "41–45", ageMin: 41, ageMax: 45, sed: 2200, mod: 2600, act: 2800 },
  { age: "46–50", ageMin: 46, ageMax: 50, sed: 2200, mod: 2400, act: 2800 },
  { age: "51–55", ageMin: 51, ageMax: 55, sed: 2200, mod: 2400, act: 2800 },
  { age: "56–60", ageMin: 56, ageMax: 60, sed: 2200, mod: 2400, act: 2600 },
  { age: "61–65", ageMin: 61, ageMax: 65, sed: 2000, mod: 2400, act: 2600 },
  { age: "66–70", ageMin: 66, ageMax: 70, sed: 2000, mod: 2200, act: 2600 },
  { age: "71–75", ageMin: 71, ageMax: 75, sed: 2000, mod: 2200, act: 2600 },
  { age: "76+", ageMin: 76, ageMax: 120, sed: 2000, mod: 2200, act: 2400 },
];

const femaleTable: {
  age: string;
  ageMin: number;
  ageMax: number;
  sed: number;
  mod: number;
  act: number;
}[] = [
  { age: "19–20", ageMin: 19, ageMax: 20, sed: 2000, mod: 2200, act: 2400 },
  { age: "21–25", ageMin: 21, ageMax: 25, sed: 2000, mod: 2200, act: 2400 },
  { age: "26–30", ageMin: 26, ageMax: 30, sed: 1800, mod: 2000, act: 2400 },
  { age: "31–35", ageMin: 31, ageMax: 35, sed: 1800, mod: 2000, act: 2200 },
  { age: "36–40", ageMin: 36, ageMax: 40, sed: 1800, mod: 2000, act: 2200 },
  { age: "41–45", ageMin: 41, ageMax: 45, sed: 1800, mod: 2000, act: 2200 },
  { age: "46–50", ageMin: 46, ageMax: 50, sed: 1800, mod: 2000, act: 2200 },
  { age: "51–55", ageMin: 51, ageMax: 55, sed: 1600, mod: 1800, act: 2200 },
  { age: "56–60", ageMin: 56, ageMax: 60, sed: 1600, mod: 1800, act: 2200 },
  { age: "61–65", ageMin: 61, ageMax: 65, sed: 1600, mod: 1800, act: 2000 },
  { age: "66–70", ageMin: 66, ageMax: 70, sed: 1600, mod: 1800, act: 2000 },
  { age: "71–75", ageMin: 71, ageMax: 75, sed: 1600, mod: 1800, act: 2000 },
  { age: "76+", ageMin: 76, ageMax: 120, sed: 1600, mod: 1800, act: 2000 },
];

const activeTable = computed(() =>
  sex.value === "M" ? maleTable : femaleTable,
);
const minFloor = computed(() => (sex.value === "M" ? 1500 : 1200));

const palLabels: Record<PAL, string> = {
  sedentary: "久坐 Sedentary",
  moderate: "中度活動 Moderately Active",
  active: "活動 Active",
};
const palDescs: Record<PAL, string> = {
  sedentary: "僅有日常生活的輕度活動，無規律運動",
  moderate: "相當於每日步行 2.4–4.8 km（1.5–3 英里），時速 4.8–6.4 km/hr",
  active: "相當於每日步行超過 4.8 km（> 3 英里），時速 4.8–6.4 km/hr",
};

function applyFloor(val: number, floor: number): number {
  return Math.max(val, floor);
}
function loss500(maint: number): number {
  return applyFloor(maint - 500, minFloor.value);
}
function loss1000(maint: number): number {
  return applyFloor(maint - 1000, minFloor.value);
}
function palVal(row: (typeof maleTable)[0], pal: PAL): number {
  return pal === "sedentary" ? row.sed : pal === "moderate" ? row.mod : row.act;
}

const selectedAge = ref<number | null>(null);
const selectedPAL = ref<PAL>("moderate");

const selectedRow = computed(() =>
  selectedAge.value !== null
    ? (activeTable.value.find(
        (r) => selectedAge.value! >= r.ageMin && selectedAge.value! <= r.ageMax,
      ) ?? null)
    : null,
);
const maintenance = computed(() =>
  selectedRow.value ? palVal(selectedRow.value, selectedPAL.value) : null,
);
const wl500 = computed(() =>
  maintenance.value ? loss500(maintenance.value) : null,
);
const wl1000 = computed(() =>
  maintenance.value ? loss1000(maintenance.value) : null,
);

const isComplete = computed(() => selectedRow.value !== null);

function generateOutput() {
  if (!selectedRow.value || !maintenance.value) return "請先選擇年齡與活動程度";
  return (
    `# 成人熱量需求參考表（${sex.value === "M" ? "男性" : "女性"}）\n\n` +
    `## 選擇條件\n- 性別：${sex.value === "M" ? "男性" : "女性"}\n` +
    `- 年齡組別：${selectedRow.value.age} 歲\n` +
    `- 活動程度：${palLabels[selectedPAL.value]}\n\n` +
    `## 熱量目標\n` +
    `- **維持體重：${maintenance.value} kcal/day**\n` +
    `- 每週減重 0.5 kg（−500 kcal）：${wl500.value} kcal/day\n` +
    `- 每週減重 1.0 kg（−1000 kcal）：${wl1000.value} kcal/day\n\n` +
    `*資料來源：USDA 膳食指南 2020–2025 附錄 2 · IOM EER 方程式*`
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateOutput());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  selectedAge.value = null;
  selectedPAL.value = "moderate";
  showResults.value = false;
}
</script>

<template>
  <div class="crt">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="crt-header">
      <div class="header-title">
        <h2 class="title">Calorie Requirements Table 成人每日熱量需求參考表</h2>
        <!-- ✦ subtitle split into two lines so it never crowds the badge ✦ -->
        <p class="subtitle">
          Calorie Requirements for Weight Maintenance &amp; Weight Loss
        </p>
        <p class="subtitle subtitle-2">
          USDA DGA 2020–2025 · 依年齡、性別及活動程度
        </p>
      </div>
      <div
        class="score-badge"
        :class="
          maintenance
            ? sex === 'M'
              ? 'badge-male'
              : 'badge-female'
            : 'pending'
        "
      >
        <span class="badge-sex">{{ sex === "M" ? "♂ 男性" : "♀ 女性" }}</span>
        <span class="score-number">{{ maintenance ?? "—" }}</span>
        <span class="score-unit" :style="{ opacity: maintenance ? 1 : 0 }"
          >kcal/d</span
        >
        <span class="score-label">維持體重</span>
      </div>
    </div>

    <!-- ── Sex tab ─────────────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar sex-bar">
        <span class="group-icon">👤</span>
        <span class="group-label-text">性別選擇</span>
        <span class="group-sub-text"
          >男女因體型、激素及肌肉量差異，熱量需求不同</span
        >
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active-m': sex === 'M' }"
          @click="
            sex = 'M';
            selectedAge = null;
          "
        >
          <span class="tab-title">♂ 男性（Male）</span>
          <span class="tab-sub">參考身高 178 cm · 每日 2,000–3,000 kcal</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-f': sex === 'F' }"
          @click="
            sex = 'F';
            selectedAge = null;
          "
        >
          <span class="tab-title">♀ 女性（Female）</span>
          <span class="tab-sub">參考身高 163 cm · 每日 1,600–2,400 kcal</span>
        </button>
      </div>
    </div>

    <!-- ── Activity level ─────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar act-bar">
        <span class="group-icon">🏃</span>
        <span class="group-label-text">身體活動程度</span>
        <span class="group-sub-text">選擇最符合日常活動量的程度</span>
        <span class="group-score-tally act-tally">{{
          palLabels[selectedPAL]
        }}</span>
      </div>
      <div class="pal-grid">
        <button
          v-for="(desc, key) in palDescs"
          :key="key"
          class="pal-btn"
          :class="{ 'pal-active': selectedPAL === key }"
          @click="selectedPAL = key as PAL"
        >
          <span class="pal-name">{{ palLabels[key as PAL] }}</span>
          <span class="pal-desc">{{ desc }}</span>
        </button>
      </div>
    </div>

    <!-- ── Age group selector ─────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar age-bar">
        <span class="group-icon">📅</span>
        <span class="group-label-text">年齡組別選擇</span>
        <span class="group-sub-text">點選對應年齡區間查看熱量目標</span>
        <span class="group-score-tally age-tally">
          {{ selectedRow ? selectedRow.age + " 歲" : "請選擇" }}
        </span>
      </div>
      <div class="age-grid">
        <button
          v-for="row in activeTable"
          :key="row.age"
          class="age-btn"
          :class="{
            'age-active': selectedRow?.age === row.age,
            'age-male': sex === 'M' && selectedRow?.age === row.age,
            'age-female': sex === 'F' && selectedRow?.age === row.age,
          }"
          @click="selectedAge = row.ageMin"
        >
          <span class="age-label">{{ row.age }}</span>
          <span class="age-val">{{ palVal(row, selectedPAL) }}</span>
          <span class="age-unit">kcal</span>
        </button>
      </div>
    </div>

    <!-- ── Full reference table ───────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar table-bar">
        <span class="group-icon">📊</span>
        <span class="group-label-text"
          >完整熱量參考表（{{ sex === "M" ? "男性" : "女性" }}）</span
        >
        <span class="group-sub-text"
          >含維持、減重 0.5 kg、減重 1.0 kg 三欄目標</span
        >
      </div>
      <div class="ref-table">
        <div class="rt-row rt-header">
          <span>年齡</span>
          <span>久坐</span>
          <span>中度活動</span>
          <span>活動</span>
          <span>−500 kcal</span>
          <span>−1000 kcal</span>
        </div>
        <div
          v-for="row in activeTable"
          :key="row.age"
          class="rt-row"
          :class="{
            'rt-active': selectedRow?.age === row.age,
            'rt-male': sex === 'M' && selectedRow?.age === row.age,
            'rt-female': sex === 'F' && selectedRow?.age === row.age,
          }"
        >
          <span class="rt-age">{{ row.age }}</span>
          <span
            :class="
              selectedPAL === 'sedentary' && selectedRow?.age === row.age
                ? 'rt-highlight'
                : ''
            "
            >{{ row.sed }}</span
          >
          <span
            :class="
              selectedPAL === 'moderate' && selectedRow?.age === row.age
                ? 'rt-highlight'
                : ''
            "
            >{{ row.mod }}</span
          >
          <span
            :class="
              selectedPAL === 'active' && selectedRow?.age === row.age
                ? 'rt-highlight'
                : ''
            "
            >{{ row.act }}</span
          >
          <span class="rt-loss">{{ loss500(palVal(row, selectedPAL)) }}</span>
          <span class="rt-loss">{{ loss1000(palVal(row, selectedPAL)) }}</span>
        </div>
      </div>
      <p class="table-note">
        ⓘ −500/−1000 kcal 欄依目前選擇的活動程度（{{
          palLabels[selectedPAL]
        }}）計算。 最低熱量下限：{{ sex === "M" ? "男性 1,500" : "女性 1,200" }}
        kcal/day。
      </p>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div
      v-if="isComplete"
      class="ens-result"
      :class="sex === 'M' ? 'result-male' : 'result-female'"
    >
      <div class="result-left">
        <span class="result-number">{{ maintenance }}</span>
        <span class="result-max">kcal/d</span>
      </div>
      <div class="result-right">
        <span class="result-level"
          >{{ selectedRow?.age }} 歲 · {{ palLabels[selectedPAL] }}</span
        >
        <span class="result-advice"
          >每週減 0.5 kg：<strong>{{ wl500 }} kcal/day</strong>（每日少 500
          kcal）</span
        >
        <span class="result-advice"
          >每週減 1.0 kg：<strong>{{ wl1000 }} kcal/day</strong>（每日少 1,000
          kcal）</span
        >
        <span class="result-sub"
          >最低熱量下限 {{ minFloor }} kcal/day · 每減 7,700 kcal ≈ 減少 1 kg
          體重</span
        >
      </div>
    </div>

    <!-- ── Weight loss summary ────────────────────────────────── -->
    <div v-if="isComplete" class="loss-cards">
      <div
        class="loss-card loss-maintain"
        :class="sex === 'M' ? 'lc-male' : 'lc-female'"
      >
        <span class="lc-icon">⚖️</span>
        <span class="lc-val">{{ maintenance }}</span>
        <span class="lc-unit">kcal/day</span>
        <span class="lc-label">維持體重</span>
      </div>
      <div class="loss-card loss-05">
        <span class="lc-icon">📉</span>
        <span class="lc-val">{{ wl500 }}</span>
        <span class="lc-unit">kcal/day</span>
        <span class="lc-label">每週減 0.5 kg</span>
      </div>
      <div class="loss-card loss-10">
        <span class="lc-icon">📉📉</span>
        <span class="lc-val">{{ wl1000 }}</span>
        <span class="lc-unit">kcal/day</span>
        <span class="lc-label">每週減 1.0 kg</span>
      </div>
    </div>

    <!-- ── Clinical note ──────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span>
        表格數值使用 USDA 參考體型（男性 5'10" 178 cm、女性 5'4" 163
        cm）推算，適用於體型接近參考值的一般成人。
        個人實際需求受身高、體重及體型組成影響，建議使用個人化 EER 公式（IOM
        方程式）精確計算。 熱量不應低於女性 1,200 kcal/day 或男性 1,500
        kcal/day，以避免營養不足。
        孕婦、哺乳婦女及有特殊醫療狀況者請諮詢醫師或註冊營養師。
      </span>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults && isComplete" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-row">
        <span class="detail-qnum">性別</span>
        <span class="detail-domain">Sex</span>
        <span class="detail-score">{{ sex === "M" ? "♂" : "♀" }}</span>
        <span class="detail-desc">{{ sex === "M" ? "男性" : "女性" }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">年齡</span>
        <span class="detail-domain">Age Group</span>
        <span class="detail-score" style="font-size: 0.75rem">{{
          selectedRow?.age
        }}</span>
        <span class="detail-desc">歲</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">活動</span>
        <span class="detail-domain">Physical Activity Level</span>
        <span class="detail-score" style="font-size: 0.68rem; width: 52px">{{
          selectedPAL
        }}</span>
        <span class="detail-desc">{{ palLabels[selectedPAL] }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">−500</span>
        <span class="detail-domain">每週減 0.5 kg（−500 kcal/day）</span>
        <span class="detail-score">{{ wl500 }}</span>
        <span class="detail-desc">kcal/day</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">−1000</span>
        <span class="detail-domain">每週減 1.0 kg（−1000 kcal/day）</span>
        <span class="detail-score">{{ wl1000 }}</span>
        <span class="detail-desc">kcal/day</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">EER</span>
        <span class="detail-domain">維持體重每日熱量需求</span>
        <span class="detail-score detail-score-brand">{{ maintenance }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">kcal/d</span>
          <span class="detail-desc-label">維持體重</span>
        </div>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="ens-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyOutput">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      請點選上方年齡組別以查看熱量目標
    </p>
  </div>
</template>

<style scoped>
.crt {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.crt-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap; /* ✦ never wrap — badge always stays right */
}
.header-title {
  flex: 1;
  min-width: 0; /* ✦ allows text to shrink/wrap inside flex */
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
  white-space: normal; /* ✦ allow natural wrapping */
}
.subtitle-2 {
  margin-top: 1px;
}

/* ── Score badge ─────────────────────────────────────────────────── */
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  flex-shrink: 0;
  min-height: 88px; /* ✦ badge never shrinks */
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.badge-sex {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.score-number {
  font-size: 1.8rem;
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
.score-badge.badge-male {
  border-color: #38bdf8;
  color: #38bdf8;
}
.score-badge.badge-female {
  border-color: #f472b6;
  color: #f472b6;
}

/* ── Groups ────────────────────────────────────────────────────── */
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
  border-left: 3px solid #8b5cf6;
  margin-bottom: 0.6rem;
}
.sex-bar {
  border-left: 3px solid #6366f1;
}
.act-bar {
  border-left: 3px solid #22c55e;
}
.age-bar {
  border-left: 3px solid #f59e0b;
}
.table-bar {
  border-left: 3px solid #06b6d4;
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
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.act-tally {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.age-tally {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}

/* ── Sex tab toggle ────────────────────────────────────────────── */
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
  padding: 0.7rem 1rem;
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
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.tab-btn.tab-active-m .tab-title {
  color: #38bdf8;
}
.tab-btn.tab-active-f .tab-title {
  color: #f472b6;
}

/* ── PAL grid ──────────────────────────────────────────────────── */
.pal-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
}
.pal-btn {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.pal-desc {
  font-size: 0.67rem;
  color: var(--vp-c-text-3);
  line-height: 1.4;
}
.pal-btn.pal-active .pal-name {
  color: #22c55e;
}

/* ── Age grid ──────────────────────────────────────────────────── */
.age-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
}
.age-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.6rem 0.4rem;
  border-radius: 9px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.age-btn:hover {
  border-color: var(--vp-c-brand-1);
}
.age-btn.age-active {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.07);
}
.age-btn.age-male {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.07);
}
.age-btn.age-female {
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.07);
}
.age-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.age-val {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  line-height: 1;
}
.age-unit {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}
.age-btn.age-male .age-val {
  color: #38bdf8;
}
.age-btn.age-female .age-val {
  color: #f472b6;
}

/* ── Reference table ───────────────────────────────────────────── */
.ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  font-size: 0.78rem;
}
.rt-row {
  display: grid;
  grid-template-columns: 60px 1fr 1fr 1fr 1fr 1fr;
  gap: 0.3rem;
  padding: 0.38rem 0.8rem;
  border-bottom: 1px solid var(--vp-c-divider);
  align-items: center;
  transition: background 0.15s;
}
.rt-row:last-child {
  border-bottom: none;
}
.rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.rt-active {
  background: var(--vp-c-bg-soft);
  font-weight: 600;
}
.rt-male {
  border-left: 3px solid #38bdf8;
  background: rgba(56, 189, 248, 0.06);
}
.rt-female {
  border-left: 3px solid #f472b6;
  background: rgba(244, 114, 182, 0.06);
}
.rt-age {
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.rt-highlight {
  font-weight: 900;
  color: var(--vp-c-brand-1);
}
.rt-loss {
  color: var(--vp-c-text-3);
  font-size: 0.74rem;
}
.table-note {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  margin: 0.5rem 0 0;
  line-height: 1.5;
}

/* ── Result card ───────────────────────────────────────────────── */
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
.result-male {
  border-color: #38bdf8;
}
.result-female {
  border-color: #f472b6;
}
.result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.result-male .result-number {
  color: #38bdf8;
}
.result-female .result-number {
  color: #f472b6;
}
.result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.result-level {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-advice {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.result-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}

/* ── Weight loss cards ─────────────────────────────────────────── */
.loss-cards {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.loss-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.8rem 0.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-align: center;
}
.lc-male {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.06);
}
.lc-female {
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.06);
}
.loss-05 {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.loss-10 {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.lc-icon {
  font-size: 1.1rem;
}
.lc-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  line-height: 1;
}
.lc-male .lc-val {
  color: #38bdf8;
}
.lc-female .lc-val {
  color: #f472b6;
}
.loss-05 .lc-val {
  color: #f59e0b;
}
.loss-10 .lc-val {
  color: #f97316;
}
.lc-unit {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
}
.lc-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}

/* ── Warning box ───────────────────────────────────────────────── */
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

/* ── Results detail ────────────────────────────────────────────── */
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
  font-size: 0.68rem;
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
  width: 100px;
  text-align: left;
  white-space: normal;
}
.detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100px;
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
  .crt-header {
    flex-wrap: wrap;
  }
  .score-badge {
    align-self: flex-start;
  }
  .score-number {
    font-size: 1.4rem;
  }
  .pal-grid {
    grid-template-columns: 1fr;
  }
  .age-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .loss-cards {
    grid-template-columns: 1fr;
  }
  .ens-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .rt-row {
    grid-template-columns: 50px 1fr 1fr 1fr 1fr;
    font-size: 0.7rem;
  }
  .rt-row span:last-child {
    display: none;
  }
  .tab-toggle {
    flex-direction: column;
  }
}
</style>
