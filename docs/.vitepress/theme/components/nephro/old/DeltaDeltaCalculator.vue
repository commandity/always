<script setup lang="ts">
import { ref, computed } from "vue";

// Delta/Delta (Δ/Δ) ratio for mixed acid-base disorders:
// Anion Gap = Na - (Cl + HCO3)
// Normal AG = 12 mEq/L  |  Normal HCO3 = 24 mEq/L
// Delta AG   = AG - 12
// Delta HCO3 = 24 - HCO3 (observed)
// Delta/Delta = ΔAG / ΔHCO3 = (AG - 12) / (24 - HCO3)
//
// < 0.4  → Hyperchloremic (non-AG) metabolic acidosis only
// 0.4–1  → Mixed AG + non-AG metabolic acidosis
// 1–2    → Pure AG metabolic acidosis
// > 2    → AG metabolic acidosis + metabolic alkalosis

const naVal = ref("");
const clVal = ref("");
const hco3Val = ref("");
const copied = ref(false);
const showResults = ref(false);

const Na = computed(() => {
  const v = parseFloat(naVal.value);
  return isNaN(v) ? null : v;
});
const Cl = computed(() => {
  const v = parseFloat(clVal.value);
  return isNaN(v) ? null : v;
});
const HCO3 = computed(() => {
  const v = parseFloat(hco3Val.value);
  return isNaN(v) ? null : v;
});

const isComplete = computed(
  () => Na.value !== null && Cl.value !== null && HCO3.value !== null,
);

const ag = computed(() => {
  if (!isComplete.value) return null;
  return Math.round((Na.value! - (Cl.value! + HCO3.value!)) * 10) / 10;
});

const deltaAg = computed(() =>
  ag.value !== null ? Math.round((ag.value - 12) * 10) / 10 : null,
);

const deltaHco3 = computed(() =>
  HCO3.value !== null ? Math.round((24 - HCO3.value) * 10) / 10 : null,
);

const dd = computed(() => {
  if (deltaAg.value === null || deltaHco3.value === null) return null;
  if (deltaHco3.value <= 0) return null;
  return Math.round((deltaAg.value / deltaHco3.value) * 100) / 100;
});

const agSeverity = computed(() => {
  const g = ag.value;
  if (g === null) return { label: "尚未計算", color: "pending" };
  if (g <= 12) return { label: "正常 AG（≤ 12）", color: "normal" };
  if (g <= 16) return { label: "輕度升高 AG", color: "mild" };
  if (g <= 20) return { label: "中度升高 AG", color: "moderate" };
  return { label: "重度升高 AG", color: "critical" };
});

const ddInterp = computed(() => {
  const r = dd.value;
  if (r === null)
    return {
      label: "尚未計算",
      color: "pending",
      detail: "請輸入 Na、Cl、HCO₃ 三個數值",
      guide: "",
    };
  if (r < 0.4)
    return {
      label: "高氯性代謝性酸中毒",
      color: "moderate",
      detail:
        "Δ/Δ < 0.4：非陰離子間隙性（高氯性）代謝性酸中毒，AG 升高不成比例",
      guide: "考慮：腹瀉、腎小管性酸中毒（RTA）、鹽水輸注過多",
    };
  if (r < 1)
    return {
      label: "混合型：AG + 非AG酸中毒",
      color: "moderate",
      detail: "Δ/Δ 0.4–1：AG 代謝性酸中毒合併高氯性（非AG）代謝性酸中毒",
      guide: "考慮：DKA 合併腹瀉、尿毒症合併 RTA",
    };
  if (r <= 2)
    return {
      label: "純AG代謝性酸中毒",
      color: "mild",
      detail: "Δ/Δ 1–2：純粹的 AG 代謝性酸中毒，HCO₃ 降低與 AG 升高相稱",
      guide: "考慮：乳酸性酸中毒、DKA、水楊酸中毒",
    };
  return {
    label: "AG酸中毒合併代謝性鹼中毒",
    color: "critical",
    detail: "Δ/Δ > 2：AG 代謝性酸中毒合併代謝性鹼中毒，HCO₃ 降低幅度不足",
    guide: "考慮：DKA 合併嘔吐、乳酸性酸中毒合併利尿劑使用",
  };
});

// Bar: map dd to 0–100% (0→0%, 2→100% cap)
const barPct = computed(() => {
  if (dd.value === null || dd.value < 0) return 0;
  return Math.min((dd.value / 3) * 100, 100);
});

function generateOutput() {
  return (
    `# Delta/Delta 混合酸鹼分析\n\n` +
    `## 輸入數值\n\n` +
    `- **血清鈉 Na⁺**：${Na.value ?? "—"} mEq/L\n` +
    `- **血清氯 Cl⁻**：${Cl.value ?? "—"} mEq/L\n` +
    `- **血清碳酸氫根 HCO₃⁻**：${HCO3.value ?? "—"} mEq/L\n\n` +
    `## 計算結果\n\n` +
    `- **陰離子間隙 AG = ${ag.value ?? "—"} mEq/L**（${agSeverity.value.label}）\n` +
    `- ΔAG = ${deltaAg.value ?? "—"}  |  ΔHCO₃ = ${deltaHco3.value ?? "—"}\n` +
    `- **Δ/Δ = ${dd.value ?? "無法計算"}**\n` +
    `- 解讀：${ddInterp.value.label}\n` +
    `- ${ddInterp.value.detail}\n` +
    (ddInterp.value.guide ? `- 臨床考慮：${ddInterp.value.guide}` : "")
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateOutput());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  naVal.value = "";
  clVal.value = "";
  hco3Val.value = "";
  showResults.value = false;
}
</script>

<template>
  <div class="ddc">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="ddc-header">
      <div class="header-title">
        <h2 class="title">Delta/Delta 混合酸鹼分析</h2>
        <p class="subtitle">
          Δ/Δ Ratio · 陰離子間隙計算 · 混合性酸鹼異常鑑別 · Δ/Δ = (AG − 12) /
          (24 − HCO₃)
        </p>
      </div>
      <div class="score-badges">
        <div class="score-badge" :class="agSeverity.color">
          <span class="badge-label">AG</span>
          <span class="score-number">{{ ag ?? "—" }}</span>
          <span class="score-unit">mEq/L</span>
        </div>
        <div class="score-badge" :class="ddInterp.color">
          <span class="badge-label">Δ/Δ</span>
          <span class="score-number">{{ dd ?? "—" }}</span>
        </div>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="ddInterp.color"
          :style="{ width: barPct + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs" style="left: 0%">0</span>
        <span class="tick-abs orange" style="left: 25%">0.4</span>
        <span class="tick-abs orange" style="left: 50%">1.0</span>
        <span class="tick-abs green" style="left: 75%">1–2</span>
        <span class="tick-abs red" style="left: 100%">&gt;2</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs" style="left: 0%">正常</span>
        <span class="label-abs orange" style="left: 25%">高氯性</span>
        <span class="label-abs orange" style="left: 50%">混合型</span>
        <span class="label-abs green" style="left: 75%">純AG</span>
        <span class="label-abs red" style="left: 100%">混合鹼</span>
      </div>
    </div>

    <!-- ── Input Group ────────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar ddc-bar">
        <span class="group-icon">🧬</span>
        <span class="group-label-text">電解質輸入</span>
        <span class="group-sub-text">Plasma Electrolytes — mEq/L</span>
        <span class="group-score-tally ddc-tally">
          {{ dd !== null ? "Δ/Δ = " + dd : "—" }}
        </span>
      </div>

      <div class="group-items">
        <!-- Na -->
        <div
          class="nihss-item"
          :class="{ scored: Na !== null, 'ddc-scored': Na !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ddc-qnum">Na⁺</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">血清鈉 Plasma Na⁺</span>
              <span class="item-sub">正常範圍 135–145 mEq/L</span>
            </div>
            <span class="item-score" :class="{ zero: Na === null }">
              {{ Na !== null ? Na + " mEq/L" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="naVal"
              type="number"
              min="100"
              max="180"
              step="0.5"
              placeholder="mEq/L"
              class="ddc-input"
            />
            <span class="input-unit">mEq/L</span>
          </div>
        </div>

        <!-- Cl -->
        <div
          class="nihss-item"
          :class="{ scored: Cl !== null, 'ddc-scored': Cl !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ddc-qnum">Cl⁻</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">血清氯 Plasma Cl⁻</span>
              <span class="item-sub">正常範圍 98–106 mEq/L</span>
            </div>
            <span class="item-score" :class="{ zero: Cl === null }">
              {{ Cl !== null ? Cl + " mEq/L" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="clVal"
              type="number"
              min="70"
              max="140"
              step="0.5"
              placeholder="mEq/L"
              class="ddc-input"
            />
            <span class="input-unit">mEq/L</span>
          </div>
        </div>

        <!-- HCO3 -->
        <div
          class="nihss-item"
          :class="{ scored: HCO3 !== null, 'ddc-scored': HCO3 !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ddc-qnum">HCO₃</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">血清碳酸氫根 HCO₃⁻</span>
              <span class="item-sub">正常範圍 22–26 mEq/L，由血氣報告取得</span>
            </div>
            <span class="item-score" :class="{ zero: HCO3 === null }">
              {{ HCO3 !== null ? HCO3 + " mEq/L" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="hco3Val"
              type="number"
              min="1"
              max="45"
              step="0.5"
              placeholder="mEq/L"
              class="ddc-input"
            />
            <span class="input-unit">mEq/L</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Calculation breakdown ──────────────────────────────── -->
    <div class="dd-breakdown" v-if="isComplete">
      <div class="ddb-row">
        <span class="ddb-label">陰離子間隙 AG</span>
        <span class="ddb-formula"
          >Na({{ Na }}) − [Cl({{ Cl }}) + HCO₃({{ HCO3 }})]</span
        >
        <span class="ddb-result" :class="agSeverity.color + '-t'"
          >= {{ ag }}</span
        >
      </div>
      <div class="ddb-row">
        <span class="ddb-label">ΔAG（AG − 12）</span>
        <span class="ddb-formula">{{ ag }} − 12</span>
        <span class="ddb-result">= {{ deltaAg }}</span>
      </div>
      <div class="ddb-row">
        <span class="ddb-label">ΔHCO₃（24 − HCO₃）</span>
        <span class="ddb-formula">24 − {{ HCO3 }}</span>
        <span class="ddb-result">= {{ deltaHco3 }}</span>
      </div>
      <div class="ddb-row ddb-total">
        <span class="ddb-label">Δ/Δ = ΔAG ÷ ΔHCO₃</span>
        <span class="ddb-formula">{{ deltaAg }} ÷ {{ deltaHco3 }}</span>
        <span class="ddb-result brand-t">= {{ dd ?? "—" }}</span>
      </div>
    </div>

    <!-- ── Formula box ────────────────────────────────────────── -->
    <div class="formula-box">
      <span class="formula-label">公式</span>
      <span class="formula-text"
        >AG = Na − (Cl + HCO₃) ｜ Δ/Δ = (AG − 12) / (24 − HCO₃)</span
      >
    </div>

    <!-- ── Reference table ───────────────────────────────────── -->
    <div class="ref-table">
      <div class="rt-row rt-header">
        <span>Δ/Δ 值</span><span>解讀</span><span>臨床考慮</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': dd !== null && dd < 0.4 }">
        <span class="rt-s moderate-t">&lt; 0.4</span>
        <span>高氯性（非AG）代謝性酸中毒</span>
        <span class="rt-sm">腹瀉、RTA</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': dd !== null && dd >= 0.4 && dd < 1 }"
      >
        <span class="rt-s moderate-t">0.4–1</span>
        <span>混合型：AG + 非AG酸中毒</span>
        <span class="rt-sm">DKA + 腹瀉</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': dd !== null && dd >= 1 && dd <= 2 }"
      >
        <span class="rt-s mild-t">1–2</span>
        <span>純AG代謝性酸中毒</span>
        <span class="rt-sm">乳酸、DKA</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': dd !== null && dd > 2 }">
        <span class="rt-s critical-t">&gt; 2</span>
        <span>AG酸中毒 + 代謝性鹼中毒</span>
        <span class="rt-sm">DKA + 嘔吐</span>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="nihss-result" :class="ddInterp.color" v-if="isComplete">
      <div class="result-left">
        <span class="result-number">{{ dd ?? "—" }}</span>
        <span class="result-max">Δ/Δ</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ ddInterp.label }}</span>
        <span class="result-advice">{{ ddInterp.detail }}</span>
        <span class="result-sub" v-if="ddInterp.guide">{{
          ddInterp.guide
        }}</span>
      </div>
    </div>

    <!-- ── MUDPILES table (show when AG elevated) ─────────────── -->
    <div class="mudpiles-table" v-if="ag !== null && ag > 12">
      <div class="mud-header">高 AG 酸中毒常見病因（MUDPILES）</div>
      <div class="mud-grid">
        <div class="mud-item">
          <span class="mud-letter">M</span><span>Methanol（甲醇）</span>
        </div>
        <div class="mud-item">
          <span class="mud-letter">U</span><span>Uremia（尿毒症）</span>
        </div>
        <div class="mud-item">
          <span class="mud-letter">D</span><span>DKA（糖尿病酮酸中毒）</span>
        </div>
        <div class="mud-item">
          <span class="mud-letter">P</span><span>Propylene glycol</span>
        </div>
        <div class="mud-item">
          <span class="mud-letter">I</span><span>Isoniazid / Iron</span>
        </div>
        <div class="mud-item">
          <span class="mud-letter">L</span
          ><span>Lactic acidosis（乳酸中毒）</span>
        </div>
        <div class="mud-item">
          <span class="mud-letter">E</span
          ><span>Ethylene glycol（乙二醇）</span>
        </div>
        <div class="mud-item">
          <span class="mud-letter">S</span><span>Salicylates（水楊酸）</span>
        </div>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>

      <div class="detail-row">
        <span class="detail-qnum">Na⁺</span>
        <span class="detail-domain">血清鈉（Plasma Na⁺）</span>
        <span class="detail-score">{{ Na !== null ? Na : "—" }}</span>
        <span class="detail-desc">mEq/L</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Cl⁻</span>
        <span class="detail-domain">血清氯（Plasma Cl⁻）</span>
        <span class="detail-score">{{ Cl !== null ? Cl : "—" }}</span>
        <span class="detail-desc">mEq/L</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">HCO₃</span>
        <span class="detail-domain">血清碳酸氫根（HCO₃⁻）</span>
        <span class="detail-score">{{ HCO3 !== null ? HCO3 : "—" }}</span>
        <span class="detail-desc">mEq/L</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">AG</span>
        <span class="detail-domain">陰離子間隙（Anion Gap）</span>
        <span class="detail-score">{{ ag !== null ? ag : "—" }}</span>
        <span class="detail-desc">mEq/L</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">ΔAG</span>
        <span class="detail-domain">Delta AG（AG − 12）</span>
        <span class="detail-score">{{ deltaAg !== null ? deltaAg : "—" }}</span>
        <span class="detail-desc">mEq/L</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">ΔHCO₃</span>
        <span class="detail-domain">Delta HCO₃（24 − HCO₃）</span>
        <span class="detail-score">{{
          deltaHco3 !== null ? deltaHco3 : "—"
        }}</span>
        <span class="detail-desc">mEq/L</span>
      </div>

      <div class="detail-row detail-total">
        <span class="detail-qnum">Δ/Δ</span>
        <span class="detail-domain">Delta/Delta 比值（最終結果）</span>
        <span class="detail-score detail-score-brand">{{
          dd !== null ? dd : "—"
        }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">ratio</span>
          <span class="detail-desc-label">{{ ddInterp.label }}</span>
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
.ddc {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.ddc-header {
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

/* Two badges side by side */
.score-badges {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 76px;
  padding: 0.5rem 0.85rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.badge-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  margin-bottom: 1px;
}

.score-number {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
}

.score-unit {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 1px;
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
  border-left: 3px solid #10b981;
  margin-bottom: 0.6rem;
}

.ddc-bar {
  border-left: 3px solid #8b5cf6;
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
.ddc-tally {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
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
.nihss-item.ddc-scored {
  border-color: #8b5cf6;
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
.ddc-qnum {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
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
  color: #8b5cf6;
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

.ddc-input {
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
.ddc-input::-webkit-outer-spin-button,
.ddc-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.ddc-input:focus {
  border-color: #8b5cf6;
}
.ddc-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}

.input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

/* ── Calculation breakdown ─────────────────────────────────────── */
.dd-breakdown {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.ddb-row {
  display: grid;
  grid-template-columns: 1.4fr 1.2fr 80px;
  gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.ddb-row:last-child {
  border-bottom: none;
}
.ddb-total {
  background: var(--vp-c-bg-mute);
  font-weight: 700;
}
.ddb-label {
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.ddb-formula {
  font-family: monospace;
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
}
.ddb-result {
  font-weight: 800;
  text-align: right;
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
.brand-t {
  color: var(--vp-c-brand-1);
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
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  flex-shrink: 0;
}
.formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
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
  grid-template-columns: 80px 1fr 90px;
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
  flex: 1;
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
  font-style: italic;
}

/* ── MUDPILES table ────────────────────────────────────────────── */
.mudpiles-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.mud-header {
  padding: 0.4rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.mud-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.mud-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}
.mud-item:nth-last-child(-n + 2) {
  border-bottom: none;
}
.mud-letter {
  font-size: 1rem;
  font-weight: 900;
  color: #8b5cf6;
  width: 18px;
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
  font-size: 0.7rem;
  font-weight: 800;
  color: #8b5cf6;
  flex-shrink: 0;
  width: 44px; /* slightly wider for HCO₃/ΔHCO₃ labels */
  padding-top: 1px;
}
.detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}

/* score: right-aligned fixed width */
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

/* desc: left-aligned, same width as detail-desc-block */
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
}

/* Last Δ/Δ row: unit on first line, interpretation label on second line */
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
  .ddc-header {
    flex-direction: column;
  }
  .score-badges {
    flex-direction: row;
  }
  .score-number {
    font-size: 1.4rem;
  }
  .nihss-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .rt-row {
    grid-template-columns: 70px 1fr;
  }
  .rt-row span:last-child {
    display: none;
  }
  .mud-grid {
    grid-template-columns: 1fr;
  }
  .mud-item:last-child {
    border-bottom: none;
  }
  .ddb-row {
    grid-template-columns: 1fr 70px;
  }
  .ddb-formula {
    display: none;
  }
}
</style>
