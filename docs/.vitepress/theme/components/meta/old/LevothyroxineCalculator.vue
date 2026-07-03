<script setup lang="ts">
import { ref, computed } from "vue";

// ── Available tablet strengths (mcg) ─────────────────────────────
const tabletStrengths = [
  25, 50, 75, 88, 100, 112, 125, 137, 150, 175, 200, 300,
];

// ── Dose multipliers by clinical scenario ─────────────────────────
// Full replacement (total thyroidectomy / severe primary hypothyroidism): 1.6 mcg/kg/day
// Partial replacement (mild–moderate, intact thyroid): 1.0–1.2 mcg/kg/day
// Subclinical hypothyroidism: 0.5–0.75 mcg/kg/day
// Elderly / cardiac risk: 0.8–1.0 mcg/kg/day (start low)
const scenarios = [
  {
    key: "full",
    name: "完全替代（全甲狀腺切除 / 嚴重原發性甲狀腺功能低下）",
    sub: "Full Replacement — Total Thyroidectomy / Severe Primary Hypothyroidism",
    dose: 1.6,
    doseRange: "1.6",
    hint: "標準全劑量替代，適用於無甲狀腺功能殘留的患者",
    color: "full",
  },
  {
    key: "partial",
    name: "部分替代（輕中度原發性甲狀腺功能低下，甲狀腺殘存功能）",
    sub: "Partial Replacement — Mild to Moderate Primary Hypothyroidism",
    dose: 1.1,
    doseRange: "1.0–1.2",
    hint: "甲狀腺仍有部分功能殘存（如橋本氏甲狀腺炎早期），起始劑量較低",
    color: "partial",
  },
  {
    key: "subclinical",
    name: "亞臨床甲狀腺功能低下（TSH 輕度升高，T4 正常）",
    sub: "Subclinical Hypothyroidism — TSH Mildly Elevated, Normal Free T4",
    dose: 0.625,
    doseRange: "0.5–0.75",
    hint: "僅 TSH 升高而 FT4 正常，是否治療需個別化評估，劑量較保守",
    color: "subclinical",
  },
  {
    key: "elderly",
    name: "老年患者 / 心臟疾病高風險（建議低劑量起始）",
    sub: "Elderly / High Cardiac Risk — Start Low, Go Slow",
    dose: 0.9,
    doseRange: "0.8–1.0",
    hint: "≥ 65 歲或有心臟病史，建議從 12.5–25 mcg/day 起始，4–8 週後依 TSH 調整",
    color: "elderly",
  },
];

// ── State ─────────────────────────────────────────────────────────
const weightUnit = ref<"kg" | "lbs">("kg");
const weightInput = ref<string>("");
const selectedScenario = ref<string>("full");
const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const weightKg = computed(() => {
  const w = parseFloat(weightInput.value);
  if (isNaN(w) || w <= 0) return null;
  return weightUnit.value === "lbs" ? Math.round((w / 2.2046) * 10) / 10 : w;
});

const scenario = computed(
  () => scenarios.find((s) => s.key === selectedScenario.value) ?? scenarios[0],
);

const calculatedDose = computed(() => {
  if (weightKg.value === null) return null;
  return Math.round(weightKg.value * scenario.value.dose * 10) / 10;
});

// Round to nearest available tablet strength
const recommendedDose = computed(() => {
  if (calculatedDose.value === null) return null;
  // Find nearest tablet strength
  let nearest = tabletStrengths[0];
  let minDiff = Math.abs(calculatedDose.value - tabletStrengths[0]);
  for (const s of tabletStrengths) {
    const diff = Math.abs(calculatedDose.value - s);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = s;
    }
  }
  return nearest;
});

// Alternative combinations
const combinations = computed(() => {
  if (calculatedDose.value === null) return [];
  const target = calculatedDose.value;
  const combos: { label: string; diff: number }[] = [];

  // Single pill (already in recommendedDose)
  // Look for 2-pill combos within ±15 mcg
  for (const a of tabletStrengths) {
    for (const b of tabletStrengths) {
      if (b < a) continue;
      const sum = a + b;
      const diff = Math.abs(sum - target);
      if (diff <= 15 && diff > 0) {
        combos.push({ label: `${a} mcg + ${b} mcg = ${sum} mcg`, diff });
      }
    }
  }
  // Sort by closeness, take top 3
  combos.sort((x, y) => x.diff - y.diff);
  return combos.slice(0, 3);
});

// Daily dose severity indicator
const doseSeverity = computed(() => {
  const d = calculatedDose.value;
  if (d === null) return "unset";
  if (d <= 75) return "low";
  if (d <= 150) return "mid";
  return "high";
});

const isValid = computed(
  () => weightKg.value !== null && weightKg.value > 0 && weightKg.value < 300,
);

// ── Functions ─────────────────────────────────────────────────────
function toggleUnit() {
  const w = parseFloat(weightInput.value);
  if (weightUnit.value === "kg") {
    weightUnit.value = "lbs";
    if (!isNaN(w))
      weightInput.value = (Math.round(w * 2.2046 * 10) / 10).toString();
  } else {
    weightUnit.value = "kg";
    if (!isNaN(w))
      weightInput.value = (Math.round((w / 2.2046) * 10) / 10).toString();
  }
}

function generateMarkdown() {
  const today = new Date();
  const date = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
  const sc = scenario.value;
  return `# Levothyroxine 劑量計算結果

## 評估日期：${date}

## 患者資料

- **體重**：${weightInput.value} ${weightUnit.value}（${weightKg.value} kg）
- **臨床情境**：${sc.name}
- **劑量係數**：${sc.dose} mcg/kg/day（範圍：${sc.doseRange} mcg/kg/day）

## 計算結果

- **計算劑量**：${calculatedDose.value} mcg/day
- **建議錠劑強度**：${recommendedDose.value} mcg/day（最接近的市售規格）

## 用藥指示

- 空腹服用，以清水送服，建議早晨起床後立即服藥
- 服藥後 30–60 分鐘再進食或服用其他藥物
- 鈣劑、鐵劑（含綜合維他命）需與甲狀腺素間隔至少 4 小時
- 治療開始後 4–8 週追蹤 TSH，依結果調整劑量 12.5–25 mcg

> 劑量僅供參考，請依臨床判斷及 TSH 監測結果調整。`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  weightInput.value = "";
  selectedScenario.value = "full";
  showResults.value = false;
}
</script>

<template>
  <div class="levo">
    <!-- Header -->
    <div class="levo-header">
      <div class="header-title">
        <h2 class="title">Levothyroxine 劑量計算器</h2>
        <p class="subtitle">
          體重為基礎的甲狀腺素替代劑量 · 成人原發性甲狀腺功能低下
        </p>
      </div>
      <div class="dose-badge" :class="doseSeverity">
        <span class="dose-number">{{ calculatedDose ?? "—" }}</span>
        <span class="dose-unit">mcg/day</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >輸入患者體重並選擇臨床情境，系統自動計算體重基礎 Levothyroxine
        替代劑量，並推薦最接近的市售錠劑規格。</span
      >
    </div>

    <!-- Weight input -->
    <div class="input-section">
      <div class="input-header">
        <span class="input-label">患者體重</span>
        <button class="unit-toggle" @click="toggleUnit">
          <span :class="{ 'unit-active': weightUnit === 'kg' }">kg</span>
          <span class="unit-sep">/</span>
          <span :class="{ 'unit-active': weightUnit === 'lbs' }">lbs</span>
        </button>
      </div>
      <div
        class="weight-input-wrap"
        :class="{
          'input-filled': weightInput !== '',
          'input-error': weightInput !== '' && !isValid,
        }"
      >
        <input
          v-model="weightInput"
          type="number"
          :placeholder="
            weightUnit === 'kg' ? '輸入體重（kg）' : '輸入體重（lbs）'
          "
          min="1"
          max="500"
          step="0.1"
          class="weight-input"
        />
        <span class="weight-unit-label">{{ weightUnit }}</span>
        <span v-if="weightKg !== null && isValid" class="weight-converted">
          ≈
          {{
            weightUnit === "kg"
              ? (weightKg * 2.2046).toFixed(1) + " lbs"
              : weightKg + " kg"
          }}
        </span>
      </div>
      <div v-if="weightInput !== '' && !isValid" class="weight-error">
        請輸入有效體重（1–300 kg）
      </div>
    </div>

    <!-- Clinical scenario selector -->
    <div class="scenario-section">
      <div class="scenario-label">臨床情境選擇</div>
      <div class="scenario-list">
        <div
          v-for="sc in scenarios"
          :key="sc.key"
          class="scenario-card"
          :class="{
            'sc-selected': selectedScenario === sc.key,
            [sc.color + '-card']: true,
          }"
          @click="selectedScenario = sc.key"
        >
          <div class="sc-radio">
            <div
              class="radio-circle"
              :class="{ checked: selectedScenario === sc.key }"
            >
              <span v-if="selectedScenario === sc.key" class="radio-dot" />
            </div>
          </div>
          <div class="sc-content">
            <div class="sc-name">{{ sc.name }}</div>
            <div class="sc-sub">{{ sc.sub }}</div>
            <div class="sc-dose-tag" :class="sc.color + '-tag'">
              {{ sc.doseRange }} mcg/kg/day
            </div>
            <div class="sc-hint">{{ sc.hint }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calculation result -->
    <div class="calc-result" :class="{ 'result-ready': isValid }">
      <!-- Formula display -->
      <div class="formula-row">
        <div class="formula-block">
          <span class="formula-label">體重</span>
          <span class="formula-val">{{ weightKg ?? "—" }}</span>
          <span class="formula-unit">kg</span>
        </div>
        <span class="formula-op">×</span>
        <div class="formula-block">
          <span class="formula-label">係數</span>
          <span class="formula-val">{{ scenario.dose }}</span>
          <span class="formula-unit">mcg/kg</span>
        </div>
        <span class="formula-op">=</span>
        <div class="formula-block result-block">
          <span class="formula-label">計算劑量</span>
          <span class="formula-val result-val" :class="doseSeverity">{{
            calculatedDose ?? "—"
          }}</span>
          <span class="formula-unit">mcg/day</span>
        </div>
      </div>

      <!-- Recommended tablet -->
      <div v-if="isValid && recommendedDose !== null" class="tablet-rec">
        <div class="tablet-icon">💊</div>
        <div class="tablet-content">
          <div class="tablet-title">建議錠劑強度</div>
          <div class="tablet-dose">{{ recommendedDose }} mcg/day</div>
          <div class="tablet-note">
            最接近計算值（{{ calculatedDose }} mcg）的市售規格， 誤差
            {{
              Math.abs((recommendedDose ?? 0) - (calculatedDose ?? 0)).toFixed(
                1,
              )
            }}
            mcg
          </div>
        </div>
      </div>

      <!-- Combination alternatives -->
      <div v-if="isValid && combinations.length > 0" class="combos">
        <div class="combos-title">替代組合方案</div>
        <div v-for="(c, i) in combinations" :key="i" class="combo-row">
          <span class="combo-bullet">·</span>
          <span class="combo-label">{{ c.label }}</span>
          <span class="combo-diff">誤差 {{ c.diff.toFixed(0) }} mcg</span>
        </div>
      </div>
    </div>

    <!-- Clinical notes -->
    <div v-if="isValid" class="clinical-notes">
      <div class="notes-header">📋 用藥指示</div>
      <div class="note-group">
        <div class="note-title">服藥方式</div>
        <ul class="note-list">
          <li>空腹服用，以清水送服，建議<strong>早晨起床後立即服藥</strong></li>
          <li>服藥後 <strong>30–60 分鐘</strong>再進食或服用其他藥物</li>
          <li>
            鈣劑、鐵劑（含綜合維他命）與甲狀腺素至少間隔 <strong>4 小時</strong>
          </li>
          <li>
            若偏好晚間服藥，需在最後一餐後 <strong>3–4 小時</strong>再服用
          </li>
        </ul>
      </div>
      <div class="note-group">
        <div class="note-title">追蹤監測</div>
        <ul class="note-list">
          <li>治療開始或劑量調整後 <strong>4–8 週</strong>追蹤 TSH</li>
          <li>TSH 穩定後每 <strong>6–12 個月</strong>追蹤一次</li>
          <li>劑量調整幅度：每次增減 <strong>12.5–25 mcg</strong></li>
          <li>
            若需求顯著超過體重計算劑量（> 200–300
            mcg/day），需評估<strong>吸收不良</strong>或<strong>服藥順從性</strong>問題
          </li>
        </ul>
      </div>
      <div v-if="scenario.key === 'elderly'" class="note-group elderly-note">
        <div class="note-title">⚠ 老年患者特別注意</div>
        <ul class="note-list">
          <li>
            建議從 <strong>12.5–25 mcg/day 起始</strong>，每 4–8 週增加 12.5–25
            mcg
          </li>
          <li>心房顫動或心絞痛患者需特別謹慎，避免甲狀腺素過量誘發心律不整</li>
          <li>目標 TSH 可稍高（1–4 mIU/L），不必追求與年輕人相同範圍</li>
        </ul>
      </div>
    </div>

    <!-- Tablet strengths reference -->
    <div class="tablet-ref">
      <div class="ref-title">市售 Levothyroxine 錠劑規格（mcg）</div>
      <div class="tablet-grid">
        <span
          v-for="s in tabletStrengths"
          :key="s"
          class="tablet-chip"
          :class="{ 'chip-recommended': s === recommendedDose && isValid }"
        >
          {{ s }}
        </span>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults && isValid" class="results-detail">
      <div class="results-header">計算明細</div>
      <div class="detail-row">
        <span class="detail-domain">體重</span>
        <span class="detail-score brand">{{ weightKg }}</span>
        <span class="detail-desc">kg</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">劑量係數</span>
        <span class="detail-score brand">{{ scenario.dose }}</span>
        <span class="detail-desc">mcg/kg/day</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">計算劑量</span>
        <span class="detail-score brand">{{ calculatedDose }}</span>
        <span class="detail-desc">mcg/day</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-domain">建議錠劑規格</span>
        <span class="detail-score brand">{{ recommendedDose }}</span>
        <span class="detail-desc">mcg/day</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="levo-actions">
      <button
        class="btn-view"
        @click="showResults = !showResults"
        :disabled="!isValid"
      >
        {{ showResults ? "收起明細" : "查看計算明細" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown" :disabled="!isValid">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isValid && weightInput === ''" class="progress-hint">
      請輸入體重以開始計算
    </p>
  </div>
</template>

<style scoped>
.levo {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.levo-header {
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

.dose-badge {
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
.dose-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
}
.dose-unit {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  color: var(--vp-c-text-3);
}
.dose-badge.low {
  border-color: #22c55e;
}
.dose-badge.low .dose-number {
  color: #22c55e;
}
.dose-badge.mid {
  border-color: #6366f1;
}
.dose-badge.mid .dose-number {
  color: #6366f1;
}
.dose-badge.high {
  border-color: #f97316;
}
.dose-badge.high .dose-number {
  color: #f97316;
}
.dose-badge.low {
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.dose-badge.mid {
  box-shadow:
    0 0 0 1px rgba(99, 102, 241, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.dose-badge.high {
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ── Intro ─────────────────────────────────────────────────────── */
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

/* ── Weight input ──────────────────────────────────────────────── */
.input-section {
  margin-bottom: 1.5rem;
}

.input-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.input-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.unit-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  font-family: inherit;
  transition: all 0.2s;
}
.unit-toggle:hover {
  border-color: var(--vp-c-brand-1);
}
.unit-active {
  color: var(--vp-c-brand-1);
}
.unit-sep {
  color: var(--vp-c-divider);
}

.weight-input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  padding: 0 1rem;
  transition: border-color 0.2s;
}
.weight-input-wrap:focus-within {
  border-color: var(--vp-c-brand-1);
}
.weight-input-wrap.input-filled:not(.input-error) {
  border-color: #22c55e;
}
.weight-input-wrap.input-error {
  border-color: #ef4444;
}

.weight-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  padding: 0.75rem 0;
  outline: none;
  font-family: inherit;
  -moz-appearance: textfield;
  width: 0;
}
.weight-input::-webkit-outer-spin-button,
.weight-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.weight-input::placeholder {
  font-size: 1rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}

.weight-unit-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  padding-left: 0.5rem;
}
.weight-converted {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin-left: 0.5rem;
  white-space: nowrap;
}
.weight-error {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 4px;
  padding-left: 2px;
}

/* ── Scenario selector ─────────────────────────────────────────── */
.scenario-section {
  margin-bottom: 1.5rem;
}
.scenario-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 0.6rem;
}
.scenario-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.scenario-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.25s;
  user-select: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.scenario-card:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-mute);
}
.sc-selected {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.full-card.sc-selected {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.partial-card.sc-selected {
  border-color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}
.subclinical-card.sc-selected {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.elderly-card.sc-selected {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}

.sc-radio {
  flex-shrink: 0;
  padding-top: 3px;
}
.radio-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.radio-circle.checked {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
.radio-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
}

.sc-content {
  flex: 1;
  min-width: 0;
}
.sc-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  line-height: 1.4;
  margin-bottom: 2px;
}
.sc-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  margin-bottom: 5px;
}
.sc-dose-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  margin-bottom: 4px;
}
.full-tag {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}
.partial-tag {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
}
.subclinical-tag {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}
.elderly-tag {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
}

.sc-hint {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  font-style: italic;
  line-height: 1.4;
}

/* ── Calculation result ────────────────────────────────────────── */
.calc-result {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  overflow: hidden;
  margin-bottom: 1rem;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.calc-result.result-ready {
  border-color: var(--vp-c-brand-1);
}

/* Formula row */
.formula-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}
.formula-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 70px;
}
.formula-label {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.formula-val {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.formula-unit {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
}
.formula-op {
  font-size: 1.4rem;
  font-weight: 300;
  color: var(--vp-c-text-3);
}
.result-block {
  flex-grow: 1;
}
.result-val {
  transition: color 0.3s;
}
.result-val.low {
  color: #22c55e;
}
.result-val.mid {
  color: #6366f1;
}
.result-val.high {
  color: #f97316;
}

/* Tablet recommendation */
.tablet-rec {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.tablet-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}
.tablet-content {
  flex: 1;
}
.tablet-title {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  margin-bottom: 2px;
  font-weight: 700;
}
.tablet-dose {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  line-height: 1;
  margin-bottom: 3px;
}
.tablet-note {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}

/* Combination alternatives */
.combos {
  padding: 0.85rem 1.5rem;
}
.combos-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.4rem;
}
.combo-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}
.combo-bullet {
  color: var(--vp-c-brand-1);
  font-size: 1rem;
}
.combo-label {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  font-weight: 600;
  flex: 1;
}
.combo-diff {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}

/* ── Clinical notes ────────────────────────────────────────────── */
.clinical-notes {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.notes-header {
  padding: 0.55rem 1rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.note-group {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.note-group:last-child {
  border-bottom: none;
}
.note-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 0.4rem;
}
.note-list {
  margin: 0;
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.note-list li {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.55;
}
.elderly-note {
  background: rgba(249, 115, 22, 0.05);
  border-left: 3px solid #f97316;
}
.elderly-note .note-title {
  color: #f97316;
}

/* ── Tablet strength reference ─────────────────────────────────── */
.tablet-ref {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background: var(--vp-c-bg-soft);
}
.ref-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem;
}
.tablet-grid {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.tablet-chip {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  transition: all 0.2s;
}
.chip-recommended {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
  transform: scale(1.1);
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
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.total-row {
  background: var(--vp-c-bg-mute);
}
.detail-domain {
  font-size: 0.78rem;
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
  color: var(--vp-c-text-3);
}
.detail-score.brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.levo-actions {
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
  .levo-header {
    flex-direction: column;
  }
  .dose-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
  .dose-number {
    font-size: 1.5rem;
  }
  .formula-row {
    gap: 0.4rem;
    padding: 1rem;
  }
  .formula-val {
    font-size: 1.2rem;
  }
  .tablet-rec {
    padding: 0.85rem 1rem;
  }
}
</style>
