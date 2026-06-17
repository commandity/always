<script setup lang="ts">
import { ref, computed } from "vue";

// Access Recirculation
// R% = (Systemic BUN − Inlet BUN) / (Systemic BUN − Outlet BUN) × 100
// Systemic BUN = peripheral BUN (non-access arm)
// Inlet BUN    = arterial line BUN
// Outlet BUN   = venous line BUN
// Normal < 5% | Significant ≥ 10%

const systemic = ref("");
const inlet = ref("");
const outlet = ref("");
const copied = ref(false);
const showResults = ref(false);

const S = computed(() => {
  const v = parseFloat(systemic.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const I = computed(() => {
  const v = parseFloat(inlet.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const O = computed(() => {
  const v = parseFloat(outlet.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const isComplete = computed(
  () => S.value !== null && I.value !== null && O.value !== null,
);

const recirculation = computed(() => {
  if (!isComplete.value) return null;
  const denom = S.value! - O.value!;
  if (denom <= 0) return null;
  return Math.round(((S.value! - I.value!) / denom) * 100 * 100) / 100;
});

const effectivePct = computed(() => {
  if (recirculation.value === null || recirculation.value < 0) return null;
  return Math.round((100 - recirculation.value) * 10) / 10;
});

const severity = computed(() => {
  const r = recirculation.value;
  if (r === null)
    return {
      label: "尚未計算",
      color: "pending",
      detail: "請輸入三個 BUN 數值以計算再循環率",
    };
  if (r < 0)
    return {
      label: "計算結果異常",
      color: "pending",
      detail: "請確認 Inlet BUN 不應高於 Systemic BUN",
    };
  if (r < 5)
    return {
      label: "正常",
      color: "normal",
      detail: "無明顯再循環，血管通路功能良好",
    };
  if (r < 10)
    return {
      label: "輕度再循環",
      color: "mild",
      detail: "輕度再循環（5–10%），建議密切監測血管通路功能",
    };
  if (r < 20)
    return {
      label: "中度再循環",
      color: "moderate",
      detail: "顯著再循環（10–20%），透析效率下降，建議評估通路問題",
    };
  return {
    label: "重度再循環",
    color: "critical",
    detail: "嚴重再循環（≥ 20%），通路功能異常，需立即評估並可能需要介入處置",
  };
});

function generateOutput() {
  return (
    `# 血管通路再循環率\n\n` +
    `## 輸入數值\n\n` +
    `- **Systemic BUN（周邊靜脈）**：${S.value ?? "—"} mg/dL\n` +
    `- **Inlet BUN（動脈端）**：${I.value ?? "—"} mg/dL\n` +
    `- **Outlet BUN（靜脈端）**：${O.value ?? "—"} mg/dL\n\n` +
    `## 結果\n\n` +
    `- **再循環率 = ${recirculation.value ?? "—"}%**\n` +
    `- 有效透析清除率：${effectivePct.value ?? "—"}%\n` +
    `- 評估：${severity.value.label}\n` +
    `- ${severity.value.detail}`
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateOutput());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  systemic.value = "";
  inlet.value = "";
  outlet.value = "";
  showResults.value = false;
}
</script>

<template>
  <div class="arc">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="arc-header">
      <div class="header-title">
        <h2 class="title">血管通路再循環率</h2>
        <p class="subtitle">
          Access Recirculation · R = (S − I) / (S − O) × 100
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{
          recirculation !== null ? recirculation : "—"
        }}</span>
        <span class="score-unit" v-if="recirculation !== null">%</span>
        <span class="score-label">{{ severity.label }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{
            width:
              recirculation !== null && recirculation >= 0
                ? Math.min(recirculation, 100) + '%'
                : '0%',
          }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs" style="left: 0%">0%</span>
        <span class="tick-abs green" style="left: 25%">5%</span>
        <span class="tick-abs yellow" style="left: 50%">10%</span>
        <span class="tick-abs orange" style="left: 75%">20%</span>
        <span class="tick-abs red" style="left: 100%">100%</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs" style="left: 0%"></span>
        <span class="label-abs green" style="left: 25%">正常</span>
        <span class="label-abs yellow" style="left: 50%">輕度</span>
        <span class="label-abs orange" style="left: 75%">中度</span>
        <span class="label-abs red" style="left: 100%">重度</span>
      </div>
    </div>

    <!-- ── BUN Input Group ────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar bun-bar">
        <span class="group-icon">🩸</span>
        <span class="group-label-text">BUN 數值輸入</span>
        <span class="group-sub-text">Blood Urea Nitrogen — mg/dL</span>
        <span class="group-score-tally bun-tally">
          {{ recirculation !== null ? recirculation + "%" : "—" }}
        </span>
      </div>

      <div class="group-items">
        <!-- Systemic BUN -->
        <div
          class="nihss-item"
          :class="{ scored: S !== null, 'bun-scored': S !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum bun-qnum">S</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">Systemic BUN（周邊靜脈端）</span>
              <span class="item-sub"
                >從非透析側手臂抽血，代表全身循環的真實 BUN 濃度</span
              >
            </div>
            <span class="item-score" :class="{ zero: S === null }">
              {{ S !== null ? S + " mg/dL" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="systemic"
              type="number"
              min="0"
              step="0.1"
              placeholder="輸入 BUN 值（mg/dL）"
              class="bun-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>

        <!-- Inlet BUN -->
        <div
          class="nihss-item"
          :class="{ scored: I !== null, 'bun-scored': I !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum bun-qnum">I</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">Inlet BUN（動脈端）</span>
              <span class="item-sub"
                >從透析機動脈管路取樣，代表進入透析器前的血液 BUN</span
              >
            </div>
            <span class="item-score" :class="{ zero: I === null }">
              {{ I !== null ? I + " mg/dL" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="inlet"
              type="number"
              min="0"
              step="0.1"
              placeholder="輸入 BUN 值（mg/dL）"
              class="bun-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>

        <!-- Outlet BUN -->
        <div
          class="nihss-item"
          :class="{ scored: O !== null, 'bun-scored': O !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum bun-qnum">O</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">Outlet BUN（靜脈端）</span>
              <span class="item-sub"
                >從透析機靜脈管路取樣，代表經透析器清除後的血液 BUN</span
              >
            </div>
            <span class="item-score" :class="{ zero: O === null }">
              {{ O !== null ? O + " mg/dL" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="outlet"
              type="number"
              min="0"
              step="0.1"
              placeholder="輸入 BUN 值（mg/dL）"
              class="bun-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Formula display ────────────────────────────────────── -->
    <div class="formula-box" v-if="isComplete && recirculation !== null">
      <span class="formula-label">計算過程：</span>
      <span class="formula-text">
        R = ({{ S }} − {{ I }}) / ({{ S }} − {{ O }}) × 100 =
        {{ (S! - I!).toFixed(2) }} / {{ (S! - O!).toFixed(2) }} × 100 =
        <strong>{{ recirculation }}%</strong>
      </span>
    </div>

    <!-- ── Reference table ───────────────────────────────────── -->
    <div class="ref-table">
      <div class="rt-row rt-header">
        <span>再循環率</span><span>嚴重程度</span><span>臨床建議</span>
      </div>
      <div
        class="rt-row"
        :class="{
          'rt-active':
            recirculation !== null && recirculation >= 0 && recirculation < 5,
        }"
      >
        <span class="rt-s normal-t">&lt; 5%</span>
        <span>正常</span>
        <span class="rt-sm">定期追蹤</span>
      </div>
      <div
        class="rt-row"
        :class="{
          'rt-active':
            recirculation !== null && recirculation >= 5 && recirculation < 10,
        }"
      >
        <span class="rt-s mild-t">5–10%</span>
        <span>輕度</span>
        <span class="rt-sm">密切監測</span>
      </div>
      <div
        class="rt-row"
        :class="{
          'rt-active':
            recirculation !== null && recirculation >= 10 && recirculation < 20,
        }"
      >
        <span class="rt-s moderate-t">10–20%</span>
        <span>中度</span>
        <span class="rt-sm">評估通路</span>
      </div>
      <div
        class="rt-row"
        :class="{
          'rt-active': recirculation !== null && recirculation >= 20,
        }"
      >
        <span class="rt-s critical-t">≥ 20%</span>
        <span>重度</span>
        <span class="rt-sm">立即介入</span>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="nihss-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{
          recirculation !== null ? recirculation : "—"
        }}</span>
        <span class="result-max" v-if="recirculation !== null">%</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.label }}</span>
        <span class="result-advice">{{ severity.detail }}</span>
        <span class="result-sub" v-if="effectivePct !== null">
          有效透析清除率估算：<strong>{{ effectivePct }}%</strong>
        </span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>

      <div class="detail-row">
        <span class="detail-qnum">S</span>
        <span class="detail-domain">Systemic BUN（周邊靜脈端）</span>
        <span class="detail-score">{{ S !== null ? S : "—" }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">I</span>
        <span class="detail-domain">Inlet BUN（動脈端）</span>
        <span class="detail-score">{{ I !== null ? I : "—" }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">O</span>
        <span class="detail-domain">Outlet BUN（靜脈端）</span>
        <span class="detail-score">{{ O !== null ? O : "—" }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Eff</span>
        <span class="detail-domain">有效透析清除率</span>
        <span class="detail-score">{{
          effectivePct !== null ? effectivePct : "—"
        }}</span>
        <span class="detail-desc">%</span>
      </div>

      <div class="detail-row detail-total">
        <span class="detail-qnum">R%</span>
        <span class="detail-domain">再循環率（最終結果）</span>
        <span class="detail-score detail-score-brand">
          {{ recirculation !== null ? recirculation + "%" : "—" }}
        </span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">%</span>
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
.arc {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.arc-header {
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
  font-size: 1rem;
  font-weight: 700;
  margin-top: -2px;
}
.score-label {
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.03em;
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
  font-size: 0.68rem;
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
  border-left: 3px solid #14b8a6;
  margin-bottom: 0.6rem;
}

.bun-bar {
  border-left: 3px solid #3b82f6;
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
.bun-tally {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
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
.nihss-item.bun-scored {
  border-color: #3b82f6;
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
.bun-qnum {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
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

/* ── Input row ─────────────────────────────────────────────────── */
.input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}

.bun-input {
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
.bun-input::-webkit-outer-spin-button,
.bun-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.bun-input:focus {
  border-color: #3b82f6;
}
.bun-input::placeholder {
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
  grid-template-columns: 80px 1fr 1fr;
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
.rt-header span:last-child {
  text-align: right;
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
  text-align: right;
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
  color: #3b82f6;
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

/*
  Flat NIHSS-style row: qnum | domain (flex:1) | score (52px right) | desc (52px left)
*/

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

/* Last R% row: desc column becomes unit + severity label stacked */
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
  .arc-header {
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
}
</style>
