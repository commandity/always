<script setup lang="ts">
import { ref, computed } from "vue";

// URR (%) = (PreBUN - PostBUN) / PreBUN × 100
// Target: URR ≥ 65% (KDOQI minimum)
// URR ≥ 70% = Excellent

const preBunVal = ref("");
const postBunVal = ref("");
const copied = ref(false);
const showResults = ref(false);

const Pre = computed(() => {
  const v = parseFloat(preBunVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const Post = computed(() => {
  const v = parseFloat(postBunVal.value);
  return isNaN(v) || v < 0 ? null : v;
});

const isComplete = computed(() => Pre.value !== null && Post.value !== null);

const urr = computed(() => {
  if (!isComplete.value || Post.value! >= Pre.value!) return null;
  return Math.round(((Pre.value! - Post.value!) / Pre.value!) * 100 * 10) / 10;
});

// bar fill: URR 0–100%
const barPct = computed(() => {
  if (urr.value === null) return 0;
  return Math.min(urr.value, 100);
});

const adequacy = computed(() => {
  const u = urr.value;
  if (u === null)
    return {
      label: "尚未計算",
      color: "pending",
      advice: "請輸入透析前後 BUN 值以計算尿素減少率",
    };
  if (u >= 70)
    return {
      label: "充分透析（優良）",
      color: "normal",
      advice: "URR ≥ 70%：透析劑量充足，預後良好，維持現有處方",
    };
  if (u >= 65)
    return {
      label: "充分透析（達標）",
      color: "mild",
      advice: "URR 65–70%：達到 KDOQI 最低標準，建議持續監測",
    };
  if (u >= 55)
    return {
      label: "邊緣不足（Marginal）",
      color: "moderate",
      advice: "URR 55–65%：透析不足，建議延長時間或增加血流量",
    };
  return {
    label: "嚴重不足（Inadequate）",
    color: "critical",
    advice: "URR < 55%：透析劑量嚴重不足，需立即重新評估透析處方",
  };
});

function generateOutput() {
  return (
    `# 尿素減少率（URR）計算\n\n` +
    `## 輸入數值\n\n` +
    `- **透析前 BUN（Pre-BUN）**：${Pre.value ?? "—"} mg/dL\n` +
    `- **透析後 BUN（Post-BUN）**：${Post.value ?? "—"} mg/dL\n\n` +
    `## 結果\n\n` +
    `- **URR = ${urr.value ?? "—"}%**\n` +
    `- 評估：${adequacy.value.label}\n` +
    `- ${adequacy.value.advice}`
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateOutput());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  preBunVal.value = "";
  postBunVal.value = "";
  showResults.value = false;
}
</script>

<template>
  <div class="urr">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="urr-header">
      <div class="header-title">
        <h2 class="title">URR 尿素減少率</h2>
        <p class="subtitle">
          Urea Reduction Ratio · 血液透析充分度評估 · URR = (Pre − Post) / Pre ×
          100
        </p>
      </div>
      <div class="score-badge" :class="adequacy.color">
        <span class="score-number">{{ urr !== null ? urr : "—" }}</span>
        <span class="score-unit" v-if="urr !== null">%</span>
        <span class="score-label">{{ adequacy.label }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="adequacy.color"
          :style="{ width: barPct + '%' }"
        />
        <!-- KDOQI target marker at 65% -->
        <div class="bar-target-line" style="left: 65%" />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs" style="left: 0%">0%</span>
        <span class="tick-abs red" style="left: 55%">55%</span>
        <span class="tick-abs yellow" style="left: 65%">65% ▾</span>
        <span class="tick-abs green" style="left: 70%">70%</span>
        <span class="tick-abs" style="left: 100%">100%</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs" style="left: 0%"></span>
        <span class="label-abs red" style="left: 55%">不足</span>
        <span class="label-abs yellow" style="left: 65%">邊緣</span>
        <span class="label-abs green" style="left: 70%">優良</span>
        <span class="label-abs" style="left: 100%"></span>
      </div>
    </div>

    <!-- ── Input Group ────────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar urr-bar">
        <span class="group-icon">🩸</span>
        <span class="group-label-text">BUN 數值輸入</span>
        <span class="group-sub-text">透析前後尿素氮 — mg/dL</span>
        <span class="group-score-tally urr-tally">
          {{ urr !== null ? urr + "%" : "—" }}
        </span>
      </div>

      <div class="group-items">
        <!-- Pre-BUN -->
        <div
          class="nihss-item"
          :class="{ scored: Pre !== null, 'urr-scored': Pre !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum urr-qnum">Pre</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">透析前 BUN（Pre-dialysis BUN）</span>
              <span class="item-sub"
                >透析開始前抽血，代表未清除的尿素氮基線值</span
              >
            </div>
            <span class="item-score" :class="{ zero: Pre === null }">
              {{ Pre !== null ? Pre + " mg/dL" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="preBunVal"
              type="number"
              min="1"
              max="300"
              step="0.1"
              placeholder="mg/dL"
              class="urr-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>

        <!-- Post-BUN -->
        <div
          class="nihss-item"
          :class="{ scored: Post !== null, 'urr-scored': Post !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum urr-qnum">Post</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">透析後 BUN（Post-dialysis BUN）</span>
              <span class="item-sub"
                >透析結束後 30 秒–1 分鐘抽血，避免再循環干擾結果</span
              >
            </div>
            <span class="item-score" :class="{ zero: Post === null }">
              {{ Post !== null ? Post + " mg/dL" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="postBunVal"
              type="number"
              min="0"
              max="300"
              step="0.1"
              placeholder="mg/dL"
              class="urr-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Formula display ────────────────────────────────────── -->
    <div class="formula-box" v-if="isComplete && urr !== null">
      <span class="formula-label">計算過程：</span>
      <span class="formula-text">
        URR = ({{ Pre }} − {{ Post }}) / {{ Pre }} × 100 = {{ Pre! - Post! }} /
        {{ Pre }} × 100 = <strong>{{ urr }}%</strong>
      </span>
    </div>

    <!-- ── Reference table ───────────────────────────────────── -->
    <div class="ref-table">
      <div class="rt-row rt-header">
        <span>URR</span><span>透析充分度</span><span>臨床建議</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': urr !== null && urr >= 70 }">
        <span class="rt-s normal-t">≥ 70%</span>
        <span>優良</span>
        <span class="rt-sm">維持現有透析處方</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': urr !== null && urr >= 65 && urr < 70 }"
      >
        <span class="rt-s mild-t">65–70%</span>
        <span>充分（KDOQI 最低標準）</span>
        <span class="rt-sm">持續監測</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': urr !== null && urr >= 55 && urr < 65 }"
      >
        <span class="rt-s moderate-t">55–65%</span>
        <span>邊緣不足</span>
        <span class="rt-sm">延長時間或增加血流量</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': urr !== null && urr < 55 }">
        <span class="rt-s critical-t">&lt; 55%</span>
        <span>嚴重透析不足</span>
        <span class="rt-sm">立即重新評估處方</span>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="nihss-result" :class="adequacy.color">
      <div class="result-left">
        <span class="result-number">{{ urr !== null ? urr : "—" }}</span>
        <span class="result-max" v-if="urr !== null">%</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ adequacy.label }}</span>
        <span class="result-advice">{{ adequacy.advice }}</span>
      </div>
    </div>

    <!-- ── Clinical note ──────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >URR
        是最簡便的透析充分度指標，但不含超濾因素。對血流動力學不穩定者，建議合併
        Kt/V（Daugirdas II）評估。透析後 BUN 應在血流停止 30
        秒後採樣以避免再循環干擾。</span
      >
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>

      <div class="detail-row">
        <span class="detail-qnum">Pre</span>
        <span class="detail-domain">透析前 BUN（Pre-dialysis BUN）</span>
        <span class="detail-score">{{ Pre !== null ? Pre : "—" }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Post</span>
        <span class="detail-domain">透析後 BUN（Post-dialysis BUN）</span>
        <span class="detail-score">{{ Post !== null ? Post : "—" }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">ΔBun</span>
        <span class="detail-domain">BUN 下降量（Pre − Post）</span>
        <span class="detail-score">{{
          Pre !== null && Post !== null ? (Pre - Post).toFixed(1) : "—"
        }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row detail-total">
        <span class="detail-qnum">URR</span>
        <span class="detail-domain">尿素減少率（最終結果）</span>
        <span class="detail-score detail-score-brand">{{
          urr !== null ? urr : "—"
        }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">%</span>
          <span class="detail-desc-label">{{ adequacy.label }}</span>
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
.urr {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.urr-header {
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
  font-size: 0.65rem;
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
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
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

/* KDOQI target marker at 65% */
.bar-target-line {
  position: absolute;
  top: -3px;
  width: 2px;
  height: 12px;
  background: rgba(34, 197, 94, 0.8);
  transform: translateX(-50%);
  border-radius: 1px;
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

.tick-abs.red,
.label-abs.red {
  color: #ef4444;
}
.tick-abs.yellow,
.label-abs.yellow {
  color: #f59e0b;
}
.tick-abs.green,
.label-abs.green {
  color: #22c55e;
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
  border-left: 3px solid #f97316;
  margin-bottom: 0.6rem;
}
.urr-bar {
  border-left: 3px solid #e879f9;
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
.urr-tally {
  color: #e879f9;
  background: rgba(232, 121, 249, 0.12);
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
.nihss-item.urr-scored {
  border-color: #e879f9;
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
  white-space: nowrap;
}
.urr-qnum {
  color: #e879f9;
  background: rgba(232, 121, 249, 0.12);
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
  color: #e879f9;
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

.urr-input {
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
.urr-input::-webkit-outer-spin-button,
.urr-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.urr-input:focus {
  border-color: #e879f9;
}
.urr-input::placeholder {
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
  grid-template-columns: 90px 1fr 150px;
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

/* ── Warning / clinical note ───────────────────────────────────── */
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
  color: #e879f9;
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
  .urr-header {
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
