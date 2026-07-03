<script setup lang="ts">
import { ref, computed } from "vue";

// Fractional Excretion of X (FEX):
// FE(X) = (Urine X × Serum Cr) / (Serum X × Urine Cr) × 100
// FENa < 1%  = prerenal  |  FENa > 2% = intrinsic renal
// FEUrea < 35% = prerenal (useful when diuretics given)

const substLabel = ref("Na");
const uxVal = ref(""); // Urine X
const pxVal = ref(""); // Plasma/Serum X
const seCrVal = ref(""); // Serum Creatinine
const uCrVal = ref(""); // Urine Creatinine
const copied = ref(false);
const showResults = ref(false);

const UX = computed(() => {
  const v = parseFloat(uxVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const PX = computed(() => {
  const v = parseFloat(pxVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const SCr = computed(() => {
  const v = parseFloat(seCrVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const UCr = computed(() => {
  const v = parseFloat(uCrVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const isComplete = computed(
  () =>
    UX.value !== null &&
    PX.value !== null &&
    SCr.value !== null &&
    UCr.value !== null,
);

const fe = computed(() => {
  if (!isComplete.value) return null;
  return (
    Math.round(
      ((UX.value! * SCr.value!) / (PX.value! * UCr.value!)) * 100 * 100,
    ) / 100
  );
});

// bar fill based on FENa thresholds (cap at 10%)
const barPct = computed(() => {
  if (fe.value === null || fe.value < 0) return 0;
  return Math.min((fe.value / 10) * 100, 100);
});

const severity = computed(() => {
  const v = fe.value;
  const s = substLabel.value;
  if (v === null)
    return {
      label: "尚未計算",
      color: "pending",
      advice: "請輸入所有四個數值以計算分餾排泄率",
    };

  if (s === "Na") {
    if (v < 1)
      return {
        label: "腎前性 AKI（Pre-renal）",
        color: "normal",
        advice:
          "FENa < 1%：腎小管對鈉的重吸收完好，提示腎前性急性腎損傷（低血容量、心衰竭、肝硬化）",
      };
    if (v <= 2)
      return {
        label: "診斷不確定（Borderline）",
        color: "mild",
        advice:
          "FENa 1–2%：診斷意義不明確，建議結合臨床尿液分析及腎功能趨勢綜合判斷",
      };
    return {
      label: "腎性 AKI（Intrinsic Renal）",
      color: "critical",
      advice:
        "FENa > 2%：腎小管損傷，提示固有性腎性急性腎損傷（急性腎小管壞死、腎炎）",
    };
  }
  if (s === "Urea") {
    if (v < 35)
      return {
        label: "腎前性 AKI（Pre-renal）",
        color: "normal",
        advice: "FEUrea < 35%：適用於已使用利尿劑的患者，提示腎前性腎損傷",
      };
    return {
      label: "腎性 AKI（Intrinsic Renal）",
      color: "critical",
      advice: "FEUrea ≥ 35%：提示固有性腎小管損傷",
    };
  }
  if (s === "K") {
    if (v < 10)
      return {
        label: "腎外性失鉀",
        color: "normal",
        advice: "FEK < 10%：腎臟保鉀正常，低鉀血症來源為腎外（腹瀉、嘔吐）",
      };
    return {
      label: "腎性失鉀",
      color: "critical",
      advice: "FEK ≥ 10%：腎小管失鉀（利尿劑、原發性高醛固酮症、RTA）",
    };
  }
  if (s === "Mg") {
    if (v < 2)
      return {
        label: "腎外性低鎂",
        color: "normal",
        advice: "FEMg < 2%：腎臟對鎂的保留正常，低鎂來源為腸道吸收不良",
      };
    return {
      label: "腎性低鎂",
      color: "critical",
      advice: "FEMg ≥ 2%：腎小管對鎂重吸收障礙（利尿劑、氨基糖苷類、順鉑）",
    };
  }
  // Generic
  return { label: `FE${s} = ${v}%`, color: "mild", advice: "" };
});

function generateOutput() {
  return (
    `# 分餾排泄率 FE${substLabel.value}\n\n` +
    `## 輸入數值\n\n` +
    `- **尿液 ${substLabel.value}（U${substLabel.value}）**：${UX.value ?? "—"} mEq/L\n` +
    `- **血清 ${substLabel.value}（P${substLabel.value}）**：${PX.value ?? "—"} mEq/L\n` +
    `- **血清肌酸酐（Se-Cr）**：${SCr.value ?? "—"} mg/dL\n` +
    `- **尿液肌酸酐（U-Cr）**：${UCr.value ?? "—"} mg/dL\n\n` +
    `## 結果\n\n` +
    `- **FE${substLabel.value} = ${fe.value ?? "—"}%**\n` +
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
  uxVal.value = "";
  pxVal.value = "";
  seCrVal.value = "";
  uCrVal.value = "";
  showResults.value = false;
}

// Per-substance color themes
const substThemes: Record<string, { hex: string; rgb: string; name: string }> =
  {
    Na: { hex: "#0ea5e9", rgb: "14,165,233", name: "sky" }, // sky blue
    Urea: { hex: "#8b5cf6", rgb: "139,92,246", name: "purple" }, // purple
    K: { hex: "#10b981", rgb: "16,185,129", name: "emerald" }, // emerald
    Mg: { hex: "#f59e0b", rgb: "245,158,11", name: "amber" }, // amber
    Cl: { hex: "#ec4899", rgb: "236,72,153", name: "pink" }, // pink
  };

const theme = computed(
  () => substThemes[substLabel.value] ?? substThemes["Na"],
);

function selectSubst(s: string) {
  substLabel.value = s;
  reset();
}
</script>

<template>
  <div class="fec" :style="{ '--t': theme.hex, '--t-rgb': theme.rgb }">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="fec-header">
      <div class="header-title">
        <h2 class="title">分餾排泄率</h2>
        <p class="subtitle">
          Fractional Excretion · 急性腎損傷鑑別診斷 · FE(X) = (U-X × Se-Cr) /
          (P-X × U-Cr) × 100
        </p>
      </div>
      <div
        class="score-badge"
        :class="severity.color"
        :style="{ '--t': theme.hex, '--t-rgb': theme.rgb }"
      >
        <span class="badge-label">FE{{ substLabel }}</span>
        <span class="score-number">{{ fe !== null ? fe : "—" }}</span>
        <span class="score-unit" v-if="fe !== null">%</span>
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
        <span class="tick-abs green" style="left: 25%">&lt;1%</span>
        <span class="tick-abs yellow" style="left: 50%">1–2%</span>
        <span class="tick-abs red" style="left: 75%">&gt;2%</span>
        <span class="tick-abs" style="left: 100%">10</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs" style="left: 0%"></span>
        <span class="label-abs green" style="left: 25%">腎前性</span>
        <span class="label-abs yellow" style="left: 50%">邊界</span>
        <span class="label-abs red" style="left: 75%">腎性</span>
        <span class="label-abs" style="left: 100%"></span>
      </div>
    </div>

    <!-- ── Substance selector ─────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar fec-subst-bar">
        <span class="group-icon">🔬</span>
        <span class="group-label-text">評估物質</span>
        <span class="group-sub-text">選擇要計算分餾排泄率的電解質</span>
      </div>
      <div class="subst-toggle">
        <button
          v-for="s in ['Na', 'Urea', 'K', 'Mg', 'Cl']"
          :key="s"
          :class="{ active: substLabel === s }"
          @click="selectSubst(s)"
        >
          {{ s }}
        </button>
      </div>
    </div>

    <!-- ── Input Group ────────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar fec-bar">
        <span class="group-icon">🩸</span>
        <span class="group-label-text">數值輸入</span>
        <span class="group-sub-text"
          >Urine &amp; Plasma — mEq/L · Creatinine — mg/dL</span
        >
        <span class="group-score-tally fec-tally">
          {{ fe !== null ? "FE" + substLabel + " = " + fe + "%" : "—" }}
        </span>
      </div>

      <div class="group-items">
        <!-- Urine X -->
        <div
          class="nihss-item"
          :class="{ scored: UX !== null, 'fec-scored': UX !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum fec-qnum">U-{{ substLabel }}</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >尿液 {{ substLabel }}（U-{{ substLabel }}）</span
              >
              <span class="item-sub">隨機尿液或24小時尿液樣本中取得</span>
            </div>
            <span class="item-score" :class="{ zero: UX === null }">
              {{ UX !== null ? UX + " mEq/L" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="uxVal"
              type="number"
              min="0"
              step="0.1"
              :placeholder="`U-${substLabel} (mEq/L)`"
              class="fec-input"
            />
            <span class="input-unit">mEq/L</span>
          </div>
        </div>

        <!-- Plasma X -->
        <div
          class="nihss-item"
          :class="{ scored: PX !== null, 'fec-scored': PX !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum fec-qnum">P-{{ substLabel }}</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >血清 {{ substLabel }}（P-{{ substLabel }}）</span
              >
              <span class="item-sub">由血液常規生化檢驗報告取得</span>
            </div>
            <span class="item-score" :class="{ zero: PX === null }">
              {{ PX !== null ? PX + " mEq/L" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="pxVal"
              type="number"
              min="0"
              step="0.1"
              :placeholder="`P-${substLabel} (mEq/L)`"
              class="fec-input"
            />
            <span class="input-unit">mEq/L</span>
          </div>
        </div>

        <!-- Serum Creatinine -->
        <div
          class="nihss-item"
          :class="{ scored: SCr !== null, 'fec-scored': SCr !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum fec-qnum">Se-Cr</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">血清肌酸酐 Serum Creatinine</span>
              <span class="item-sub"
                >正常值 0.6–1.2 mg/dL（男）；0.5–1.0 mg/dL（女）</span
              >
            </div>
            <span class="item-score" :class="{ zero: SCr === null }">
              {{ SCr !== null ? SCr + " mg/dL" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="seCrVal"
              type="number"
              min="0.1"
              step="0.1"
              placeholder="mg/dL"
              class="fec-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>

        <!-- Urine Creatinine -->
        <div
          class="nihss-item"
          :class="{ scored: UCr !== null, 'fec-scored': UCr !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum fec-qnum">U-Cr</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">尿液肌酸酐 Urine Creatinine</span>
              <span class="item-sub"
                >隨機尿液中肌酸酐濃度，通常遠高於血清值</span
              >
            </div>
            <span class="item-score" :class="{ zero: UCr === null }">
              {{ UCr !== null ? UCr + " mg/dL" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="uCrVal"
              type="number"
              min="0.1"
              step="0.1"
              placeholder="mg/dL"
              class="fec-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Formula display ────────────────────────────────────── -->
    <div class="formula-box" v-if="isComplete && fe !== null">
      <span class="formula-label">計算過程：</span>
      <span class="formula-text">
        FE{{ substLabel }} = ({{ UX }} × {{ SCr }}) / ({{ PX }} × {{ UCr }}) ×
        100 = {{ (UX! * SCr!).toFixed(2) }} / {{ (PX! * UCr!).toFixed(2) }} ×
        100 = <strong>{{ fe }}%</strong>
      </span>
    </div>

    <!-- ── Reference table ───────────────────────────────────── -->
    <div class="ref-table">
      <!-- FENa -->
      <template v-if="substLabel === 'Na'">
        <div class="rt-row rt-header">
          <span>FENa</span><span>意義</span><span>常見病因</span>
        </div>
        <div class="rt-row" :class="{ 'rt-active': fe !== null && fe < 1 }">
          <span class="rt-s normal-t">&lt; 1%</span>
          <span>腎前性 AKI</span>
          <span class="rt-sm">低血容量、心衰竭、肝硬化</span>
        </div>
        <div
          class="rt-row"
          :class="{ 'rt-active': fe !== null && fe >= 1 && fe <= 2 }"
        >
          <span class="rt-s mild-t">1–2%</span>
          <span>不確定（Borderline）</span>
          <span class="rt-sm">需結合臨床判斷</span>
        </div>
        <div class="rt-row" :class="{ 'rt-active': fe !== null && fe > 2 }">
          <span class="rt-s critical-t">&gt; 2%</span>
          <span>腎性 AKI</span>
          <span class="rt-sm">急性腎小管壞死、腎炎</span>
        </div>
      </template>
      <!-- FEUrea -->
      <template v-else-if="substLabel === 'Urea'">
        <div class="rt-row rt-header">
          <span>FEUrea</span><span>意義</span><span>備注</span>
        </div>
        <div class="rt-row" :class="{ 'rt-active': fe !== null && fe < 35 }">
          <span class="rt-s normal-t">&lt; 35%</span>
          <span>腎前性 AKI</span>
          <span class="rt-sm">適用於使用利尿劑的患者</span>
        </div>
        <div class="rt-row" :class="{ 'rt-active': fe !== null && fe >= 35 }">
          <span class="rt-s critical-t">≥ 35%</span>
          <span>腎性 AKI</span>
          <span class="rt-sm">腎小管損傷</span>
        </div>
      </template>
      <!-- FEK -->
      <template v-else-if="substLabel === 'K'">
        <div class="rt-row rt-header">
          <span>FEK</span><span>意義</span><span>考慮</span>
        </div>
        <div class="rt-row" :class="{ 'rt-active': fe !== null && fe < 10 }">
          <span class="rt-s normal-t">&lt; 10%</span>
          <span>腎外性失鉀</span>
          <span class="rt-sm">腹瀉、嘔吐</span>
        </div>
        <div class="rt-row" :class="{ 'rt-active': fe !== null && fe >= 10 }">
          <span class="rt-s critical-t">≥ 10%</span>
          <span>腎性失鉀</span>
          <span class="rt-sm">利尿劑、醛固酮增多症</span>
        </div>
      </template>
      <!-- FEMg -->
      <template v-else-if="substLabel === 'Mg'">
        <div class="rt-row rt-header">
          <span>FEMg</span><span>意義</span><span>考慮</span>
        </div>
        <div class="rt-row" :class="{ 'rt-active': fe !== null && fe < 2 }">
          <span class="rt-s normal-t">&lt; 2%</span>
          <span>腎外性低鎂</span>
          <span class="rt-sm">腸道吸收不良</span>
        </div>
        <div class="rt-row" :class="{ 'rt-active': fe !== null && fe >= 2 }">
          <span class="rt-s critical-t">≥ 2%</span>
          <span>腎性低鎂</span>
          <span class="rt-sm">利尿劑、氨基糖苷類</span>
        </div>
      </template>
      <!-- Generic -->
      <template v-else>
        <div class="rt-row rt-header">
          <span>FE{{ substLabel }}</span
          ><span>結果</span><span></span>
        </div>
        <div class="rt-row">
          <span class="rt-s mild-t">{{ fe !== null ? fe + "%" : "—" }}</span>
          <span>需結合臨床判斷</span>
          <span class="rt-sm"></span>
        </div>
      </template>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="nihss-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ fe !== null ? fe : "—" }}</span>
        <span class="result-max" v-if="fe !== null">%</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.label }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
      </div>
    </div>

    <!-- ── Clinical note box ──────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >FENa 在使用利尿劑後可能偽高；此時建議改用 FEUrea（&lt; 35%
        提示腎前性）。急性腎小管壞死早期 FENa 也可能 &lt;
        1%，需結合臨床整體評估。</span
      >
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>

      <div class="detail-row">
        <span class="detail-qnum">U-X</span>
        <span class="detail-domain"
          >尿液 {{ substLabel }}（U-{{ substLabel }}）</span
        >
        <span class="detail-score">{{ UX !== null ? UX : "—" }}</span>
        <span class="detail-desc">mEq/L</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">P-X</span>
        <span class="detail-domain"
          >血清 {{ substLabel }}（P-{{ substLabel }}）</span
        >
        <span class="detail-score">{{ PX !== null ? PX : "—" }}</span>
        <span class="detail-desc">mEq/L</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Se-Cr</span>
        <span class="detail-domain">血清肌酸酐（Serum Creatinine）</span>
        <span class="detail-score">{{ SCr !== null ? SCr : "—" }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">U-Cr</span>
        <span class="detail-domain">尿液肌酸酐（Urine Creatinine）</span>
        <span class="detail-score">{{ UCr !== null ? UCr : "—" }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row detail-total">
        <span class="detail-qnum">FE%</span>
        <span class="detail-domain">FE{{ substLabel }}（最終結果）</span>
        <span class="detail-score detail-score-brand">{{
          fe !== null ? fe : "—"
        }}</span>
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
.fec {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
  --t: #0ea5e9;
  --t-rgb: 14, 165, 233;
}

/* ── Header ────────────────────────────────────────────────────── */
.fec-header {
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

.badge-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  margin-bottom: 1px;
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
.tick-abs.red,
.label-abs.red {
  color: #ef4444;
}

/* ── Groups ────────────────────────────────────────────────────── */
.nihss-group {
  margin-bottom: 1.25rem;
}

.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #38bdf8;
  margin-bottom: 0.6rem;
}

.fec-subst-bar {
  border-left: 3px solid var(--t);
}
.fec-bar {
  border-left: 3px solid var(--t);
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
.fec-tally {
  color: var(--t);
  background: rgba(var(--t-rgb), 0.12);
}

/* ── Substance toggle ──────────────────────────────────────────── */
.subst-toggle {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  padding: 0 0.1rem;
  margin-bottom: 0.5rem;
}
.subst-toggle button {
  padding: 6px 18px;
  border-radius: 8px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-2);
  transition: all 0.15s;
}
.subst-toggle button.active {
  border-color: var(--t);
  color: var(--t);
  background: rgba(var(--t-rgb), 0.08);
}
.subst-toggle button:hover:not(.active) {
  border-color: var(--vp-c-text-3);
  color: var(--vp-c-text-1);
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
.nihss-item.fec-scored {
  border-color: var(--t);
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
  font-size: 0.68rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.fec-qnum {
  color: var(--t);
  background: rgba(var(--t-rgb), 0.12);
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
  color: var(--t);
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

.fec-input {
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
.fec-input::-webkit-outer-spin-button,
.fec-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.fec-input:focus {
  border-color: var(--t);
}
.fec-input::placeholder {
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
  grid-template-columns: 80px 1fr 130px;
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
  color: var(--t);
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

/* Last FE% row: unit line 1, severity label line 2 */
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
  .fec-header {
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
    grid-template-columns: 70px 1fr;
  }
  .rt-row span:last-child {
    display: none;
  }
}
</style>
