<script setup lang="ts">
import { ref, computed } from "vue";

// Free Water Deficit (FWD):
// TBW  = LBM × 0.6 (male) or LBM × 0.5 (female)
// FWD  = TBW × (Na / 140 − 1)
// Safe correction: ≤ 0.5 mEq/L/hr Na drop
// Chronic hypernatremia: correct over 48–72 h
// Acute  hypernatremia: correct over 24 h

const lbmVal = ref("");
const naVal = ref("");
const gender = ref<"M" | "F">("M");
const copied = ref(false);
const showResults = ref(false);

const LBM = computed(() => {
  const v = parseFloat(lbmVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const Na = computed(() => {
  const v = parseFloat(naVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const isComplete = computed(() => LBM.value !== null && Na.value !== null);

// Gender color themes — flat strings, safe for template :style binding
const themeHex = computed(() => (gender.value === "M" ? "#38bdf8" : "#f472b6"));
const themeRgb = computed(() =>
  gender.value === "M" ? "56,189,248" : "244,114,182",
);

const tbwFactor = computed(() => (gender.value === "M" ? 0.6 : 0.5));
const tbw = computed(() =>
  LBM.value !== null ? Math.round(LBM.value * tbwFactor.value * 10) / 10 : null,
);

const deficit = computed(() => {
  if (!isComplete.value) return null;
  const d = tbw.value! * (Na.value! / 140 - 1);
  return Math.round(d * 100) / 100;
});

const corrRate48 = computed(() => {
  if (!deficit.value || deficit.value <= 0) return null;
  return Math.round((deficit.value / 48) * 1000 * 10) / 10;
});

const corrRate24 = computed(() => {
  if (!deficit.value || deficit.value <= 0) return null;
  return Math.round((deficit.value / 24) * 1000 * 10) / 10;
});

const barPct = computed(() => {
  if (Na.value === null) return 0;
  return Math.min(Math.max(((Na.value - 140) / 40) * 100, 0), 100);
});

const severity = computed(() => {
  const n = Na.value;
  if (n === null)
    return {
      label: "尚未計算",
      color: "pending",
      advice: "請輸入去脂體重與血鈉值以計算自由水缺乏量",
    };
  if (n <= 145)
    return {
      label: "正常血鈉",
      color: "normal",
      advice: "血鈉正常（≤ 145 mEq/L），無需補充自由水",
    };
  if (n <= 150)
    return {
      label: "輕度高血鈉",
      color: "mild",
      advice: "輕度高血鈉（146–150），建議口服補水或緩慢靜脈輸注",
    };
  if (n <= 160)
    return {
      label: "中度高血鈉",
      color: "moderate",
      advice: "中度高血鈉（151–160），慢性建議 48h 糾正，速率 ≤ 0.5 mEq/L/hr",
    };
  return {
    label: "重度高血鈉",
    color: "critical",
    advice: "重度高血鈉（> 160），需密切監測並謹慎補液，避免腦水腫",
  };
});

// Pre-computed for formula — avoids Na! non-null assertion in template
const naRatio = computed(() =>
  Na.value !== null ? (Na.value / 140 - 1).toFixed(4) : "—",
);

function generateOutput() {
  return (
    `# 自由水缺乏量計算\n\n` +
    `## 輸入數值\n\n` +
    `- **去脂體重（LBM）**：${LBM.value ?? "—"} kg\n` +
    `- **血鈉（Plasma Na）**：${Na.value ?? "—"} mEq/L\n` +
    `- **性別**：${gender.value === "M" ? "男性（TBW × 0.6）" : "女性（TBW × 0.5）"}\n` +
    `- **總體水量（TBW）**：${tbw.value ?? "—"} L\n\n` +
    `## 結果\n\n` +
    `- **自由水缺乏量 = ${deficit.value !== null && deficit.value > 0 ? deficit.value : 0} L**\n` +
    `- 評估：${severity.value.label}\n` +
    `- ${severity.value.advice}\n` +
    (corrRate48.value
      ? `- 建議補液速率（48h 慢性）：${corrRate48.value} mL/hr\n`
      : "") +
    (corrRate24.value
      ? `- 建議補液速率（24h 急性）：${corrRate24.value} mL/hr`
      : "")
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateOutput());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  lbmVal.value = "";
  naVal.value = "";
  showResults.value = false;
}
</script>

<template>
  <div class="h2o" :style="{ '--g': themeHex, '--g-rgb': themeRgb }">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="h2o-header">
      <div class="header-title">
        <h2 class="title">自由水缺乏量</h2>
        <p class="subtitle">
          Free Water Deficit · 高血鈉症補液計算 · FWD = TBW × (Na / 140 − 1)
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">
          {{ deficit !== null && deficit > 0 ? deficit : "—" }}
        </span>
        <span class="score-unit" v-if="deficit !== null && deficit > 0">L</span>
        <span class="score-label">{{ severity.label }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: barPct + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs green" style="left: 0%">140</span>
        <span class="tick-abs yellow" style="left: 25%">146</span>
        <span class="tick-abs orange" style="left: 50%">151</span>
        <span class="tick-abs red" style="left: 75%">161</span>
        <span class="tick-abs red" style="left: 100%">180</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs green" style="left: 0%">正常</span>
        <span class="label-abs yellow" style="left: 25%">輕度</span>
        <span class="label-abs orange" style="left: 50%">中度</span>
        <span class="label-abs red" style="left: 75%">重度</span>
        <span class="label-abs" style="left: 100%"></span>
      </div>
    </div>

    <!-- ── Gender selector ───────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar h2o-gender-bar">
        <span class="group-icon">⚧</span>
        <span class="group-label-text">性別選擇</span>
        <span class="group-sub-text">影響總體水量係數（TBW Factor）</span>
      </div>
      <div class="gender-toggle">
        <button
          class="btn-male"
          :class="{ 'active-m': gender === 'M' }"
          @click="gender = 'M'"
        >
          <span class="gender-icon">♂</span>
          <span class="gender-label">男性</span>
          <span class="gender-sub">TBW = LBM × 0.6</span>
        </button>
        <button
          class="btn-female"
          :class="{ 'active-f': gender === 'F' }"
          @click="gender = 'F'"
        >
          <span class="gender-icon">♀</span>
          <span class="gender-label">女性</span>
          <span class="gender-sub">TBW = LBM × 0.5</span>
        </button>
      </div>
    </div>

    <!-- ── Input Group ────────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar h2o-bar">
        <span class="group-icon">💧</span>
        <span class="group-label-text">數值輸入</span>
        <span class="group-sub-text">LBM — kg · Plasma Na — mEq/L</span>
        <span class="group-score-tally h2o-tally">
          {{ deficit !== null && deficit > 0 ? deficit + " L" : "—" }}
        </span>
      </div>

      <div class="group-items">
        <!-- LBM -->
        <div
          class="nihss-item"
          :class="{ scored: LBM !== null, 'h2o-scored': LBM !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum h2o-qnum">LBM</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">去脂體重 Lean Body Mass</span>
              <span class="item-sub"
                >排除脂肪的體重，可由實際體重估算或 DEXA 取得</span
              >
            </div>
            <span class="item-score" :class="{ zero: LBM === null }">
              {{ LBM !== null ? LBM + " kg" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="lbmVal"
              type="number"
              min="10"
              max="150"
              step="0.1"
              placeholder="kg"
              class="h2o-input"
            />
            <span class="input-unit">kg</span>
          </div>
        </div>

        <!-- Plasma Na -->
        <div
          class="nihss-item"
          :class="{ scored: Na !== null, 'h2o-scored': Na !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum h2o-qnum">Na⁺</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">血鈉 Plasma Sodium</span>
              <span class="item-sub"
                >由血液常規生化或電解質面板取得，正常值 135–145 mEq/L</span
              >
            </div>
            <span class="item-score" :class="{ zero: Na === null }">
              {{ Na !== null ? Na + " mEq/L" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="naVal"
              type="number"
              min="120"
              max="200"
              step="0.1"
              placeholder="mEq/L"
              class="h2o-input"
            />
            <span class="input-unit">mEq/L</span>
          </div>
        </div>

        <!-- TBW (derived, read-only) -->
        <div class="nihss-item h2o-derived-item">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum h2o-qnum">TBW</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >總體水量 Total Body Water（自動計算）</span
              >
              <span class="item-sub">
                TBW = LBM × {{ tbwFactor }}（{{
                  gender === "M" ? "男性係數 0.6" : "女性係數 0.5"
                }}）
              </span>
            </div>
            <span class="item-score" :class="{ zero: tbw === null }">
              {{ tbw !== null ? tbw + " L" : "—" }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Formula display ────────────────────────────────────── -->
    <div class="formula-box" v-if="isComplete && deficit !== null">
      <span class="formula-label">計算過程：</span>
      <span class="formula-text">
        TBW = {{ LBM }} × {{ tbwFactor }} = {{ tbw }} L ； FWD = {{ tbw }} × ({{
          Na
        }}
        / 140 − 1) = {{ tbw }} × {{ naRatio }} =
        <strong>{{ deficit }} L</strong>
      </span>
    </div>

    <!-- ── Reference table ───────────────────────────────────── -->
    <div class="ref-table">
      <div class="rt-row rt-header">
        <span>血鈉（mEq/L）</span><span>分級</span><span>糾正策略</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': Na !== null && Na <= 145 }">
        <span class="rt-s normal-t">≤ 145</span>
        <span>正常血鈉</span>
        <span class="rt-sm">無需補充</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': Na !== null && Na > 145 && Na <= 150 }"
      >
        <span class="rt-s mild-t">146–150</span>
        <span>輕度高血鈉</span>
        <span class="rt-sm">口服或緩慢靜脈</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': Na !== null && Na > 150 && Na <= 160 }"
      >
        <span class="rt-s moderate-t">151–160</span>
        <span>中度高血鈉</span>
        <span class="rt-sm">48h 糾正，≤ 0.5 mEq/L/hr</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': Na !== null && Na > 160 }">
        <span class="rt-s critical-t">&gt; 160</span>
        <span>重度高血鈉</span>
        <span class="rt-sm">密切監測，謹慎補液</span>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="nihss-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">
          {{
            deficit !== null && deficit > 0
              ? deficit
              : deficit !== null
                ? 0
                : "—"
          }}
        </span>
        <span class="result-max" v-if="deficit !== null">L</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.label }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
        <span class="result-sub" v-if="corrRate48 !== null">
          慢性補液（48h）：<strong>{{ corrRate48 }} mL/hr</strong> ｜
          急性補液（24h）：<strong>{{ corrRate24 }} mL/hr</strong>
        </span>
        <span class="result-sub" v-else-if="deficit !== null && deficit <= 0">
          血鈉正常，無需補充自由水
        </span>
      </div>
    </div>

    <!-- ── Warning box ────────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span>
        急性高血鈉（&lt; 48 小時）可在 24 小時內糾正；慢性高血鈉應在 48–72
        小時緩慢糾正，速率 ≤ 0.5 mEq/L/hr，以避免腦水腫。補液期間需每 2–4
        小時監測血鈉。
      </span>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>

      <div class="detail-row">
        <span class="detail-qnum">LBM</span>
        <span class="detail-domain">去脂體重（Lean Body Mass）</span>
        <span class="detail-score">{{ LBM !== null ? LBM : "—" }}</span>
        <span class="detail-desc">kg</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Na⁺</span>
        <span class="detail-domain">血鈉（Plasma Sodium）</span>
        <span class="detail-score">{{ Na !== null ? Na : "—" }}</span>
        <span class="detail-desc">mEq/L</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">性別</span>
        <span class="detail-domain">性別與 TBW 係數</span>
        <span class="detail-score">{{ gender === "M" ? "0.6" : "0.5" }}</span>
        <span class="detail-desc">{{ gender === "M" ? "男性" : "女性" }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">TBW</span>
        <span class="detail-domain">總體水量（Total Body Water）</span>
        <span class="detail-score">{{ tbw !== null ? tbw : "—" }}</span>
        <span class="detail-desc">L</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">48h</span>
        <span class="detail-domain">慢性補液速率（48 小時糾正）</span>
        <span class="detail-score">{{
          corrRate48 !== null ? corrRate48 : "—"
        }}</span>
        <span class="detail-desc">mL/hr</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">24h</span>
        <span class="detail-domain">急性補液速率（24 小時糾正）</span>
        <span class="detail-score">{{
          corrRate24 !== null ? corrRate24 : "—"
        }}</span>
        <span class="detail-desc">mL/hr</span>
      </div>

      <div class="detail-row detail-total">
        <span class="detail-qnum">FWD</span>
        <span class="detail-domain">自由水缺乏量（最終結果）</span>
        <span class="detail-score detail-score-brand">
          {{
            deficit !== null && deficit > 0
              ? deficit
              : deficit !== null
                ? 0
                : "—"
          }}
        </span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">L</span>
          <span class="detail-desc-label">{{ severity.label }}</span>
        </div>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="nihss-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyOutput">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
  </div>
</template>

<style scoped>
.h2o {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
  /* default theme = male sky blue */
  --g: #38bdf8;
  --g-rgb: 56, 189, 248;
}

/* ── Header ────────────────────────────────────────────────────── */
.h2o-header {
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
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}

.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}
.score-unit {
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 1px;
}
.score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.02em;
  text-align: center;
}

.score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2rem;
}

.severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}

.severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s ease,
    background 0.3s;
}
.severity-fill.pending {
  background: var(--vp-c-divider);
}
.severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.severity-ticks-abs,
.severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.severity-labels-abs {
  margin-top: 0px;
  height: 13px;
}

.tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  font-weight: 700;
}
.tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}

.label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}

.tick-abs.green,
.label-abs.green {
  color: #22c55e;
}
.tick-abs.yellow,
.label-abs.yellow {
  color: #f59e0b;
}
.tick-abs.orange,
.label-abs.orange {
  color: #f97316;
}
.tick-abs.red,
.label-abs.red {
  color: #ef4444;
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
  border-left: 3px solid #f59e0b;
  margin-bottom: 0.6rem;
}

/* Both bars use the gender theme color via CSS var */
.h2o-gender-bar {
  border-left: 3px solid var(--g);
}
.h2o-bar {
  border-left: 3px solid var(--g);
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
/* Tally uses gender theme */
.h2o-tally {
  color: var(--g);
  background: rgba(var(--g-rgb), 0.12);
}

/* ── Gender toggle ─────────────────────────────────────────────── */
.gender-toggle {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.gender-toggle button {
  flex: 1;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.65rem 1rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-2);
  transition: all 0.15s;
}

/* Male button: sky blue when active */
.btn-male.active-m {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.07);
  color: #38bdf8;
}
.btn-male.active-m .gender-sub {
  color: rgba(56, 189, 248, 0.65);
}

/* Female button: rose pink when active */
.btn-female.active-f {
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.07);
  color: #f472b6;
}
.btn-female.active-f .gender-sub {
  color: rgba(244, 114, 182, 0.65);
}

.gender-toggle button:hover:not(.active-m):not(.active-f) {
  border-color: var(--vp-c-text-3);
  color: var(--vp-c-text-1);
}

.gender-icon {
  font-size: 1.4rem;
  line-height: 1;
}
.gender-label {
  font-size: 0.85rem;
  font-weight: 700;
}
.gender-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  font-weight: 400;
}

/* ── Group items ───────────────────────────────────────────────── */
.group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ── Item card ─────────────────────────────────────────────────── */
.nihss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.nihss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
/* Scored items use gender theme border */
.nihss-item.h2o-scored {
  border-color: var(--g);
}
.nihss-item.h2o-derived-item {
  border-color: var(--vp-c-divider);
  opacity: 0.8;
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
.nihss-item.h2o-derived-item .item-header {
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
  padding: 1px 6px;
  border-radius: 999px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
/* Qnum badge uses gender theme */
.h2o-qnum {
  color: var(--g);
  background: rgba(var(--g-rgb), 0.12);
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

/* Item score uses gender theme */
.item-score {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--g);
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.item-score.zero {
  color: var(--vp-c-text-3);
}

/* ── Input row ─────────────────────────────────────────────────── */
.input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}

.h2o-input {
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
.h2o-input::-webkit-outer-spin-button,
.h2o-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
/* Focus ring uses gender theme */
.h2o-input:focus {
  border-color: var(--g);
}
.h2o-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}

.input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

/* ── Formula box ───────────────────────────────────────────────── */
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

/* ── Reference table ───────────────────────────────────────────── */
.ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.rt-row {
  display: grid;
  grid-template-columns: 100px 1fr 140px;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.rt-row:last-child {
  border-bottom: none;
}
.rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.rt-active {
  background: var(--vp-c-brand-soft);
}
.rt-s {
  font-weight: 800;
  font-family: monospace;
}
.normal-t {
  color: #22c55e;
}
.mild-t {
  color: #f59e0b;
}
.moderate-t {
  color: #f97316;
}
.critical-t {
  color: #ef4444;
}
.rt-sm {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

/* ── Result card ───────────────────────────────────────────────── */
.nihss-result {
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss-result.pending {
  border-color: var(--vp-c-divider);
}
.nihss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nihss-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
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
.nihss-result.normal .result-number {
  color: #22c55e;
}
.nihss-result.mild .result-number {
  color: #f59e0b;
}
.nihss-result.moderate .result-number {
  color: #f97316;
}
.nihss-result.critical .result-number {
  color: #ef4444;
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
  font-size: 0.8rem;
  color: var(--vp-c-brand-1);
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
  font-size: 0.9rem;
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

/* Detail qnum uses gender theme */
.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--g);
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

/* ── Actions ───────────────────────────────────────────────────── */
.nihss-actions {
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
.btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.btn-view:active {
  transform: translateY(0);
}

.btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.btn-copy:hover {
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

@media (max-width: 640px) {
  .h2o-header {
    flex-direction: column;
  }
  .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
  .score-number {
    font-size: 1.5rem;
  }
  .nihss-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .gender-toggle {
    flex-direction: column;
  }
  .gender-toggle button {
    min-width: unset;
    flex-direction: row;
    gap: 0.5rem;
  }
  .rt-row {
    grid-template-columns: 80px 1fr;
  }
  .rt-row span:last-child {
    display: none;
  }
}
</style>
