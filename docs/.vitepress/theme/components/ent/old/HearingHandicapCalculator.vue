<script setup lang="ts">
import { ref, computed } from "vue";

// ── Input refs ────────────────────────────────────────────────────
// Each ear: 500, 1000, 2000, 4000 Hz
const rFreqs = ["500", "1000", "2000", "4000"];
const lFreqs = ["500", "1000", "2000", "4000"];

const right = ref<Record<string, string>>({
  "500": "",
  "1000": "",
  "2000": "",
  "4000": "",
});
const left = ref<Record<string, string>>({
  "500": "",
  "1000": "",
  "2000": "",
  "4000": "",
});

const showResults = ref(false);
const copied = ref(false);

// ── Input field refs for focus management ─────────────────────────
// IDs: r500, r1000, r2000, r4000, l500, l1000, l2000, l4000
const fieldOrder = [
  "r500",
  "r1000",
  "r2000",
  "r4000",
  "l500",
  "l1000",
  "l2000",
  "l4000",
];

function nextField(current: string) {
  const idx = fieldOrder.indexOf(current);
  if (idx < fieldOrder.length - 1) {
    const nextId = fieldOrder[idx + 1];
    const el = document.getElementById(nextId);
    el?.focus();
    (el as HTMLInputElement)?.select();
  }
}

function onKeydown(e: KeyboardEvent, fieldId: string) {
  if (e.key === "Enter") {
    e.preventDefault();
    nextField(fieldId);
  }
}

// ── Helpers ───────────────────────────────────────────────────────
function parseHz(ear: "right" | "left", hz: string): number | null {
  const v = ear === "right" ? right.value[hz] : left.value[hz];
  const n = parseFloat(v);
  return isNaN(n) ? null : Math.max(0, Math.min(120, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ── PTA = (500 + 1000 + 2000 + 4000) / 4 ────────────────────────
const ptaRight = computed((): number | null => {
  const vals = ["500", "1000", "2000", "4000"].map((hz) =>
    parseHz("right", hz),
  );
  if (vals.some((v) => v === null)) return null;
  return round1(vals.reduce((s, v) => s! + v!, 0)! / 4);
});

const ptaLeft = computed((): number | null => {
  const vals = ["500", "1000", "2000", "4000"].map((hz) => parseHz("left", hz));
  if (vals.some((v) => v === null)) return null;
  return round1(vals.reduce((s, v) => s! + v!, 0)! / 4);
});

// ── Single-ear disability rate ────────────────────────────────────
// Formula: (PTA - 25) × 1.5   clamped 0–100%
// If PTA ≤ 25 → 0%; if PTA ≥ 91.7 → 100%
function singleEarRate(pta: number | null): number | null {
  if (pta === null) return null;
  if (pta <= 25) return 0;
  const rate = (pta - 25) * 1.5;
  return round1(Math.min(100, rate));
}

const rateRight = computed(() => singleEarRate(ptaRight.value));
const rateLeft = computed(() => singleEarRate(ptaLeft.value));

// ── Binaural overall disability rate ─────────────────────────────
// Better ear × 5 + Worse ear × 1 ÷ 6
const overallRate = computed((): number | null => {
  if (rateRight.value === null || rateLeft.value === null) return null;
  const better = Math.min(rateRight.value, rateLeft.value);
  const worse = Math.max(rateRight.value, rateLeft.value);
  return round1((better * 5 + worse) / 6);
});

// ── Disability classification ─────────────────────────────────────
// Based on 衛福部《身心障礙者鑑定作業辦法》b230 binaural overall rate
// b230.0: < 45% 且 單耳 < 90 dB → 未達標準
// b230.1: 45–70% 或 單耳 ≥ 90 dB 且另耳 ≥ 48 dB → 輕度
// b230.2: 70.1–90% → 中度
// b230.3: > 90% → 重度
const disabilityLevel = computed(() => {
  const r = overallRate.value;
  const rR = rateRight.value;
  const rL = rateLeft.value;
  const pR = ptaRight.value;
  const pL = ptaLeft.value;
  if (r === null || rR === null || rL === null || pR === null || pL === null)
    return null;

  const worseEarPTA = Math.max(pR, pL);
  const betterEarPTA = Math.min(pR, pL);

  // b230.3: overall > 90%
  if (r > 90)
    return {
      code: "b2303",
      level: "重度聽覺功能障礙",
      color: "severe",
      detail: "雙耳整體障礙比率 > 90%",
    };

  // b230.2: overall 70.1–90%
  if (r > 70)
    return {
      code: "b2302",
      level: "中度聽覺功能障礙",
      color: "moderate",
      detail: "雙耳整體障礙比率 70.1–90%",
    };

  // b230.1: overall 45–70%，OR 單耳 ≥ 90 dB 且另耳 ≥ 48 dB
  const oneEarSevere = worseEarPTA >= 90 && betterEarPTA >= 48;
  if (r >= 45 || oneEarSevere)
    return {
      code: "b2301",
      level: "輕度聽覺功能障礙",
      color: "mild",
      detail:
        r >= 45
          ? `雙耳整體障礙比率 ${r}%（45–70%）`
          : `單耳 PTA ≥ 90 dB 且另耳 PTA ≥ 48 dB`,
    };

  // b230.0
  return {
    code: "b230.0",
    level: "未達身心障礙標準",
    color: "normal",
    detail: "雙耳整體障礙比率 < 45%，且不符合單耳條件",
  };
});

const isComplete = computed(() =>
  ["500", "1000", "2000", "4000"].every(
    (hz) => right.value[hz] !== "" && left.value[hz] !== "",
  ),
);

// ── Markdown output ───────────────────────────────────────────────
function generateMarkdown() {
  const dl = disabilityLevel.value;
  return `# 聽覺障礙鑑定計算結果

## 純音聽力閾值（dB HL）

| 頻率 | 右耳 | 左耳 |
| ---- | ---- | ---- |
| 500 Hz | ${right.value["500"]} | ${left.value["500"]} |
| 1000 Hz | ${right.value["1000"]} | ${left.value["1000"]} |
| 2000 Hz | ${right.value["2000"]} | ${left.value["2000"]} |
| 4000 Hz | ${right.value["4000"]} | ${left.value["4000"]} |

## 計算結果

- **右耳 PTA**：${ptaRight.value ?? "—"} dB
- **左耳 PTA**：${ptaLeft.value ?? "—"} dB
- **右耳單耳聽障比率**：${rateRight.value ?? "—"} %
- **左耳單耳聽障比率**：${rateLeft.value ?? "—"} %
- **雙耳整體障礙比率**：${overallRate.value ?? "—"} %

## 鑑定結果

- **障礙等級**：${dl?.level ?? "—"}
- **ICF 編碼**：${dl?.code ?? "無"}
- **說明**：${dl?.detail ?? "—"}`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  right.value = { "500": "", "1000": "", "2000": "", "4000": "" };
  left.value = { "500": "", "1000": "", "2000": "", "4000": "" };
  showResults.value = false;
}
</script>

<template>
  <div class="hearing">
    <!-- Header -->
    <div class="hearing-header">
      <div class="header-title">
        <h2 class="title">聽覺障礙鑑定計算器</h2>
        <p class="subtitle">
          依據《身心障礙者鑑定作業辦法》（衛福部） · ICF b230
        </p>
      </div>
      <div class="score-badge" :class="disabilityLevel?.color ?? 'unset'">
        <span class="score-number">{{
          overallRate !== null ? overallRate + "%" : "—"
        }}</span>
        <span class="score-label">雙耳整體</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      輸入各頻率純音氣導聽閾（dB HL），按 Enter 跳至下一格。系統自動計算
      PTA、單耳比率與雙耳整體障礙比率。
    </div>

    <!-- Input table -->
    <div class="input-section">
      <div class="input-header-row gradient-header">
        <div class="input-freq-label"></div>
        <div class="input-ear-label right-ear">右耳（紅）</div>
        <div class="input-ear-label left-ear">左耳（藍）</div>
      </div>

      <div
        v-for="hz in ['500', '1000', '2000', '4000']"
        :key="hz"
        class="input-row"
      >
        <div class="input-freq">{{ hz }} Hz</div>

        <!-- Right ear -->
        <div class="input-cell">
          <div
            class="input-wrap right-wrap"
            :class="{
              filled: right[hz] !== '',
              error:
                right[hz] !== '' &&
                (parseFloat(right[hz]) < 0 || parseFloat(right[hz]) > 120),
            }"
          >
            <input
              :id="`r${hz}`"
              type="number"
              min="0"
              max="120"
              step="5"
              placeholder="dB"
              v-model="right[hz]"
              @keydown="(e) => onKeydown(e, `r${hz}`)"
              class="hz-input"
            />
            <span class="input-unit">dB</span>
          </div>
        </div>

        <!-- Left ear -->
        <div class="input-cell">
          <div
            class="input-wrap left-wrap"
            :class="{
              filled: left[hz] !== '',
              error:
                left[hz] !== '' &&
                (parseFloat(left[hz]) < 0 || parseFloat(left[hz]) > 120),
            }"
          >
            <input
              :id="`l${hz}`"
              type="number"
              min="0"
              max="120"
              step="5"
              placeholder="dB"
              v-model="left[hz]"
              @keydown="(e) => onKeydown(e, `l${hz}`)"
              class="hz-input"
            />
            <span class="input-unit">dB</span>
          </div>
        </div>
      </div>

      <!-- PTA row -->
      <div class="pta-row">
        <div class="input-freq pta-label">PTA 平均</div>
        <div class="input-cell">
          <div class="pta-result right-pta">
            {{ ptaRight !== null ? ptaRight + " dB" : "—" }}
          </div>
        </div>
        <div class="input-cell">
          <div class="pta-result left-pta">
            {{ ptaLeft !== null ? ptaLeft + " dB" : "—" }}
          </div>
        </div>
      </div>

      <!-- Single-ear rate row -->
      <div class="pta-row">
        <div class="input-freq pta-label">單耳比率</div>
        <div class="input-cell">
          <div class="pta-result right-pta">
            {{ rateRight !== null ? rateRight + " %" : "—" }}
          </div>
        </div>
        <div class="input-cell">
          <div class="pta-result left-pta">
            {{ rateLeft !== null ? rateLeft + " %" : "—" }}
          </div>
        </div>
      </div>
    </div>

    <!-- Binaural overall rate -->
    <div class="overall-card">
      <div class="overall-label">雙耳整體障礙比率</div>
      <div class="overall-formula">優耳比率 × 5 + 劣耳比率 × 1 ÷ 6</div>
      <div class="overall-value" :class="disabilityLevel?.color ?? 'unset'">
        {{ overallRate !== null ? overallRate + " %" : "— %" }}
      </div>
    </div>

    <!-- Result card -->
    <div class="hearing-result" :class="disabilityLevel?.color ?? 'unset'">
      <div class="result-left">
        <span class="result-number">{{
          overallRate !== null ? overallRate : "—"
        }}</span>
        <span class="result-max">%</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{
          disabilityLevel?.level ?? "請輸入聽力資料"
        }}</span>
        <span class="result-code" v-if="disabilityLevel?.code"
          >ICF 編碼：{{ disabilityLevel.code }}</span
        >
        <span class="result-advice">{{ disabilityLevel?.detail ?? "" }}</span>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">計算明細</div>
      <div class="detail-row">
        <span class="detail-domain">右耳 PTA</span>
        <span class="detail-score right-color">{{ ptaRight ?? "—" }}</span>
        <span class="detail-desc">dB HL（500＋1k＋2k＋4kHz ÷ 4）</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">左耳 PTA</span>
        <span class="detail-score left-color">{{ ptaLeft ?? "—" }}</span>
        <span class="detail-desc">dB HL</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">右耳單耳比率</span>
        <span class="detail-score right-color">{{ rateRight ?? "—" }}</span>
        <span class="detail-desc">% （PTA − 25）× 1.5，上限 100%</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">左耳單耳比率</span>
        <span class="detail-score left-color">{{ rateLeft ?? "—" }}</span>
        <span class="detail-desc">%</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">雙耳整體比率</span>
        <span class="detail-score brand-color">{{ overallRate ?? "—" }}</span>
        <span class="detail-desc">% （優耳 × 5 ＋ 劣耳）÷ 6</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">優耳 PTA</span>
        <span class="detail-score brand-color">
          {{
            ptaRight !== null && ptaLeft !== null
              ? Math.min(ptaRight, ptaLeft)
              : "—"
          }}
        </span>
        <span class="detail-desc">dB HL（用於障礙等級判定）</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">鑑定結果</span>
        <span class="detail-score brand-color">{{
          disabilityLevel?.code ?? "無"
        }}</span>
        <span class="detail-desc">{{ disabilityLevel?.level ?? "—" }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="hearing-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="incomplete-hint">
      請完成所有頻率輸入以啟用複製功能
    </p>
  </div>
</template>

<style scoped>
.hearing {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ---- Header ---------------------------------------------------- */
.hearing-header {
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
  min-width: 88px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}
.score-number {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
}
.score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
}

.score-badge.unset {
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
  border-color: #f97316;
  color: #f97316;
}
.score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
}

/* ---- Intro ----------------------------------------------------- */
.intro-bar {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--vp-c-brand-1);
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}
.intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

/* ---- Input section --------------------------------------------- */
.input-section {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.input-header-row {
  display: grid;
  grid-template-columns: 100px 1fr 1fr;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 0.5rem 0.9rem;
  gap: 0.75rem;
}
.input-header-row.gradient-header {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.08), transparent);
}

.input-freq-label {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  font-weight: 700;
}

.input-ear-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
}
.right-ear {
  color: #dc2626;
}
.left-ear {
  color: #2563eb;
}

.input-row {
  display: grid;
  grid-template-columns: 100px 1fr 1fr;
  gap: 0.75rem;
  padding: 0.55rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  align-items: center;
  transition: background 0.15s;
}
.input-row:hover {
  background: var(--vp-c-bg-soft);
}

.pta-row {
  display: grid;
  grid-template-columns: 100px 1fr 1fr;
  gap: 0.75rem;
  padding: 0.55rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  align-items: center;
  background: var(--vp-c-bg-mute);
}
.pta-row:last-child {
  border-bottom: none;
}

.input-freq {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.pta-label {
  color: var(--vp-c-text-3);
  font-weight: 600;
}

.input-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0 10px;
  background: var(--vp-c-bg);
  transition: border-color 0.15s;
  width: 110px;
}

.input-wrap:focus-within {
  border-color: var(--vp-c-brand-1);
}
.input-wrap.right-wrap.filled:not(.error) {
  border-color: #dc2626;
}
.input-wrap.left-wrap.filled:not(.error) {
  border-color: #2563eb;
}
.input-wrap.error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.hz-input {
  width: 60px;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  padding: 0.5rem 0;
  outline: none;
  font-family: inherit;
  -moz-appearance: textfield;
}
.hz-input::-webkit-outer-spin-button,
.hz-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.hz-input::placeholder {
  color: var(--vp-c-text-3);
  font-weight: 400;
}

.input-unit {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

.pta-result {
  font-size: 0.88rem;
  font-weight: 800;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  min-width: 80px;
  text-align: center;
}
.right-pta {
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.3);
}
.left-pta {
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.3);
}

/* ---- Overall card ---------------------------------------------- */
.overall-card {
  padding: 1rem 1.25rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.overall-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex-shrink: 0;
}

.overall-formula {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  flex: 1;
}

.overall-value {
  font-size: 1.6rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 80px;
  text-align: right;
}
.overall-value.unset {
  color: var(--vp-c-text-3);
}
.overall-value.normal {
  color: #22c55e;
}
.overall-value.mild {
  color: #f59e0b;
}
.overall-value.moderate {
  color: #f97316;
}
.overall-value.severe {
  color: #ef4444;
}

/* ---- Result card ----------------------------------------------- */
.hearing-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: border-color 0.3s;
}

.hearing-result.normal {
  border-color: #22c55e;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.06), transparent);
}
.hearing-result.mild {
  border-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.06), transparent);
}
.hearing-result.moderate {
  border-color: #f97316;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), transparent);
}
.hearing-result.severe {
  border-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.06), transparent);
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
.hearing-result.normal .result-number {
  color: #22c55e;
}
.hearing-result.mild .result-number {
  color: #f59e0b;
}
.hearing-result.moderate .result-number {
  color: #f97316;
}
.hearing-result.severe .result-number {
  color: #ef4444;
}

.result-max {
  font-size: 1.2rem;
  color: var(--vp-c-text-3);
}

.result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: auto;
  text-align: right;
}
.result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-code {
  font-size: 0.78rem;
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
.result-advice {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

/* ---- Results detail -------------------------------------------- */
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
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}

.detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 196px;
  text-align: left;
}

.right-color {
  color: #dc2626;
}
.left-color {
  color: #2563eb;
}
.brand-color {
  color: var(--vp-c-brand-1);
}

/* ---- Actions --------------------------------------------------- */
.hearing-actions {
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

.incomplete-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
  .hearing-header {
    flex-direction: column;
  }
  .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
  .score-number {
    font-size: 1.3rem;
  }
  .hearing-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .input-header-row,
  .input-row,
  .pta-row {
    grid-template-columns: 80px 1fr 1fr;
    gap: 0.5rem;
    padding: 0.5rem 0.6rem;
  }
  .input-wrap {
    width: 90px;
  }
  .hz-input {
    width: 44px;
  }
  .overall-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
  }
  .overall-value {
    text-align: left;
  }

  .result-right {
    margin-left: 0;
    text-align: left;
    align-items: flex-start;
  }
}
</style>
