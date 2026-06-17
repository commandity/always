<script setup lang="ts">
import { ref, computed } from "vue";

const ageRef = ref<HTMLInputElement | null>(null);
const heightRef = ref<HTMLInputElement | null>(null);
const measuredRef = ref<HTMLInputElement | null>(null);

function focusNext(i: number) {
  const els = [ageRef.value, heightRef.value, measuredRef.value];
  const next = els[i + 1];
  if (next) setTimeout(() => next.focus(), 0);
}

// ── Peak Expiratory Flow (PEF) Prediction ─────────────────────────
// Adults (15–85y): Nunn & Gregg, BMJ 1989;298:1068-70
//   Males:   PEF = (5.48 × height_cm) − (1.93 × age) − 454
//   Females: PEF = (3.72 × height_cm) − (2.24 × age) + 2
//
// Children (5–<18y): Knudson RJ et al, Am Rev Respir Dis 1983;127:725-34
//   Boys:    PEF = (5.49 × height_cm) − 441  (height-based, simplified)
//   Girls:   PEF = (3.94 × height_cm) − 281  (height-based, simplified)
//   Note: Knudson pediatric PEF is primarily height-driven;
//         EU scale Clement Clarke nomogram for children uses these coefficients.
//
// Zones (% predicted):
//   Green  ≥ 80%   → No action / well controlled
//   Yellow 50–79%  → Caution / consider adjustment
//   Red    < 50%   → Medical emergency

type Sex = "male" | "female";
type AgeGroup = "adult" | "child";

const sex = ref<Sex | null>(null);
const ageGroup = ref<AgeGroup | null>(null);
const age = ref<number | null>(null);
const heightCm = ref<number | null>(null);
const measured = ref<number | null>(null); // optional measured PEF

const copied = ref(false);
const showResults = ref(false);

// ── Input handlers ────────────────────────────────────────────────
function setAge(e: Event) {
  const v = +(e.target as HTMLInputElement).value;
  age.value = v > 0 ? v : null;
}
function setHeight(e: Event) {
  const v = +(e.target as HTMLInputElement).value;
  heightCm.value = v > 0 ? v : null;
}
function setMeasured(e: Event) {
  const v = +(e.target as HTMLInputElement).value;
  measured.value = v > 0 ? v : null;
}

// ── Age group auto-detect ─────────────────────────────────────────
const detectedGroup = computed((): AgeGroup | null => {
  if (age.value === null) return null;
  if (age.value >= 5 && age.value < 18) return "child";
  if (age.value >= 18 && age.value <= 85) return "adult";
  return null;
});

// use manual override if set, else auto-detect
const effectiveGroup = computed(() => ageGroup.value ?? detectedGroup.value);

// ── Completeness ──────────────────────────────────────────────────
const isComplete = computed(
  () =>
    sex.value !== null &&
    age.value !== null &&
    age.value > 0 &&
    heightCm.value !== null &&
    heightCm.value > 0 &&
    effectiveGroup.value !== null,
);

// ── Age range validation ──────────────────────────────────────────
const ageWarning = computed(() => {
  if (age.value === null) return null;
  if (age.value < 5) return "年齡 < 5 歲：超出參考方程式適用範圍。";
  if (age.value > 85)
    return "年齡 > 85 歲：超出 Nunn & Gregg 方程式驗證範圍，僅供參考。";
  return null;
});

// ── PEF Calculation ───────────────────────────────────────────────
const predictedPEF = computed((): number | null => {
  if (!isComplete.value) return null;
  const h = heightCm.value!;
  const a = age.value!;
  const g = effectiveGroup.value!;
  const s = sex.value!;

  if (g === "adult") {
    // Nunn & Gregg 1989 — height in cm, age in years, result in L/min
    if (s === "male") return Math.round(5.48 * h - 1.93 * a - 454);
    else return Math.round(3.72 * h - 2.24 * a + 2);
  } else {
    // Knudson 1983 / Clement Clarke EU scale children nomogram
    // Boys:  PEF = 5.49 × height_cm − 441
    // Girls: PEF = 3.94 × height_cm − 281
    if (s === "male") return Math.round(5.49 * h - 441);
    else return Math.round(3.94 * h - 281);
  }
});

const predictedDisplay = computed(() =>
  predictedPEF.value !== null ? predictedPEF.value + " L/min" : "—",
);

// ── % predicted (when measured provided) ─────────────────────────
const pctPredicted = computed((): number | null => {
  if (predictedPEF.value === null || measured.value === null) return null;
  return Math.round((measured.value / predictedPEF.value) * 100);
});

// ── Zone classification ───────────────────────────────────────────
const zone = computed((): "green" | "yellow" | "red" | null => {
  if (pctPredicted.value === null) return null;
  if (pctPredicted.value >= 80) return "green";
  if (pctPredicted.value >= 50) return "yellow";
  return "red";
});

// ── Result object ─────────────────────────────────────────────────
const result = computed(() => {
  if (!isComplete.value || predictedPEF.value === null)
    return { level: "填寫中", color: "filling", advice: "", action: "" };

  if (measured.value === null) {
    // no measured value — just show predicted
    const grp = effectiveGroup.value === "child" ? "兒童" : "成人";
    const src =
      effectiveGroup.value === "child" ? "Knudson 1983" : "Nunn & Gregg 1989";
    return {
      level: `預測 PEF（${grp}，${sex.value === "male" ? "男性" : "女性"}）`,
      color: "moderate",
      advice: `預測峰值呼氣流速：${predictedPEF.value} L/min（${src}）。請與實際測量值比較評估肺功能狀態。`,
      action:
        "以標準峰流速計測量最大用力呼氣時的流速，取三次測量中最高值，比對預測值百分比。",
    };
  }

  const pct = pctPredicted.value!;
  const z = zone.value!;

  if (z === "green")
    return {
      level: `綠色區域（${pct}% 預測值）— 肺功能良好`,
      color: "normal",
      advice: `實測 PEF 為預測值的 ${pct}%（≥80%），落在綠色安全區。氣道功能控制良好。`,
      action:
        "維持現有治療計畫。若有哮喘，繼續記錄峰流速日誌，遵循個人最佳值追蹤。",
    };

  if (z === "yellow")
    return {
      level: `黃色區域（${pct}% 預測值）— 需注意氣道狀態`,
      color: "moderate",
      advice: `實測 PEF 為預測值的 ${pct}%（50–79%），落在黃色警示區。氣道可能有部分阻塞或哮喘未完全控制。`,
      action:
        "評估誘發因子（感染、過敏原、運動）；必要時使用支氣管擴張劑（SABA）；若症狀持續，諮詢醫師調整治療計畫。",
    };

  return {
    level: `紅色區域（${pct}% 預測值）— 需立即處理`,
    color: "critical",
    advice: `實測 PEF 為預測值的 ${pct}%（<50%），落在紅色緊急區。嚴重氣道阻塞，可能為急性哮喘發作或急性加重。`,
    action:
      "立即使用速效支氣管擴張劑（SABA）；若無改善，立即就醫或急診；評估是否需全身性類固醇治療。",
  };
});

// ── Badge display ─────────────────────────────────────────────────
const badgeNum = computed(() => {
  if (pctPredicted.value !== null) return pctPredicted.value + "%";
  if (predictedPEF.value !== null) return String(predictedPEF.value);
  return "—";
});
const badgeBot = computed(() => {
  if (pctPredicted.value !== null)
    return zone.value === "green"
      ? "良好"
      : zone.value === "yellow"
        ? "警示"
        : "緊急";
  if (predictedPEF.value !== null) return "L/min";
  return "待填入";
});

// ── 80% / 50% lower normal limits ────────────────────────────────
const limit80 = computed(() =>
  predictedPEF.value !== null ? Math.round(predictedPEF.value * 0.8) : null,
);
const limit50 = computed(() =>
  predictedPEF.value !== null ? Math.round(predictedPEF.value * 0.5) : null,
);

// ── Bar needle position ───────────────────────────────────────────
const barWidth = computed(() => {
  if (predictedPEF.value === null || measured.value === null) return "0%";
  const pct = Math.min((measured.value / predictedPEF.value) * 100, 150);
  return Math.min(pct / 1.5, 100).toFixed(1) + "%"; // scale: 150% predicted = 100% bar
});

// ── Markdown export ───────────────────────────────────────────────
function generateMarkdown(): string {
  const sexLabel = sex.value === "male" ? "男性" : "女性";
  const grpLabel =
    effectiveGroup.value === "child" ? "兒童（5–<18 歲）" : "成人（18–85 歲）";
  const src =
    effectiveGroup.value === "child"
      ? "Knudson RJ et al. 1983"
      : "Nunn AJ, Gregg I. 1989";
  return (
    `# 峰值呼氣流速（PEF）預測評估\n\n` +
    `## 輸入數值\n` +
    `- 性別：${sexLabel}\n` +
    `- 年齡：${age.value} 歲\n` +
    `- 身高：${heightCm.value} cm\n` +
    `- 年齡組別：${grpLabel}\n` +
    (measured.value ? `- 實測 PEF：${measured.value} L/min\n` : "") +
    `\n## 計算結果\n` +
    `- **預測 PEF：${predictedPEF.value} L/min**（${src}）\n` +
    `- 80% 預測值（正常下限）：${limit80.value} L/min\n` +
    `- 50% 預測值（紅色閾值）：${limit50.value} L/min\n` +
    (pctPredicted.value !== null
      ? `- 實測百分比：${pctPredicted.value}%\n`
      : "") +
    `\n## 臨床判讀\n` +
    `**${result.value.level}**\n\n` +
    `${result.value.advice}\n\n` +
    `**建議：** ${result.value.action}\n`
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  sex.value = null;
  ageGroup.value = null;
  age.value = null;
  heightCm.value = null;
  measured.value = null;
  showResults.value = false;
}
</script>

<template>
  <div class="pef">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="pef-header">
      <div class="header-title">
        <h2 class="title">峰值呼氣流速（PEF）預測計算器</h2>
        <p class="subtitle">
          Peak Expiratory Flow Prediction · 成人：Nunn &amp; Gregg BMJ 1989 ·
          兒童：Knudson Am Rev Respir Dis 1983 · 哮喘監測三色分區
        </p>
        <div class="formula-row">
          <span class="formula-tag"
            >男（成人）: PEF = 5.48×H − 1.93×A − 454</span
          >
          <span class="formula-tag">女（成人）: PEF = 3.72×H − 2.24×A + 2</span>
        </div>
      </div>
      <div class="score-badge" :class="result.color">
        <span class="badge-top">PEF</span>
        <span class="score-number">{{ badgeNum }}</span>
        <span class="score-bot">{{ badgeBot }}</span>
      </div>
    </div>

    <!-- ── Sex selector ───────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar sex-bar">
        <span class="group-icon">👤</span>
        <span class="group-label-text">性別選擇</span>
        <span class="group-sub-text"
          >PEF 方程式依性別不同，男性預測值通常高於女性</span
        >
        <span
          class="group-score-tally"
          :class="sex !== null ? 'tally-ok' : 'tally-nd'"
        >
          {{ sex === "male" ? "男性" : sex === "female" ? "女性" : "未選擇" }}
        </span>
      </div>
      <div class="sex-grid">
        <button
          class="sex-btn s-male"
          :class="{ 'sex-active-m': sex === 'male' }"
          @click="sex = 'male'"
        >
          <span class="sex-icon">♂</span>
          <span class="sex-label">男性（Male）</span>
          <span class="sex-sub"
            >成人：PEF = 5.48H − 1.93A − 454 · 兒童：5.49H − 441</span
          >
        </button>
        <button
          class="sex-btn s-female"
          :class="{ 'sex-active-f': sex === 'female' }"
          @click="sex = 'female'"
        >
          <span class="sex-icon">♀</span>
          <span class="sex-label">女性（Female）</span>
          <span class="sex-sub"
            >成人：PEF = 3.72H − 2.24A + 2 · 兒童：3.94H − 281</span
          >
        </button>
      </div>
    </div>

    <!-- ── Numeric inputs ─────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar input-bar">
        <span class="group-icon">🔢</span>
        <span class="group-label-text">數值輸入</span>
        <span class="group-sub-text"
          >年齡與身高為必填；實測 PEF 填入後可計算三色區域</span
        >
        <span
          class="group-score-tally"
          :class="predictedPEF !== null ? 'tally-ok' : 'tally-nd'"
        >
          {{ predictedPEF !== null ? predictedPEF + " L/min" : "待填" }}
        </span>
      </div>

      <div class="input-grid">
        <!-- Age -->
        <div class="input-card" :class="age !== null ? 'input-filled' : ''">
          <div class="input-header">
            <span class="input-qnum q-age">年齡</span>
            <div class="input-name-block">
              <span class="input-name">年齡（Age）</span>
              <span class="input-sub"
                >歲 · 5–17 歲：兒童方程式 · 18–85
                歲：成人方程式（自動切換）</span
              >
            </div>
            <span
              class="input-val"
              :class="
                age !== null ? (ageWarning ? 'val-warn' : 'val-ok') : 'val-nd'
              "
            >
              {{ age !== null ? age + " 歲" : "—" }}
              <span v-if="effectiveGroup" class="group-tag">{{
                effectiveGroup === "child" ? "兒童" : "成人"
              }}</span>
            </span>
          </div>
          <div class="input-row">
            <input
              ref="ageRef"
              class="num-input"
              type="number"
              min="5"
              max="85"
              step="1"
              placeholder="例：35"
              :value="age ?? ''"
              @input="setAge"
              @keydown.enter="focusNext(0)"
            />
            <span class="input-unit">歲</span>
          </div>
          <div v-if="ageWarning" class="input-warn">⚠ {{ ageWarning }}</div>
        </div>

        <!-- Height -->
        <div
          class="input-card"
          :class="heightCm !== null ? 'input-filled' : ''"
        >
          <div class="input-header">
            <span class="input-qnum q-ht">身高</span>
            <div class="input-name-block">
              <span class="input-name">身高（Height）</span>
              <span class="input-sub"
                >公分（cm）· PEF 預測最重要的決定因素</span
              >
            </div>
            <span
              class="input-val"
              :class="heightCm !== null ? 'val-ok' : 'val-nd'"
            >
              {{ heightCm !== null ? heightCm + " cm" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              ref="heightRef"
              class="num-input"
              type="number"
              min="100"
              max="220"
              step="1"
              placeholder="例：170"
              :value="heightCm ?? ''"
              @input="setHeight"
              @keydown.enter="focusNext(1)"
            />
            <span class="input-unit">cm</span>
          </div>
        </div>

        <!-- Measured PEF (optional) -->
        <div
          class="input-card input-card-full"
          :class="measured !== null ? 'input-filled-green' : ''"
        >
          <div class="input-header">
            <span class="input-qnum q-meas">實測</span>
            <div class="input-name-block">
              <span class="input-name"
                >實測 PEF（選填）— 輸入後計算百分比及三色分區</span
              >
              <span class="input-sub"
                >取三次最大用力呼氣中的最高值（L/min）</span
              >
            </div>
            <span
              class="input-val"
              :class="measured !== null ? 'val-ok' : 'val-nd'"
            >
              {{ measured !== null ? measured + " L/min" : "選填" }}
            </span>
          </div>
          <div class="input-row">
            <input
              ref="measuredRef"
              class="num-input"
              type="number"
              min="50"
              max="900"
              step="1"
              placeholder="例：420"
              :value="measured ?? ''"
              @input="setMeasured"
              @keydown.enter="focusNext(2)"
            />
            <span class="input-unit">L/min</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Threshold reference box ────────────────────────────── -->
    <div v-if="predictedPEF !== null" class="threshold-box">
      <div class="threshold-title">
        閾值參考（基於預測值 {{ predictedPEF }} L/min）
      </div>
      <div class="threshold-row">
        <span class="thr-zone thr-green">🟢 綠色（≥80%）</span>
        <span class="thr-cut">≥ {{ limit80 }} L/min</span>
        <span class="thr-stat">良好控制 · 正常氣道功能</span>
      </div>
      <div class="threshold-row">
        <span class="thr-zone thr-yellow">🟡 黃色（50–79%）</span>
        <span class="thr-cut">{{ limit50 }}–{{ limit80! - 1 }} L/min</span>
        <span class="thr-stat">警示區 · 考慮支氣管擴張劑</span>
      </div>
      <div class="threshold-row">
        <span class="thr-zone thr-red">🔴 紅色（< 50%）</span>
        <span class="thr-cut">< {{ limit50 }} L/min</span>
        <span class="thr-stat">緊急 · 立即就醫</span>
      </div>
    </div>

    <!-- ── Visual zone bar ────────────────────────────────────── -->
    <div
      v-if="predictedPEF !== null && measured !== null"
      class="zone-bar-wrap"
    >
      <div class="zone-bar-track">
        <!-- 0–50% = red, 50–80% = yellow, 80–100%+ = green (display scaled to 150%) -->
        <div class="zone-bar-seg seg-red" style="width: 33.3%"></div>
        <div class="zone-bar-seg seg-yellow" style="width: 20%"></div>
        <div class="zone-bar-seg seg-green" style="flex: 1"></div>
        <div class="zone-bar-needle" :style="{ left: barWidth }"></div>
      </div>
      <div class="zone-bar-labels">
        <span>0</span>
        <span>50%</span>
        <span>80%</span>
        <span>100%+</span>
      </div>
      <div class="zone-bar-legend">
        <span class="zl-red">● 紅色 &lt;50%</span>
        <span class="zl-yellow">● 黃色 50–79%</span>
        <span class="zl-green">● 綠色 ≥80%</span>
        <span class="zl-needle">▲ 實測：{{ pctPredicted }}%</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults && predictedPEF !== null" class="results-detail">
      <div class="results-header">計算明細</div>
      <div class="detail-row">
        <span class="detail-qnum dq-neu">性別</span>
        <span class="detail-domain">Sex</span>
        <span class="detail-score ds-neu">{{
          sex === "male" ? "男性" : "女性"
        }}</span>
        <span class="detail-desc">{{
          effectiveGroup === "child" ? "兒童方程式" : "成人方程式"
        }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum dq-neu">年齡</span>
        <span class="detail-domain">Age</span>
        <span class="detail-score ds-neu">{{ age }} 歲</span>
        <span class="detail-desc">{{
          effectiveGroup === "adult" ? "×(−1.93) 或 ×(−2.24)" : "兒童高度主導"
        }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum dq-neu">身高</span>
        <span class="detail-domain">Height</span>
        <span class="detail-score ds-neu">{{ heightCm }} cm</span>
        <span class="detail-desc">{{
          effectiveGroup === "adult"
            ? sex === "male"
              ? "×5.48"
              : "×3.72"
            : sex === "male"
              ? "×5.49"
              : "×3.94"
        }}</span>
      </div>
      <div class="detail-row detail-formula">
        <span class="detail-qnum dq-brand">=</span>
        <span class="detail-domain">預測 PEF 公式</span>
        <span class="detail-score ds-brand">{{ predictedPEF }}</span>
        <span class="detail-desc">L/min</span>
      </div>
      <div v-if="measured !== null" class="detail-row">
        <span
          class="detail-qnum"
          :class="
            zone === 'green'
              ? 'dq-grn'
              : zone === 'yellow'
                ? 'dq-ylw'
                : 'dq-red'
          "
          >實測</span
        >
        <span class="detail-domain">Measured PEF</span>
        <span
          class="detail-score"
          :class="
            zone === 'green'
              ? 'ds-grn'
              : zone === 'yellow'
                ? 'ds-ylw'
                : 'ds-red'
          "
          >{{ measured }}</span
        >
        <span class="detail-desc">L/min</span>
      </div>
      <div v-if="pctPredicted !== null" class="detail-row detail-total">
        <span class="detail-qnum">%</span>
        <span class="detail-domain">% 預測值</span>
        <span class="detail-score detail-score-brand">{{ pctPredicted }}%</span>
        <span class="detail-desc">{{
          zone === "green"
            ? "🟢 綠色"
            : zone === "yellow"
              ? "🟡 黃色"
              : "🔴 紅色"
        }}</span>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="pef-result" :class="result.color">
      <div class="result-left">
        <span class="result-score">{{
          predictedPEF !== null ? predictedPEF : "—"
        }}</span>
        <span class="result-score-label">L/min 預測</span>
        <span
          v-if="pctPredicted !== null"
          class="result-pct"
          :class="'pct-' + zone"
          >{{ pctPredicted }}%</span
        >
      </div>
      <div class="result-right">
        <span class="result-ver">
          {{
            effectiveGroup === "child"
              ? "Knudson et al. Am Rev Respir Dis 1983"
              : "Nunn &amp; Gregg. BMJ 1989"
          }}
        </span>
        <span class="result-level">{{ result.level }}</span>
        <span class="result-advice">{{ result.advice }}</span>
        <span v-if="result.action" class="result-action"
          >💡 {{ result.action }}</span
        >
      </div>
    </div>

    <!-- ── Warn ───────────────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >PEF 預測值來自 Caucasian 族群研究，亞洲族群實際 PEF 可能偏低（約
        10–20%）。PEF
        個體間變異大，個人最佳值比預測值更具臨床意義。哮喘管理應以患者自身最佳值為基準，而非人口預測值。PEF
        不能取代 FEV1/FVC 螺旋測定法作為診斷依據。兒童方程式（Knudson
        1983）以身高為主要預測因子；成人方程式（Nunn &amp; Gregg
        1989）同時包含年齡效應，年齡 ≥65 歲時應謹慎解讀。</span
      >
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="pef-actions">
      <button
        class="btn-view"
        :disabled="predictedPEF === null"
        @click="showResults = !showResults"
      >
        {{ showResults ? "收起明細" : "查看計算明細" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyOutput">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      請填入：性別、年齡、身高（實測 PEF 選填）
    </p>
  </div>
</template>

<style scoped>
.pef {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ─────────────────────────────────────────────────────── */
.pef-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
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
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0 0 0.3rem;
  line-height: 1.6;
}
.formula-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.formula-tag {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  font-family: monospace;
  white-space: nowrap;
}

/* ── Badge ───────────────────────────────────────────────────────── */
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  min-height: 88px;
  flex-shrink: 0;
  padding: 0.6rem 0.75rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.badge-top {
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.score-number {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
  text-align: center;
}
.score-bot {
  font-size: 0.55rem;
  font-weight: 600;
  margin-top: 2px;
  text-align: center;
}
.score-badge.filling {
  color: var(--vp-c-text-3);
}
.score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.moderate {
  border-color: #3b82f6;
  color: #3b82f6;
  box-shadow:
    0 0 0 1px rgba(59, 130, 246, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ── Groups ──────────────────────────────────────────────────────── */
.nihss-group {
  margin-bottom: 1.25rem;
}
.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(244, 114, 182, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #f472b6;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(244, 114, 182, 0.06);
}
.sex-bar {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left: 4px solid #8b5cf6;
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.input-bar {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left: 4px solid #3b82f6;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
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
  min-width: 52px;
  text-align: center;
  border: 1px solid transparent;
}
.tally-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
}
.tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}

/* ── Sex buttons ─────────────────────────────────────────────────── */
.sex-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem;
}
.sex-btn {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.15s;
}
.sex-btn:hover {
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-brand-1);
}
.sex-icon {
  font-size: 1.3rem;
  font-weight: 900;
}
.sex-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.sex-sub {
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
  line-height: 1.4;
}
.s-male.sex-active-m {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}
.s-male.sex-active-m .sex-label {
  color: #2563eb;
}
.s-female.sex-active-f {
  border-color: #ec4899;
  background: rgba(236, 72, 153, 0.08);
}
.s-female.sex-active-f .sex-label {
  color: #db2777;
}

/* ── Input grid ──────────────────────────────────────────────────── */
.input-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem;
}
.input-card-full {
  grid-column: 1 / -1;
}
.input-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.input-card:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.input-card.input-filled {
  border-color: #3b82f6;
}
.input-card.input-filled-green {
  border-color: #22c55e;
}
.input-header {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.input-qnum {
  font-size: 0.66rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  flex-shrink: 0;
  margin-top: 1px;
}
.q-age {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.q-ht {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.q-meas {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.input-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.input-name {
  font-size: 0.83rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.input-sub {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  line-height: 1.4;
  min-height: 1.8rem;
}
.input-val {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 800;
  flex-shrink: 0;
  text-align: right;
  white-space: nowrap;
}
.val-ok {
  color: #22c55e;
}
.val-warn {
  color: #f59e0b;
}
.val-nd {
  color: var(--vp-c-text-3);
}
.group-tag {
  font-size: 0.55rem;
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
  padding: 1px 4px;
  border-radius: 4px;
  margin-left: 3px;
}
.input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.75rem;
}
.num-input {
  flex: 1;
  min-width: 0;
  padding: 0.45rem 0.6rem;
  border-radius: 7px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 1rem;
  font-weight: 700;
  font-family: monospace;
  transition: border-color 0.15s;
  outline: none;
}
.num-input:focus {
  border-color: #3b82f6;
}
.num-input::placeholder {
  color: var(--vp-c-text-3);
  font-weight: 400;
  font-size: 0.85rem;
}
.input-unit {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
  flex-shrink: 0;
}
.input-warn {
  padding: 0.3rem 0.75rem;
  font-size: 0.68rem;
  color: #d97706;
  background: rgba(245, 158, 11, 0.08);
  border-top: 1px solid rgba(245, 158, 11, 0.2);
}

/* ── Threshold box ───────────────────────────────────────────────── */
.threshold-box {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 0.65rem 0.9rem;
  margin-bottom: 1rem;
}
.threshold-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  margin-bottom: 0.4rem;
}
.threshold-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.78rem;
  margin-bottom: 0.25rem;
}
.thr-zone {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 999px;
  min-width: 120px;
}
.thr-green {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}
.thr-yellow {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}
.thr-red {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}
.thr-cut {
  font-family: monospace;
  font-weight: 700;
  font-size: 0.78rem;
  color: var(--vp-c-text-1);
  min-width: 100px;
}
.thr-stat {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}

/* ── Zone bar ────────────────────────────────────────────────────── */
.zone-bar-wrap {
  margin-bottom: 1.25rem;
}
.zone-bar-track {
  position: relative;
  height: 18px;
  border-radius: 999px;
  overflow: visible;
  display: flex;
  border: 1px solid var(--vp-c-divider);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.zone-bar-seg {
  height: 100%;
}
.seg-red {
  background: rgba(239, 68, 68, 0.3);
  border-radius: 999px 0 0 999px;
}
.seg-yellow {
  background: rgba(245, 158, 11, 0.3);
}
.seg-green {
  background: rgba(34, 197, 94, 0.3);
  border-radius: 0 999px 999px 0;
}
.zone-bar-needle {
  position: absolute;
  top: -4px;
  width: 4px;
  height: 26px;
  background: #1e293b;
  border-radius: 2px;
  transform: translateX(-50%);
  transition: left 0.4s;
}
.zone-bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
  margin-top: 4px;
}
.zone-bar-legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}
.zl-red {
  color: #dc2626;
}
.zl-yellow {
  color: #d97706;
}
.zl-green {
  color: #16a34a;
}
.zl-needle {
  color: var(--vp-c-text-1);
  font-weight: 700;
}

/* ── Results detail ──────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.results-header {
  padding: 0.45rem 0.85rem;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.85rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-total {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.detail-formula {
  background: rgba(59, 130, 246, 0.04);
}
.detail-qnum {
  font-size: 0.66rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 32px;
}
.dq-neu {
  color: #3b82f6;
}
.dq-brand {
  color: var(--vp-c-brand-1);
}
.dq-grn {
  color: #16a34a;
}
.dq-ylw {
  color: #d97706;
}
.dq-red {
  color: #dc2626;
}
.detail-domain {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.detail-score {
  font-size: 0.78rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 80px;
  text-align: right;
}
.ds-neu {
  color: #3b82f6;
}
.ds-brand {
  color: var(--vp-c-brand-1);
}
.ds-grn {
  color: #16a34a;
}
.ds-ylw {
  color: #d97706;
}
.ds-red {
  color: #dc2626;
}
.detail-score-brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.68rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  min-width: 100px;
}

/* ── Result card ─────────────────────────────────────────────────── */
.pef-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: all 0.3s;
  min-height: 96px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.pef-result.filling {
  border-color: var(--vp-c-divider);
}
.pef-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.pef-result.moderate {
  border-color: #3b82f6;
  box-shadow:
    0 0 0 1px rgba(59, 130, 246, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.pef-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  min-width: 80px;
}
.result-score {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.pef-result.normal .result-score {
  color: #22c55e;
}
.pef-result.moderate .result-score {
  color: #3b82f6;
}
.pef-result.critical .result-score {
  color: #ef4444;
}
.result-score-label {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
  font-weight: 700;
}
.result-pct {
  font-size: 0.85rem;
  font-weight: 800;
  margin-top: 3px;
}
.pct-green {
  color: #22c55e;
}
.pct-yellow {
  color: #d97706;
}
.pct-red {
  color: #dc2626;
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.result-ver {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.result-level {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-advice {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.result-action {
  position: relative;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  padding: 0.45rem 0.65rem 0.45rem 0.9rem;
  border-radius: 7px;
  background: var(--vp-c-bg-mute);
}
.result-action::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  border-radius: 7px 0 0 7px;
  background: var(--vp-c-brand-1);
}

/* ── Warn / Actions ──────────────────────────────────────────────── */
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
.pef-actions {
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

/* ── Responsive ──────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .pef-header {
    flex-wrap: wrap;
  }
  .score-badge {
    align-self: flex-start;
  }
  .sex-grid {
    grid-template-columns: 1fr;
  }
  .input-grid {
    grid-template-columns: 1fr;
  }
  .input-card-full {
    grid-column: auto;
  }
  .pef-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .formula-row {
    flex-direction: column;
  }
}
</style>
