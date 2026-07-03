<script setup lang="ts">
import { ref, computed } from "vue";

// Bicarbonate Deficit (mEq) = 0.5 × Weight(kg) × (HCO3_desired - HCO3_observed)
// Give half over 3–4h, then reassess

const desiredVal = ref("");
const observedVal = ref("");
const weightVal = ref("");
const copied = ref(false);
const showResults = ref(false);

const D = computed(() => {
  const v = parseFloat(desiredVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const O = computed(() => {
  const v = parseFloat(observedVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const W = computed(() => {
  const v = parseFloat(weightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const isComplete = computed(
  () => D.value !== null && O.value !== null && W.value !== null,
);

const deficit = computed(() => {
  if (!isComplete.value) return null;
  const d = 0.5 * W.value! * (D.value! - O.value!);
  return Math.round(d * 10) / 10;
});

const halfDose = computed(() =>
  deficit.value !== null && deficit.value > 0
    ? Math.round((deficit.value / 2) * 10) / 10
    : null,
);

const severity = computed(() => {
  const o = O.value;
  if (o === null)
    return {
      label: "尚未計算",
      color: "pending",
      advice: "請輸入三個數值以計算碳酸氫鈉缺乏量",
    };
  if (o >= 22)
    return {
      label: "正常",
      color: "normal",
      advice: "實測 HCO₃⁻ 正常，無需補充碳酸氫鈉",
    };
  if (o >= 18)
    return {
      label: "輕度代謝性酸中毒",
      color: "mild",
      advice: "首次給予計算量的 50%，3–4 小時後複查血氣",
    };
  if (o >= 10)
    return {
      label: "中度代謝性酸中毒",
      color: "moderate",
      advice: "首次給予計算量的 50%，密切監測血氣及電解質",
    };
  return {
    label: "重度代謝性酸中毒",
    color: "critical",
    advice: "重度酸中毒，謹慎補充，避免過度糾正及低鉀血症",
  };
});

// bar fill: map deficit value to a 0–100% scale (cap at 200 mEq as max visual)
const barPct = computed(() => {
  if (deficit.value === null || deficit.value <= 0) return 0;
  return Math.min((deficit.value / 200) * 100, 100);
});

function generateOutput() {
  return (
    `# 碳酸氫鈉缺乏量計算\n\n` +
    `## 輸入數值\n\n` +
    `- **目標 HCO₃⁻（Desired）**：${D.value ?? "—"} mmol/L\n` +
    `- **實測 HCO₃⁻（Observed）**：${O.value ?? "—"} mmol/L\n` +
    `- **體重（Weight）**：${W.value ?? "—"} kg\n\n` +
    `## 結果\n\n` +
    `- **Bicarbonate Deficit = ${deficit.value ?? "—"} mEq**\n` +
    `- 首次給予劑量（50%）：${halfDose.value ?? "—"} mEq / 3–4 小時\n` +
    `- 評估：${severity.value.label}\n` +
    `- ${severity.value.advice}`
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateOutput());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  desiredVal.value = "";
  observedVal.value = "";
  weightVal.value = "";
  showResults.value = false;
}
</script>

<template>
  <div class="bdc">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="bdc-header">
      <div class="header-title">
        <h2 class="title">碳酸氫鈉缺乏量</h2>
        <p class="subtitle">
          Bicarbonate Deficit · 代謝性酸中毒補充計算 · Deficit = 0.5 × W × (HCO₃
          desired − HCO₃ observed)
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{
          deficit !== null && deficit > 0 ? deficit : "—"
        }}</span>
        <span class="score-unit" v-if="deficit !== null && deficit > 0"
          >mEq</span
        >
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
        <span class="tick-abs green" style="left: 0%">0</span>
        <span class="tick-abs green" style="left: 25%">≥22</span>
        <span class="tick-abs yellow" style="left: 50%">18–21</span>
        <span class="tick-abs orange" style="left: 75%">10–17</span>
        <span class="tick-abs red" style="left: 100%">&lt;10</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs green" style="left: 25%">正常</span>
        <span class="label-abs yellow" style="left: 50%">輕度</span>
        <span class="label-abs orange" style="left: 75%">中度</span>
        <span class="label-abs red" style="left: 100%">重度</span>
      </div>
    </div>

    <!-- ── Input Group ────────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar bdc-bar">
        <span class="group-icon">🧪</span>
        <span class="group-label-text">數值輸入</span>
        <span class="group-sub-text">Bicarbonate &amp; Weight</span>
        <span class="group-score-tally bdc-tally">
          {{ deficit !== null && deficit > 0 ? deficit + " mEq" : "—" }}
        </span>
      </div>

      <div class="group-items">
        <!-- Desired HCO3 -->
        <div
          class="nihss-item"
          :class="{ scored: D !== null, 'bdc-scored': D !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum bdc-qnum">Des</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">目標碳酸氫鈉 Desired HCO₃⁻</span>
              <span class="item-sub">通常設定為 22 mmol/L（正常下限）</span>
            </div>
            <span class="item-score" :class="{ zero: D === null }">
              {{ D !== null ? D + " mmol/L" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="desiredVal"
              type="number"
              min="1"
              max="30"
              step="0.5"
              placeholder="通常為 22 mmol/L"
              class="bdc-input"
            />
            <span class="input-unit">mmol/L</span>
          </div>
        </div>

        <!-- Observed HCO3 -->
        <div
          class="nihss-item"
          :class="{ scored: O !== null, 'bdc-scored': O !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum bdc-qnum">Obs</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">實測碳酸氫鈉 Observed HCO₃⁻</span>
              <span class="item-sub">由動脈血氣或靜脈血氣報告取得</span>
            </div>
            <span class="item-score" :class="{ zero: O === null }">
              {{ O !== null ? O + " mmol/L" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="observedVal"
              type="number"
              min="1"
              max="40"
              step="0.5"
              placeholder="mmol/L"
              class="bdc-input"
            />
            <span class="input-unit">mmol/L</span>
          </div>
        </div>

        <!-- Weight -->
        <div
          class="nihss-item"
          :class="{ scored: W !== null, 'bdc-scored': W !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum bdc-qnum">Wt</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">體重 Body Weight</span>
              <span class="item-sub">使用實際體重（Actual Body Weight）</span>
            </div>
            <span class="item-score" :class="{ zero: W === null }">
              {{ W !== null ? W + " kg" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="weightVal"
              type="number"
              min="10"
              max="200"
              step="0.1"
              placeholder="kg"
              class="bdc-input"
            />
            <span class="input-unit">kg</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Formula display ────────────────────────────────────── -->
    <div class="formula-box" v-if="isComplete && deficit !== null">
      <span class="formula-label">計算過程：</span>
      <span class="formula-text">
        Deficit = 0.5 × {{ W }} × ({{ D }} − {{ O }}) = 0.5 × {{ W }} ×
        {{ (D! - O!).toFixed(1) }} =
        <strong>{{ deficit }} mEq</strong>
      </span>
    </div>

    <!-- ── Reference table ───────────────────────────────────── -->
    <div class="ref-table">
      <div class="rt-row rt-header">
        <span>HCO₃⁻（mmol/L）</span><span>酸鹼狀態</span><span>pH 估算</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': O !== null && O >= 22 }">
        <span class="rt-s normal-t">≥ 22</span>
        <span>正常</span>
        <span class="rt-sm">7.35–7.45</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': O !== null && O >= 18 && O < 22 }"
      >
        <span class="rt-s mild-t">18–21</span>
        <span>輕度代謝性酸中毒</span>
        <span class="rt-sm">7.30–7.35</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': O !== null && O >= 10 && O < 18 }"
      >
        <span class="rt-s moderate-t">10–17</span>
        <span>中度代謝性酸中毒</span>
        <span class="rt-sm">7.10–7.30</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': O !== null && O < 10 }">
        <span class="rt-s critical-t">&lt; 10</span>
        <span>重度代謝性酸中毒</span>
        <span class="rt-sm">&lt; 7.10</span>
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
        <span class="result-max" v-if="deficit !== null">mEq</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.label }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
        <span class="result-sub" v-if="halfDose !== null">
          首次給予 <strong>{{ halfDose }} mEq</strong>（計算量 50%）靜脈輸注 /
          3–4 小時
        </span>
        <span class="result-sub" v-else-if="deficit !== null && deficit <= 0">
          實測 HCO₃⁻ ≥ 目標值，無需補充
        </span>
      </div>
    </div>

    <!-- ── Warning box ────────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >首次僅給予計算缺乏量的
        50%，避免過度糾正導致代謝性鹼中毒或低鉀血症。補充後需重新評估血氣及電解質。</span
      >
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>

      <div class="detail-row">
        <span class="detail-qnum">Des</span>
        <span class="detail-domain">目標 HCO₃⁻（Desired）</span>
        <span class="detail-score">{{ D !== null ? D : "—" }}</span>
        <span class="detail-desc">mmol/L</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Obs</span>
        <span class="detail-domain">實測 HCO₃⁻（Observed）</span>
        <span class="detail-score">{{ O !== null ? O : "—" }}</span>
        <span class="detail-desc">mmol/L</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Wt</span>
        <span class="detail-domain">體重（Body Weight）</span>
        <span class="detail-score">{{ W !== null ? W : "—" }}</span>
        <span class="detail-desc">kg</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">½</span>
        <span class="detail-domain">首次給予量（50% 初始劑量）</span>
        <span class="detail-score">{{
          halfDose !== null ? halfDose : "—"
        }}</span>
        <span class="detail-desc">mEq / 3–4h</span>
      </div>

      <div class="detail-row detail-total">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">碳酸氫鈉缺乏量（最終結果）</span>
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
          <span class="detail-desc-unit">mEq</span>
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
.bdc {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.bdc-header {
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
  min-width: 90px;
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
  margin-bottom: 1.75rem;
}

.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #7c3aed;
  margin-bottom: 0.6rem;
}

.bdc-bar {
  border-left: 3px solid #14b8a6;
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
.bdc-tally {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.12);
}

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
.nihss-item.bdc-scored {
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
  font-size: 0.7rem;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  letter-spacing: 0.04em;
}
.bdc-qnum {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.12);
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
  color: #14b8a6;
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

.bdc-input {
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
.bdc-input::-webkit-outer-spin-button,
.bdc-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.bdc-input:focus {
  border-color: #14b8a6;
}
.bdc-input::placeholder {
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
  grid-template-columns: 110px 1fr 90px;
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

.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #14b8a6;
  flex-shrink: 0;
  width: 36px;
  padding-top: 1px;
}
.detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}

/* Flat NIHSS-style right columns: score (right-aligned) | desc (left-aligned) */
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
  width: 80px; /* wide enough for "mmol/L" and "mEq / 3–4h" */
  text-align: left;
  white-space: normal;
}

/* Last ∑ row: unit on first line, severity label on second line */
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
  white-space: nowrap;
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
  .bdc-header {
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
  .rt-row {
    grid-template-columns: 80px 1fr;
  }
  .rt-row span:last-child {
    display: none;
  }
}
</style>
