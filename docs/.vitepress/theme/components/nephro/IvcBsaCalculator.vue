<script setup lang="ts">
import { ref, computed } from "vue";

// BSA (Mosteller): sqrt(Height(cm) × Weight(kg) / 3600)
// IVC/BSA Ratio = IVC Diameter (mm) / BSA (m²)
// Normal: 8–11.5 mm/m²  |  < 8 = hypovolemia  |  > 11.5 = volume overload

const heightVal = ref("");
const weightVal = ref("");
const ivcVal = ref("");
const copied = ref(false);
const showResults = ref(false);

const H = computed(() => {
  const v = parseFloat(heightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const W = computed(() => {
  const v = parseFloat(weightVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const IV = computed(() => {
  const v = parseFloat(ivcVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const isComplete = computed(
  () => H.value !== null && W.value !== null && IV.value !== null,
);

const bsa = computed(() => {
  if (H.value === null || W.value === null) return null;
  return Math.round(Math.sqrt((H.value * W.value) / 3600) * 100) / 100;
});

const ratio = computed(() => {
  if (bsa.value === null || IV.value === null) return null;
  return Math.round((IV.value / bsa.value) * 10) / 10;
});

// bar fill: ratio 0–20 mapped to 0–100%
const barPct = computed(() => {
  if (ratio.value === null) return 0;
  return Math.min((ratio.value / 20) * 100, 100);
});

const severity = computed(() => {
  const r = ratio.value;
  if (r === null)
    return {
      label: "尚未計算",
      color: "pending",
      advice: "請輸入身高、體重及 IVC 直徑以計算 IVC/BSA 比值",
    };
  if (r < 8)
    return {
      label: "低血容量",
      color: "mild",
      advice: "IVC/BSA < 8 mm/m²：可能為脫水或低血容量狀態，評估是否需要補液",
    };
  if (r <= 11.5)
    return {
      label: "正常範圍",
      color: "normal",
      advice: "IVC/BSA 8–11.5 mm/m²：體積狀態正常範圍內",
    };
  if (r <= 14)
    return {
      label: "輕度體積過載",
      color: "moderate",
      advice: "IVC/BSA 11.5–14 mm/m²：輕度體積過載，建議結合臨床評估",
    };
  return {
    label: "明顯體積過載",
    color: "critical",
    advice: "IVC/BSA > 14 mm/m²：顯著體積過載，建議利尿或超濾治療",
  };
});

function generateOutput() {
  return (
    `# IVC/BSA 比值計算\n\n` +
    `## 輸入數值\n\n` +
    `- **身高（Height）**：${H.value ?? "—"} cm\n` +
    `- **體重（Weight）**：${W.value ?? "—"} kg\n` +
    `- **IVC 直徑（IVC Diameter）**：${IV.value ?? "—"} mm\n` +
    `- **體表面積（BSA）**：${bsa.value ?? "—"} m²\n\n` +
    `## 結果\n\n` +
    `- **IVC/BSA = ${ratio.value ?? "—"} mm/m²**\n` +
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
  heightVal.value = "";
  weightVal.value = "";
  ivcVal.value = "";
  showResults.value = false;
}
</script>

<template>
  <div class="ivc">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="ivc-header">
      <div class="header-title">
        <h2 class="title">IVC / BSA 比值</h2>
        <p class="subtitle">
          Inferior Vena Cava / Body Surface Area · 體積狀態評估 · IVC/BSA =
          IVC(mm) ÷ BSA(m²)
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ ratio !== null ? ratio : "—" }}</span>
        <span class="score-unit" v-if="ratio !== null">mm/m²</span>
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
        <span class="tick-abs" style="left: 0%">0</span>
        <span class="tick-abs yellow" style="left: 25%">8</span>
        <span class="tick-abs green" style="left: 50%">11.5</span>
        <span class="tick-abs orange" style="left: 75%">14</span>
        <span class="tick-abs red" style="left: 100%">20+</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs" style="left: 0%"></span>
        <span class="label-abs yellow" style="left: 25%">低血容量</span>
        <span class="label-abs green" style="left: 50%">正常</span>
        <span class="label-abs orange" style="left: 75%">輕度過載</span>
        <span class="label-abs red" style="left: 100%">明顯過載</span>
      </div>
    </div>

    <!-- ── Input Group ────────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar ivc-bar">
        <span class="group-icon">🫀</span>
        <span class="group-label-text">數值輸入</span>
        <span class="group-sub-text">Height — cm · Weight — kg · IVC — mm</span>
        <span class="group-score-tally ivc-tally">
          {{ ratio !== null ? ratio + " mm/m²" : "—" }}
        </span>
      </div>

      <div class="group-items">
        <!-- Height -->
        <div
          class="nihss-item"
          :class="{ scored: H !== null, 'ivc-scored': H !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ivc-qnum">Ht</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">身高 Height</span>
              <span class="item-sub"
                >用於 Mosteller 公式計算體表面積（BSA）</span
              >
            </div>
            <span class="item-score" :class="{ zero: H === null }">
              {{ H !== null ? H + " cm" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="heightVal"
              type="number"
              min="100"
              max="220"
              step="1"
              placeholder="cm"
              class="ivc-input"
            />
            <span class="input-unit">cm</span>
          </div>
        </div>

        <!-- Weight -->
        <div
          class="nihss-item"
          :class="{ scored: W !== null, 'ivc-scored': W !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ivc-qnum">Wt</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">體重 Weight</span>
              <span class="item-sub"
                >實際體重（Actual Body Weight），單位 kg</span
              >
            </div>
            <span class="item-score" :class="{ zero: W === null }">
              {{ W !== null ? W + " kg" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="weightVal"
              type="number"
              min="20"
              max="200"
              step="0.1"
              placeholder="kg"
              class="ivc-input"
            />
            <span class="input-unit">kg</span>
          </div>
        </div>

        <!-- IVC Diameter -->
        <div
          class="nihss-item"
          :class="{ scored: IV !== null, 'ivc-scored': IV !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ivc-qnum">IVC</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">下腔靜脈直徑 IVC Diameter</span>
              <span class="item-sub"
                >超音波測量，距右心房入口 1–2 cm 處，吸氣末期測量</span
              >
            </div>
            <span class="item-score" :class="{ zero: IV === null }">
              {{ IV !== null ? IV + " mm" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="ivcVal"
              type="number"
              min="1"
              max="50"
              step="0.1"
              placeholder="mm"
              class="ivc-input"
            />
            <span class="input-unit">mm</span>
          </div>
        </div>

        <!-- BSA (derived, read-only) -->
        <div class="nihss-item ivc-derived-item">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ivc-qnum">BSA</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >體表面積 Body Surface Area（自動計算）</span
              >
              <span class="item-sub"
                >Mosteller 公式：BSA = √(H × W / 3600)</span
              >
            </div>
            <span class="item-score" :class="{ zero: bsa === null }">
              {{ bsa !== null ? bsa + " m²" : "—" }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Formula display ────────────────────────────────────── -->
    <div class="formula-box" v-if="isComplete && ratio !== null">
      <span class="formula-label">計算過程：</span>
      <span class="formula-text">
        BSA = √({{ H }} × {{ W }} / 3600) = {{ bsa }} m² ； IVC/BSA = {{ IV }} ÷
        {{ bsa }} =
        <strong>{{ ratio }} mm/m²</strong>
      </span>
    </div>

    <!-- ── Reference table ───────────────────────────────────── -->
    <div class="ref-table">
      <div class="rt-row rt-header">
        <span>IVC/BSA（mm/m²）</span><span>體積狀態</span><span>臨床建議</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': ratio !== null && ratio < 8 }">
        <span class="rt-s mild-t">&lt; 8</span>
        <span>低血容量</span>
        <span class="rt-sm">評估補液需求</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': ratio !== null && ratio >= 8 && ratio <= 11.5 }"
      >
        <span class="rt-s normal-t">8–11.5</span>
        <span>正常範圍</span>
        <span class="rt-sm">定期追蹤</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': ratio !== null && ratio > 11.5 && ratio <= 14 }"
      >
        <span class="rt-s moderate-t">11.5–14</span>
        <span>輕度體積過載</span>
        <span class="rt-sm">結合臨床評估</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': ratio !== null && ratio > 14 }"
      >
        <span class="rt-s critical-t">&gt; 14</span>
        <span>明顯體積過載</span>
        <span class="rt-sm">利尿或超濾治療</span>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="nihss-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ ratio !== null ? ratio : "—" }}</span>
        <span class="result-max" v-if="ratio !== null">mm/m²</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.label }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
      </div>
    </div>

    <!-- ── Clinical note ──────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >IVC/BSA 比值需結合臨床症狀、腎功能及其他血流動力學指標綜合評估。IVC
        塌陷指數（Collapsibility
        Index）亦應同時考量以評估自主呼吸患者的容積狀態。</span
      >
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>

      <div class="detail-row">
        <span class="detail-qnum">Ht</span>
        <span class="detail-domain">身高（Height）</span>
        <span class="detail-score">{{ H !== null ? H : "—" }}</span>
        <span class="detail-desc">cm</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Wt</span>
        <span class="detail-domain">體重（Weight）</span>
        <span class="detail-score">{{ W !== null ? W : "—" }}</span>
        <span class="detail-desc">kg</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">IVC</span>
        <span class="detail-domain">下腔靜脈直徑（IVC Diameter）</span>
        <span class="detail-score">{{ IV !== null ? IV : "—" }}</span>
        <span class="detail-desc">mm</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">BSA</span>
        <span class="detail-domain">體表面積（Body Surface Area）</span>
        <span class="detail-score">{{ bsa !== null ? bsa : "—" }}</span>
        <span class="detail-desc">m²</span>
      </div>

      <div class="detail-row detail-total">
        <span class="detail-qnum">R</span>
        <span class="detail-domain">IVC/BSA 比值（最終結果）</span>
        <span class="detail-score detail-score-brand">{{
          ratio !== null ? ratio : "—"
        }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">mm/m²</span>
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
.ivc {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.ivc-header {
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
  font-size: 0.65rem;
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

.tick-abs.yellow,
.label-abs.yellow {
  color: #f59e0b;
}
.tick-abs.green,
.label-abs.green {
  color: #22c55e;
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
  border-left: 3px solid #22c55e;
  margin-bottom: 0.6rem;
}
.ivc-bar {
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
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.ivc-tally {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
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
.nihss-item.ivc-scored {
  border-color: #06b6d4;
}
.nihss-item.ivc-derived-item {
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
.nihss-item.ivc-derived-item .item-header {
  border-bottom: none;
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
.ivc-qnum {
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
  color: #06b6d4;
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

.ivc-input {
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
.ivc-input::-webkit-outer-spin-button,
.ivc-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.ivc-input:focus {
  border-color: #06b6d4;
}
.ivc-input::placeholder {
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
  grid-template-columns: 120px 1fr 110px;
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
  color: #06b6d4;
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
  .ivc-header {
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
    grid-template-columns: 90px 1fr;
  }
  .rt-row span:last-child {
    display: none;
  }
}
</style>
