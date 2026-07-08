<script setup lang="ts">
import { ref, computed, watch } from "vue";

const activeTab = ref<"ktv" | "urr" | "arc">("ktv");

// ══════════════ Kt/V 透析充分度（Daugirdas II）══════════════

// Kt/V Daugirdas II formula:
// R = PostBUN / PreBUN
// t = dialysis time in HOURS
// Kt/V = -ln(R - 0.008 × t) + (4 - 3.5 × R) × UF / W
// UF = ultrafiltrate removed (L)
// W  = post-dialysis weight (kg)
// Target: Kt/V ≥ 1.2 (KDOQI minimum)

const ktv_preBunVal = ref("");
const ktv_postBunVal = ref("");
const postWtVal = ref("");
const ufVal = ref("");
const dialTimeVal = ref(""); // minutes
const ktv_copied = ref(false);
const ktv_showResults = ref(false);

const ktv_Pre = computed(() => {
  const v = parseFloat(ktv_preBunVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const ktv_Post = computed(() => {
  const v = parseFloat(ktv_postBunVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const W = computed(() => {
  const v = parseFloat(postWtVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const UF = computed(() => {
  const v = parseFloat(ufVal.value);
  return isNaN(v) || v < 0 ? null : v;
});
const Tmin = computed(() => {
  const v = parseFloat(dialTimeVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const ktv_isComplete = computed(
  () =>
    ktv_Pre.value !== null &&
    ktv_Post.value !== null &&
    W.value !== null &&
    UF.value !== null &&
    Tmin.value !== null,
);

const R = computed(() =>
  ktv_Pre.value !== null && ktv_Post.value !== null ? ktv_Post.value / ktv_Pre.value : null,
);

const Thr = computed(() => (Tmin.value !== null ? Tmin.value / 60 : null));

const ktv = computed(() => {
  if (!ktv_isComplete.value || R.value === null || Thr.value === null) return null;
  const inner = R.value - 0.008 * Thr.value;
  if (inner <= 0) return null;
  const val = -Math.log(inner) + ((4 - 3.5 * R.value) * UF.value!) / W.value!;
  return Math.round(val * 100) / 100;
});

const ktv_urr = computed(() => {
  if (ktv_Pre.value === null || ktv_Post.value === null || ktv_Post.value >= ktv_Pre.value)
    return null;
  return Math.round(((ktv_Pre.value - ktv_Post.value) / ktv_Pre.value) * 100 * 10) / 10;
});

// bar fill: Kt/V 0–2 mapped to 0–100%
const ktv_barPct = computed(() => {
  if (ktv.value === null) return 0;
  return Math.min((ktv.value / 2) * 100, 100);
});

const ktv_adequacy = computed(() => {
  const k = ktv.value;
  if (k === null)
    return {
      label: "尚未計算",
      color: "pending",
      advice: "請輸入所有五個數值以計算 Kt/V 透析充分度",
    };
  if (k >= 1.4)
    return {
      label: "充分透析（優良）",
      color: "normal",
      advice: "Kt/V ≥ 1.4：超過 KDOQI 最低標準，透析充足",
    };
  if (k >= 1.2)
    return {
      label: "充分透析（達標）",
      color: "mild",
      advice: "Kt/V ≥ 1.2：達到 KDOQI 最低目標",
    };
  if (k >= 1.0)
    return {
      label: "邊緣不足",
      color: "moderate",
      advice: "Kt/V 1.0–1.2：接近但未達目標，需優化透析處方",
    };
  return {
    label: "透析不足",
    color: "critical",
    advice: "Kt/V < 1.0：嚴重不足，發病率和死亡率顯著增加",
  };
});

function ktv_generateOutput() {
  return (
    `# Kt/V 透析充分度（Daugirdas II）\n\n` +
    `## 輸入數值\n\n` +
    `- **透析前 BUN（Pre-BUN）**：${ktv_Pre.value ?? "—"} mg/dL\n` +
    `- **透析後 BUN（Post-BUN）**：${ktv_Post.value ?? "—"} mg/dL\n` +
    `- **透析後體重（Post-Wt）**：${W.value ?? "—"} kg\n` +
    `- **超濾量（UF）**：${UF.value ?? "—"} L\n` +
    `- **透析時間**：${Tmin.value ?? "—"} 分鐘（${Thr.value?.toFixed(2) ?? "—"} 小時）\n\n` +
    `## 結果\n\n` +
    `- **R = ${R.value?.toFixed(4) ?? "—"}**\n` +
    `- **Kt/V = ${ktv.value ?? "—"}**\n` +
    `- **URR = ${ktv_urr.value ?? "—"}%**\n` +
    `- 評估：${ktv_adequacy.value.label}\n` +
    `- ${ktv_adequacy.value.advice}`
  );
}

async function ktv_copyOutput() {
  await navigator.clipboard.writeText(ktv_generateOutput());
  ktv_copied.value = true;
  setTimeout(() => (ktv_copied.value = false), 2000);
}

function ktv_reset() {
  ktv_preBunVal.value = "";
  ktv_postBunVal.value = "";
  postWtVal.value = "";
  ufVal.value = "";
  dialTimeVal.value = "";
  ktv_showResults.value = false;
}

// ══════════════ 尿素減少率（Urea Reduction Ratio）══════════════

// URR (%) = (PreBUN - PostBUN) / PreBUN × 100
// Target: URR ≥ 65% (KDOQI minimum)
// URR ≥ 70% = Excellent

const urr_preBunVal = ref("");
const urr_postBunVal = ref("");
const urr_copied = ref(false);
const urr_showResults = ref(false);

const urr_Pre = computed(() => {
  const v = parseFloat(urr_preBunVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const urr_Post = computed(() => {
  const v = parseFloat(urr_postBunVal.value);
  return isNaN(v) || v < 0 ? null : v;
});

const urr_isComplete = computed(() => urr_Pre.value !== null && urr_Post.value !== null);

const urr_urr = computed(() => {
  if (!urr_isComplete.value || urr_Post.value! >= urr_Pre.value!) return null;
  return Math.round(((urr_Pre.value! - urr_Post.value!) / urr_Pre.value!) * 100 * 10) / 10;
});

// bar fill: URR 0–100%
const urr_barPct = computed(() => {
  if (urr_urr.value === null) return 0;
  return Math.min(urr_urr.value, 100);
});

const urr_adequacy = computed(() => {
  const u = urr_urr.value;
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

function urr_generateOutput() {
  return (
    `# 尿素減少率（URR）計算\n\n` +
    `## 輸入數值\n\n` +
    `- **透析前 BUN（Pre-BUN）**：${urr_Pre.value ?? "—"} mg/dL\n` +
    `- **透析後 BUN（Post-BUN）**：${urr_Post.value ?? "—"} mg/dL\n\n` +
    `## 結果\n\n` +
    `- **URR = ${urr_urr.value ?? "—"}%**\n` +
    `- 評估：${urr_adequacy.value.label}\n` +
    `- ${urr_adequacy.value.advice}`
  );
}

async function urr_copyOutput() {
  await navigator.clipboard.writeText(urr_generateOutput());
  urr_copied.value = true;
  setTimeout(() => (urr_copied.value = false), 2000);
}

function urr_reset() {
  urr_preBunVal.value = "";
  urr_postBunVal.value = "";
  urr_showResults.value = false;
}

// ══════════════ 通路再循環率（Access Recirculation）══════════════

// Access Recirculation
// R% = (Systemic BUN − Inlet BUN) / (Systemic BUN − Outlet BUN) × 100
// Systemic BUN = peripheral BUN (non-access arm)
// Inlet BUN    = arterial line BUN
// Outlet BUN   = venous line BUN
// Normal < 5% | Significant ≥ 10%

const systemic = ref("");
const inlet = ref("");
const outlet = ref("");
const arc_copied = ref(false);
const arc_showResults = ref(false);

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

const arc_isComplete = computed(
  () => S.value !== null && I.value !== null && O.value !== null,
);

const recirculation = computed(() => {
  if (!arc_isComplete.value) return null;
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

function arc_generateOutput() {
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

async function arc_copyOutput() {
  await navigator.clipboard.writeText(arc_generateOutput());
  arc_copied.value = true;
  setTimeout(() => (arc_copied.value = false), 2000);
}

function arc_reset() {
  systemic.value = "";
  inlet.value = "";
  outlet.value = "";
  arc_showResults.value = false;
}
</script>

<template>
  <div class="hemodialysis">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'ktv' }"
        @click="activeTab = 'ktv'"
      >
        <span class="tab-label">Kt/V 透析充分度</span>
        <span class="tab-sub">Daugirdas II</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'urr' }"
        @click="activeTab = 'urr'"
      >
        <span class="tab-label">尿素減少率</span>
        <span class="tab-sub">Urea Reduction Ratio</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'arc' }"
        @click="activeTab = 'arc'"
      >
        <span class="tab-label">通路再循環率</span>
        <span class="tab-sub">Access Recirculation</span>
      </button>
    </div>

  <div v-show="activeTab === 'ktv'" class="ktv">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="ktv-header">
      <div class="header-title">
        <h2 class="title">Kt/V 透析充分度</h2>
        <p class="subtitle">
          Daugirdas II · Hemodialysis Adequacy · KDOQI 標準評估 · 目標 Kt/V ≥
          1.2
        </p>
      </div>
      <div class="score-badge" :class="ktv_adequacy.color">
        <span class="score-number">{{ ktv !== null ? ktv : "—" }}</span>
        <span class="score-unit" v-if="ktv !== null">Kt/V</span>
        <span class="score-label">{{ ktv_adequacy.label }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="ktv_adequacy.color"
          :style="{ width: ktv_barPct + '%' }"
        />
        <!-- KDOQI target marker at 1.2 → aligns with tick -->
        <div class="bar-target-line" />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs" style="left: 0%">0</span>
        <span class="tick-abs red" style="left: 50%">1.0</span>
        <span class="tick-abs yellow" style="left: 60%">1.2 ▾</span>
        <span class="tick-abs green" style="left: 70%">1.4</span>
        <span class="tick-abs" style="left: 100%">2.0+</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs" style="left: 0%"></span>
        <span class="label-abs red" style="left: 50%">邊緣</span>
        <span class="label-abs yellow" style="left: 60%">達標</span>
        <span class="label-abs green" style="left: 70%">優良</span>
        <span class="label-abs" style="left: 100%"></span>
      </div>
    </div>

    <!-- ── Input Group ────────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar ktv-bar">
        <span class="group-icon">💉</span>
        <span class="group-label-text">數值輸入</span>
        <span class="group-sub-text"
          >BUN — mg/dL · Weight — kg · UF — L · Time — min</span
        >
        <span class="group-score-tally ktv-tally">
          {{ ktv !== null ? "Kt/V = " + ktv : "—" }}
        </span>
      </div>

      <div class="group-items">
        <!-- Pre-BUN -->
        <div
          class="nihss-item"
          :class="{ scored: ktv_Pre !== null, 'ktv-scored': ktv_Pre !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ktv-qnum">Pre</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">透析前 BUN（Pre-dialysis BUN）</span>
              <span class="item-sub"
                >透析開始前抽血，代表未清除的尿素氮基線值</span
              >
            </div>
            <span class="item-score" :class="{ zero: ktv_Pre === null }">
              {{ ktv_Pre !== null ? ktv_Pre + " mg/dL" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="ktv_preBunVal"
              type="number"
              min="1"
              max="300"
              step="0.1"
              placeholder="mg/dL"
              class="ktv-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>

        <!-- Post-BUN -->
        <div
          class="nihss-item"
          :class="{ scored: ktv_Post !== null, 'ktv-scored': ktv_Post !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ktv-qnum">Post</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">透析後 BUN（Post-dialysis BUN）</span>
              <span class="item-sub"
                >透析結束後 30 秒–1 分鐘抽血，避免再循環干擾</span
              >
            </div>
            <span class="item-score" :class="{ zero: ktv_Post === null }">
              {{ ktv_Post !== null ? ktv_Post + " mg/dL" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="ktv_postBunVal"
              type="number"
              min="1"
              max="300"
              step="0.1"
              placeholder="mg/dL"
              class="ktv-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>

        <!-- Post-Weight -->
        <div
          class="nihss-item"
          :class="{ scored: W !== null, 'ktv-scored': W !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ktv-qnum">Wt</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">透析後體重（Post-dialysis Weight）</span>
              <span class="item-sub"
                >透析結束後測量的乾體重，用於計算分佈容積</span
              >
            </div>
            <span class="item-score" :class="{ zero: W === null }">
              {{ W !== null ? W + " kg" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="postWtVal"
              type="number"
              min="20"
              max="200"
              step="0.1"
              placeholder="kg"
              class="ktv-input"
            />
            <span class="input-unit">kg</span>
          </div>
        </div>

        <!-- UF Volume -->
        <div
          class="nihss-item"
          :class="{ scored: UF !== null, 'ktv-scored': UF !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ktv-qnum">UF</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">超濾量（Ultrafiltrate Removed）</span>
              <span class="item-sub"
                >本次透析移除的液體總量，由透析機記錄取得</span
              >
            </div>
            <span class="item-score" :class="{ zero: UF === null }">
              {{ UF !== null ? UF + " L" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="ufVal"
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="L"
              class="ktv-input"
            />
            <span class="input-unit">L</span>
          </div>
        </div>

        <!-- Dial Time -->
        <div
          class="nihss-item"
          :class="{ scored: Tmin !== null, 'ktv-scored': Tmin !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ktv-qnum">Time</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">透析時間（Dialysis Duration）</span>
              <span class="item-sub"
                >實際有效透析時間，輸入分鐘，公式內自動轉換為小時</span
              >
            </div>
            <span class="item-score" :class="{ zero: Tmin === null }">
              {{ Tmin !== null ? Tmin + " min" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="dialTimeVal"
              type="number"
              min="60"
              max="480"
              step="1"
              placeholder="分鐘"
              class="ktv-input"
            />
            <span class="input-unit">分鐘</span>
          </div>
        </div>

        <!-- URR (derived, read-only) -->
        <div class="nihss-item ktv-derived-item" v-if="ktv_urr !== null">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum ktv-qnum">URR</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >尿素降低率 Urea Reduction Ratio（自動計算）</span
              >
              <span class="item-sub"
                >URR = (Pre − Post) / Pre × 100，KDOQI 目標 ≥ 65%</span
              >
            </div>
            <span class="item-score" :class="{ zero: ktv_urr === null }">
              {{ ktv_urr !== null ? ktv_urr + "%" : "—" }}
              <span class="urr-tag" :class="ktv_urr >= 65 ? 'urr-ok' : 'urr-low'">
                {{ ktv_urr >= 65 ? "達標" : "未達標" }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Formula display ────────────────────────────────────── -->
    <div class="formula-box" v-if="ktv_isComplete && ktv !== null">
      <span class="formula-label">計算過程：</span>
      <span class="formula-text">
        R = {{ ktv_Post }} / {{ ktv_Pre }} = {{ R?.toFixed(4) }} ； t = {{ Tmin }} / 60
        = {{ Thr?.toFixed(4) }} hr ； Kt/V = −ln({{ R?.toFixed(4) }} − 0.008 ×
        {{ Thr?.toFixed(4) }}) + (4 − 3.5 × {{ R?.toFixed(4) }}) × {{ UF }} /
        {{ W }} = <strong>{{ ktv }}</strong>
      </span>
    </div>

    <!-- ── Reference table ───────────────────────────────────── -->
    <div class="ref-table">
      <div class="rt-row rt-header">
        <span>Kt/V</span><span>評估</span><span>對應 URR</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': ktv !== null && ktv >= 1.4 }">
        <span class="rt-s normal-t">≥ 1.4</span>
        <span>充分透析（優良）</span>
        <span class="rt-sm">≥ 72%</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': ktv !== null && ktv >= 1.2 && ktv < 1.4 }"
      >
        <span class="rt-s mild-t">1.2–1.4</span>
        <span>充分透析（KDOQI 達標）</span>
        <span class="rt-sm">65–72%</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': ktv !== null && ktv >= 1.0 && ktv < 1.2 }"
      >
        <span class="rt-s moderate-t">1.0–1.2</span>
        <span>邊緣不足</span>
        <span class="rt-sm">58–65%</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': ktv !== null && ktv < 1.0 }">
        <span class="rt-s critical-t">&lt; 1.0</span>
        <span>嚴重透析不足</span>
        <span class="rt-sm">&lt; 58%</span>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="nihss-result" :class="ktv_adequacy.color">
      <div class="result-left">
        <span class="result-number">{{ ktv !== null ? ktv : "—" }}</span>
        <span class="result-max" v-if="ktv !== null">Kt/V</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ ktv_adequacy.label }}</span>
        <span class="result-advice">{{ ktv_adequacy.advice }}</span>
        <span class="result-sub" v-if="ktv_urr !== null">
          URR = <strong>{{ ktv_urr }}%</strong>（{{
            ktv_urr >= 65 ? "✓ 達標" : "✗ 未達標，目標 ≥ 65%"
          }}）
        </span>
      </div>
    </div>

    <!-- ── Clinical note ──────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >Daugirdas II 公式適用於每週三次血液透析患者。透析後 BUN 應在血流停止 30
        秒後採樣以避免再循環干擾。單獨 Kt/V
        不能完全反映透析充分度，需結合臨床症狀及血磷、血鉀控制情況評估。</span
      >
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="ktv_showResults" class="results-detail">
      <div class="results-header">評估明細</div>

      <div class="detail-row">
        <span class="detail-qnum">Pre</span>
        <span class="detail-domain">透析前 BUN（Pre-dialysis BUN）</span>
        <span class="detail-score">{{ ktv_Pre !== null ? ktv_Pre : "—" }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Post</span>
        <span class="detail-domain">透析後 BUN（Post-dialysis BUN）</span>
        <span class="detail-score">{{ ktv_Post !== null ? ktv_Post : "—" }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Wt</span>
        <span class="detail-domain">透析後體重（Post-dialysis Weight）</span>
        <span class="detail-score">{{ W !== null ? W : "—" }}</span>
        <span class="detail-desc">kg</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">UF</span>
        <span class="detail-domain">超濾量（Ultrafiltrate Removed）</span>
        <span class="detail-score">{{ UF !== null ? UF : "—" }}</span>
        <span class="detail-desc">L</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Time</span>
        <span class="detail-domain">透析時間（Dialysis Duration）</span>
        <span class="detail-score">{{ Tmin !== null ? Tmin : "—" }}</span>
        <span class="detail-desc">分鐘</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">R</span>
        <span class="detail-domain">BUN 比值（R = Post/Pre）</span>
        <span class="detail-score">{{ R !== null ? R.toFixed(3) : "—" }}</span>
        <span class="detail-desc">ratio</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">URR</span>
        <span class="detail-domain">尿素降低率（Urea Reduction Ratio）</span>
        <span class="detail-score">{{ ktv_urr !== null ? ktv_urr : "—" }}</span>
        <span class="detail-desc">%</span>
      </div>

      <div class="detail-row detail-total">
        <span class="detail-qnum">Kt/V</span>
        <span class="detail-domain">透析充分度（最終結果）</span>
        <span class="detail-score detail-score-brand">{{
          ktv !== null ? ktv : "—"
        }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">Kt/V</span>
          <span class="detail-desc-label">{{ ktv_adequacy.label }}</span>
        </div>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="nihss-actions">
      <button class="btn-view" @click="ktv_showResults = !ktv_showResults">
        {{ ktv_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!ktv_isComplete" @click="ktv_copyOutput">
        {{ ktv_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="ktv_reset">重置</button>
    </div>
  </div>

  <div v-show="activeTab === 'urr'" class="urr">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="urr-header">
      <div class="header-title">
        <h2 class="title">URR 尿素減少率</h2>
        <p class="subtitle">
          Urea Reduction Ratio · 血液透析充分度評估 · URR = (Pre − Post) / Pre ×
          100
        </p>
      </div>
      <div class="score-badge" :class="urr_adequacy.color">
        <span class="score-number">{{ urr_urr !== null ? urr_urr : "—" }}</span>
        <span class="score-unit" v-if="urr_urr !== null">%</span>
        <span class="score-label">{{ urr_adequacy.label }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="urr_adequacy.color"
          :style="{ width: urr_barPct + '%' }"
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
          {{ urr_urr !== null ? urr_urr + "%" : "—" }}
        </span>
      </div>

      <div class="group-items">
        <!-- Pre-BUN -->
        <div
          class="nihss-item"
          :class="{ scored: urr_Pre !== null, 'urr-scored': urr_Pre !== null }"
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
            <span class="item-score" :class="{ zero: urr_Pre === null }">
              {{ urr_Pre !== null ? urr_Pre + " mg/dL" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="urr_preBunVal"
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
          :class="{ scored: urr_Post !== null, 'urr-scored': urr_Post !== null }"
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
            <span class="item-score" :class="{ zero: urr_Post === null }">
              {{ urr_Post !== null ? urr_Post + " mg/dL" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="urr_postBunVal"
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
    <div class="formula-box" v-if="urr_isComplete && urr_urr !== null">
      <span class="formula-label">計算過程：</span>
      <span class="formula-text">
        URR = ({{ urr_Pre }} − {{ urr_Post }}) / {{ urr_Pre }} × 100 = {{ urr_Pre! - urr_Post! }} /
        {{ urr_Pre }} × 100 = <strong>{{ urr_urr }}%</strong>
      </span>
    </div>

    <!-- ── Reference table ───────────────────────────────────── -->
    <div class="ref-table">
      <div class="rt-row rt-header">
        <span>URR</span><span>透析充分度</span><span>臨床建議</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': urr_urr !== null && urr_urr >= 70 }">
        <span class="rt-s normal-t">≥ 70%</span>
        <span>優良</span>
        <span class="rt-sm">維持現有透析處方</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': urr_urr !== null && urr_urr >= 65 && urr_urr < 70 }"
      >
        <span class="rt-s mild-t">65–70%</span>
        <span>充分（KDOQI 最低標準）</span>
        <span class="rt-sm">持續監測</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': urr_urr !== null && urr_urr >= 55 && urr_urr < 65 }"
      >
        <span class="rt-s moderate-t">55–65%</span>
        <span>邊緣不足</span>
        <span class="rt-sm">延長時間或增加血流量</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': urr_urr !== null && urr_urr < 55 }">
        <span class="rt-s critical-t">&lt; 55%</span>
        <span>嚴重透析不足</span>
        <span class="rt-sm">立即重新評估處方</span>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="nihss-result" :class="urr_adequacy.color">
      <div class="result-left">
        <span class="result-number">{{ urr_urr !== null ? urr_urr : "—" }}</span>
        <span class="result-max" v-if="urr_urr !== null">%</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ urr_adequacy.label }}</span>
        <span class="result-advice">{{ urr_adequacy.advice }}</span>
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
    <div v-if="urr_showResults" class="results-detail">
      <div class="results-header">評估明細</div>

      <div class="detail-row">
        <span class="detail-qnum">Pre</span>
        <span class="detail-domain">透析前 BUN（Pre-dialysis BUN）</span>
        <span class="detail-score">{{ urr_Pre !== null ? urr_Pre : "—" }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Post</span>
        <span class="detail-domain">透析後 BUN（Post-dialysis BUN）</span>
        <span class="detail-score">{{ urr_Post !== null ? urr_Post : "—" }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">ΔBun</span>
        <span class="detail-domain">BUN 下降量（Pre − Post）</span>
        <span class="detail-score">{{
          urr_Pre !== null && urr_Post !== null ? (urr_Pre - urr_Post).toFixed(1) : "—"
        }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row detail-total">
        <span class="detail-qnum">URR</span>
        <span class="detail-domain">尿素減少率（最終結果）</span>
        <span class="detail-score detail-score-brand">{{
          urr_urr !== null ? urr_urr : "—"
        }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">%</span>
          <span class="detail-desc-label">{{ urr_adequacy.label }}</span>
        </div>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="nihss-actions">
      <button class="btn-view" @click="urr_showResults = !urr_showResults">
        {{ urr_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!urr_isComplete" @click="urr_copyOutput">
        {{ urr_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="urr_reset">重置</button>
    </div>
  </div>

  <div v-show="activeTab === 'arc'" class="arc">
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
    <div class="formula-box" v-if="arc_isComplete && recirculation !== null">
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
    <div v-if="arc_showResults" class="results-detail">
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
      <button class="btn-view" @click="arc_showResults = !arc_showResults">
        {{ arc_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!arc_isComplete" @click="arc_copyOutput">
        {{ arc_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="arc_reset">重置</button>
    </div>
  </div>
  </div>
</template>

<style scoped>
.hemodialysis {
  max-width: 820px;
  margin: 0 auto;
}

.tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--vp-c-bg-mute);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}

.tab-btn {
  flex: 1;
  min-width: 140px;
  padding: 0.65rem 1rem;
  background: transparent;
  border: 1.5px solid transparent;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-3);
  border-radius: 8px;
  transition: all 0.2s;
}
.tab-btn:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}
.tab-btn.active {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
}

.tab-label {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.02em;
}

.tab-sub {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-top: 2px;
  letter-spacing: 0.01em;
}

.tab-btn.active .tab-sub {
  color: var(--vp-c-brand-1);
  opacity: 0.7;
}

@media (max-width: 640px) {
  .tab-btn {
    padding: 0.5rem 0.65rem;
    min-width: 45%;
  }
  .tab-label {
    font-size: 0.9rem;
  }
  .tab-sub {
    font-size: 0.72rem;
  }
}

/* ══════════════ Shared score badge（三工具統一樣式）══════════════ */
.hemodialysis .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* fixed size so the card doesn't expand when the result appears */
  width: 128px;
  height: 104px;
  flex-shrink: 0;
  padding: 0.4rem 0.5rem;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.hemodialysis .score-number {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.hemodialysis .score-unit {
  font-size: 0.66rem;
  font-weight: 700;
  margin-top: 2px;
  opacity: 0.75;
}
.hemodialysis .score-label {
  font-size: 0.66rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.01em;
  text-align: center;
  line-height: 1.25;
  word-break: break-word;
  max-width: 100%;
}
.hemodialysis .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.hemodialysis .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.hemodialysis .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.hemodialysis .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.hemodialysis .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

@media (max-width: 640px) {
  .hemodialysis .score-badge {
    width: auto;
    height: auto;
    padding: 0.5rem 0.9rem;
  }
}

/* ══════════════ Kt/V 透析充分度（Daugirdas II）══════════════ */

.ktv {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ────────────────────────────────────────────────────── */
.ktv .ktv-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.ktv .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.ktv .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
/* ── Severity bar ──────────────────────────────────────────────── */
.ktv .severity-bar-wrap {
  margin-bottom: 2rem;
}
.ktv .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.ktv .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s ease,
    background 0.3s;
}
.ktv .severity-fill.pending {
  background: var(--vp-c-divider);
}
.ktv .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.ktv .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.ktv .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.ktv .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
/* KDOQI target marker — aligns with the 1.2 ▾ tick at 60% */
.ktv .bar-target-line {
  position: absolute;
  top: -3px;
  left: 60%;
  width: 2px;
  height: 12px;
  background: rgba(34, 197, 94, 0.8);
  transform: translateX(-50%);
  border-radius: 1px;
}
.ktv .severity-ticks-abs,
.ktv .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.ktv .severity-labels-abs {
  margin-top: 0px;
  height: 13px;
}
.ktv .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  font-weight: 700;
}
.ktv .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.ktv .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.ktv .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.ktv .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.ktv .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.ktv .tick-abs.red,
.ktv .label-abs.red {
  color: #ef4444;
}
.ktv .tick-abs.yellow,
.ktv .label-abs.yellow {
  color: #f59e0b;
}
.ktv .tick-abs.green,
.ktv .label-abs.green {
  color: #22c55e;
}
/* ── Groups ────────────────────────────────────────────────────── */
.ktv .nihss-group {
  margin-bottom: 1.75rem;
}
.ktv .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #0d9488;
  margin-bottom: 0.6rem;
}
.ktv .ktv-bar {
  border-left: 3px solid #a855f7;
}
.ktv .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.ktv .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.ktv .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.ktv .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.ktv .ktv-tally {
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
}
.ktv .group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
/* ── Item card ─────────────────────────────────────────────────── */
.ktv .nihss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.ktv .nihss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.ktv .nihss-item.ktv-scored {
  border-color: #a855f7;
}
.ktv .nihss-item.ktv-derived-item {
  border-color: var(--vp-c-divider);
  opacity: 0.85;
}
.ktv .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.ktv .nihss-item.ktv-derived-item .item-header {
  border-bottom: none;
}
.ktv .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.ktv .item-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.ktv .ktv-qnum {
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
}
.ktv .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.ktv .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.ktv .item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.ktv .item-score {
  font-size: 0.85rem;
  font-weight: 800;
  color: #a855f7;
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
}
.ktv .item-score.zero {
  color: var(--vp-c-text-3);
}
/* URR tag inside item-score */
.ktv .urr-tag {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 999px;
}
.ktv .urr-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.ktv .urr-low {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
/* ── Input row ─────────────────────────────────────────────────── */
.ktv .input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.ktv .ktv-input {
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
.ktv .ktv-input::-webkit-outer-spin-button,
.ktv .ktv-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.ktv .ktv-input:focus {
  border-color: #a855f7;
}
.ktv .ktv-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.ktv .input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
/* ── Formula box ───────────────────────────────────────────────── */
.ktv .formula-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  margin-bottom: 1rem;
  font-size: 0.78rem;
}
.ktv .formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.ktv .formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.7;
}
/* ── Reference table ───────────────────────────────────────────── */
.ktv .ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.ktv .rt-row {
  display: grid;
  grid-template-columns: 90px 1fr 80px;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.88rem;
  align-items: center;
}
.ktv .rt-row:last-child {
  border-bottom: none;
}
.ktv .rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.ktv .rt-active {
  background: var(--vp-c-brand-soft);
}
.ktv .rt-s {
  font-weight: 800;
  font-family: monospace;
}
.ktv .normal-t {
  color: #22c55e;
}
.ktv .mild-t {
  color: #f59e0b;
}
.ktv .moderate-t {
  color: #f97316;
}
.ktv .critical-t {
  color: #ef4444;
}
.ktv .rt-sm {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
/* ── Result card ───────────────────────────────────────────────── */
.ktv .nihss-result {
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
.ktv .nihss-result.pending {
  border-color: var(--vp-c-divider);
}
.ktv .nihss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ktv .nihss-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ktv .nihss-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ktv .nihss-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ktv .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.ktv .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.ktv .nihss-result.normal .result-number {
  color: #22c55e;
}
.ktv .nihss-result.mild .result-number {
  color: #f59e0b;
}
.ktv .nihss-result.moderate .result-number {
  color: #f97316;
}
.ktv .nihss-result.critical .result-number {
  color: #ef4444;
}
.ktv .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.ktv .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ktv .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.ktv .result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.ktv .result-sub {
  font-size: 0.8rem;
  color: var(--vp-c-brand-1);
}
/* ── Warning / clinical note ───────────────────────────────────── */
.ktv .warn-box {
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
.ktv .warn-icon {
  color: #f97316;
  flex-shrink: 0;
  font-size: 0.9rem;
}
/* ── Results detail ────────────────────────────────────────────── */
.ktv .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.ktv .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.ktv .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.ktv .detail-row:last-child {
  border-bottom: none;
}
.ktv .detail-total {
  background: var(--vp-c-bg-mute);
}
.ktv .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #a855f7;
  flex-shrink: 0;
  width: 44px;
  padding-top: 1px;
}
.ktv .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.ktv .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.ktv .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.ktv .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
}
.ktv .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.ktv .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.ktv .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
/* ── Actions ───────────────────────────────────────────────────── */
.ktv .nihss-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.ktv .btn-view,
.ktv .btn-copy,
.ktv .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.ktv .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.ktv .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.ktv .btn-view:active {
  transform: translateY(0);
}
.ktv .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.ktv .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.ktv .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.ktv .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.ktv .ktv-header {
    flex-direction: column;
  }
.ktv .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.ktv .score-number {
    font-size: 1.5rem;
  }
.ktv .nihss-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.ktv .rt-row {
    grid-template-columns: 80px 1fr;
  }
.ktv .rt-row span:last-child {
    display: none;
  }
}
/* ══════════════ 尿素減少率（Urea Reduction Ratio）══════════════ */

.urr {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ────────────────────────────────────────────────────── */
.urr .urr-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.urr .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.urr .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
/* ── Severity bar ──────────────────────────────────────────────── */
.urr .severity-bar-wrap {
  margin-bottom: 2rem;
}
.urr .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.urr .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s ease,
    background 0.3s;
}
.urr .severity-fill.pending {
  background: var(--vp-c-divider);
}
.urr .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.urr .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.urr .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.urr .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
/* KDOQI target marker at 65% */
.urr .bar-target-line {
  position: absolute;
  top: -3px;
  width: 2px;
  height: 12px;
  background: rgba(34, 197, 94, 0.8);
  transform: translateX(-50%);
  border-radius: 1px;
}
.urr .severity-ticks-abs,
.urr .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.urr .severity-labels-abs {
  margin-top: 0px;
  height: 13px;
}
.urr .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  font-weight: 700;
}
.urr .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.urr .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.urr .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.urr .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.urr .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.urr .tick-abs.red,
.urr .label-abs.red {
  color: #ef4444;
}
.urr .tick-abs.yellow,
.urr .label-abs.yellow {
  color: #f59e0b;
}
.urr .tick-abs.green,
.urr .label-abs.green {
  color: #22c55e;
}
/* ── Groups ────────────────────────────────────────────────────── */
.urr .nihss-group {
  margin-bottom: 1.75rem;
}
.urr .group-header-bar {
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
.urr .urr-bar {
  border-left: 3px solid #e879f9;
}
.urr .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.urr .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.urr .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.urr .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.urr .urr-tally {
  color: #e879f9;
  background: rgba(232, 121, 249, 0.12);
}
.urr .group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
/* ── Item card ─────────────────────────────────────────────────── */
.urr .nihss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.urr .nihss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.urr .nihss-item.urr-scored {
  border-color: #e879f9;
}
.urr .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.urr .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.urr .item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.urr .urr-qnum {
  color: #e879f9;
  background: rgba(232, 121, 249, 0.12);
}
.urr .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.urr .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.urr .item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.urr .item-score {
  font-size: 0.9rem;
  font-weight: 800;
  color: #e879f9;
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.urr .item-score.zero {
  color: var(--vp-c-text-3);
}
/* ── Input row ─────────────────────────────────────────────────── */
.urr .input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.urr .urr-input {
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
.urr .urr-input::-webkit-outer-spin-button,
.urr .urr-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.urr .urr-input:focus {
  border-color: #e879f9;
}
.urr .urr-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.urr .input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
/* ── Formula box ───────────────────────────────────────────────── */
.urr .formula-box {
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
.urr .formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.urr .formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.6;
}
/* ── Reference table ───────────────────────────────────────────── */
.urr .ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.urr .rt-row {
  display: grid;
  grid-template-columns: 90px 1fr 150px;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.88rem;
  align-items: center;
}
.urr .rt-row:last-child {
  border-bottom: none;
}
.urr .rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.urr .rt-active {
  background: var(--vp-c-brand-soft);
}
.urr .rt-s {
  font-weight: 800;
  font-family: monospace;
}
.urr .normal-t {
  color: #22c55e;
}
.urr .mild-t {
  color: #f59e0b;
}
.urr .moderate-t {
  color: #f97316;
}
.urr .critical-t {
  color: #ef4444;
}
.urr .rt-sm {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
/* ── Result card ───────────────────────────────────────────────── */
.urr .nihss-result {
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
.urr .nihss-result.pending {
  border-color: var(--vp-c-divider);
}
.urr .nihss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.urr .nihss-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.urr .nihss-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.urr .nihss-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.urr .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.urr .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.urr .nihss-result.normal .result-number {
  color: #22c55e;
}
.urr .nihss-result.mild .result-number {
  color: #f59e0b;
}
.urr .nihss-result.moderate .result-number {
  color: #f97316;
}
.urr .nihss-result.critical .result-number {
  color: #ef4444;
}
.urr .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.urr .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.urr .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.urr .result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
/* ── Warning / clinical note ───────────────────────────────────── */
.urr .warn-box {
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
.urr .warn-icon {
  color: #f97316;
  flex-shrink: 0;
  font-size: 0.9rem;
}
/* ── Results detail ────────────────────────────────────────────── */
.urr .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.urr .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.urr .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.urr .detail-row:last-child {
  border-bottom: none;
}
.urr .detail-total {
  background: var(--vp-c-bg-mute);
}
.urr .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #e879f9;
  flex-shrink: 0;
  width: 44px;
  padding-top: 1px;
}
.urr .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.urr .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.urr .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.urr .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 100px;
  text-align: left;
  white-space: normal;
}
.urr .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100px;
  flex-shrink: 0;
}
.urr .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.urr .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
/* ── Actions ───────────────────────────────────────────────────── */
.urr .nihss-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.urr .btn-view,
.urr .btn-copy,
.urr .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.urr .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.urr .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.urr .btn-view:active {
  transform: translateY(0);
}
.urr .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.urr .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.urr .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.urr .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.urr .urr-header {
    flex-direction: column;
  }
.urr .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.urr .score-number {
    font-size: 1.5rem;
  }
.urr .nihss-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.urr .rt-row {
    grid-template-columns: 80px 1fr;
  }
.urr .rt-row span:last-child {
    display: none;
  }
}
/* ══════════════ 通路再循環率（Access Recirculation）══════════════ */

.arc {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ────────────────────────────────────────────────────── */
.arc .arc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.arc .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.arc .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
/* ── Severity bar ──────────────────────────────────────────────── */
.arc .severity-bar-wrap {
  margin-bottom: 2rem;
}
.arc .severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.arc .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s ease,
    background 0.3s;
}
.arc .severity-fill.pending {
  background: var(--vp-c-divider);
}
.arc .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.arc .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.arc .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.arc .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.arc .severity-ticks-abs,
.arc .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.arc .severity-labels-abs {
  margin-top: 0px;
  height: 13px;
}
.arc .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  font-weight: 700;
}
.arc .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.arc .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.arc .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.arc .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.arc .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.arc .tick-abs.green,
.arc .label-abs.green {
  color: #22c55e;
}
.arc .tick-abs.yellow,
.arc .label-abs.yellow {
  color: #f59e0b;
}
.arc .tick-abs.orange,
.arc .label-abs.orange {
  color: #f97316;
}
.arc .tick-abs.red,
.arc .label-abs.red {
  color: #ef4444;
}
/* ── Groups ────────────────────────────────────────────────────── */
.arc .nihss-group {
  margin-bottom: 1.75rem;
}
.arc .group-header-bar {
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
.arc .bun-bar {
  border-left: 3px solid #3b82f6;
}
.arc .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.arc .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.arc .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.arc .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.arc .bun-tally {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.arc .group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
/* ── Item card ─────────────────────────────────────────────────── */
.arc .nihss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.arc .nihss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.arc .nihss-item.bun-scored {
  border-color: #3b82f6;
}
.arc .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.arc .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.arc .item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  letter-spacing: 0.04em;
}
.arc .bun-qnum {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.arc .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.arc .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.arc .item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.arc .item-score {
  font-size: 0.9rem;
  font-weight: 800;
  color: #3b82f6;
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.arc .item-score.zero {
  color: var(--vp-c-text-3);
}
/* ── Input row ─────────────────────────────────────────────────── */
.arc .input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.arc .bun-input {
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
.arc .bun-input::-webkit-outer-spin-button,
.arc .bun-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.arc .bun-input:focus {
  border-color: #3b82f6;
}
.arc .bun-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.arc .input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
/* ── Formula box ───────────────────────────────────────────────── */
.arc .formula-box {
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
.arc .formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.arc .formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.6;
}
/* ── Reference table ───────────────────────────────────────────── */
.arc .ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.arc .rt-row {
  display: grid;
  grid-template-columns: 80px 1fr 1fr;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.88rem;
  align-items: center;
}
.arc .rt-row:last-child {
  border-bottom: none;
}
.arc .rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.arc .rt-header span:last-child {
  text-align: right;
}
.arc .rt-active {
  background: var(--vp-c-brand-soft);
}
.arc .rt-s {
  font-weight: 800;
  font-family: monospace;
}
.arc .normal-t {
  color: #22c55e;
}
.arc .mild-t {
  color: #f59e0b;
}
.arc .moderate-t {
  color: #f97316;
}
.arc .critical-t {
  color: #ef4444;
}
.arc .rt-sm {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  text-align: right;
}
/* ── Result card ───────────────────────────────────────────────── */
.arc .nihss-result {
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
.arc .nihss-result.pending {
  border-color: var(--vp-c-divider);
}
.arc .nihss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.arc .nihss-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.arc .nihss-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.arc .nihss-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.arc .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.arc .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.arc .nihss-result.normal .result-number {
  color: #22c55e;
}
.arc .nihss-result.mild .result-number {
  color: #f59e0b;
}
.arc .nihss-result.moderate .result-number {
  color: #f97316;
}
.arc .nihss-result.critical .result-number {
  color: #ef4444;
}
.arc .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.arc .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.arc .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.arc .result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.arc .result-sub {
  font-size: 0.8rem;
  color: var(--vp-c-brand-1);
}
/* ── Results detail ────────────────────────────────────────────── */
.arc .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.arc .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.arc .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.arc .detail-row:last-child {
  border-bottom: none;
}
.arc .detail-total {
  background: var(--vp-c-bg-mute);
}
.arc .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #3b82f6;
  flex-shrink: 0;
  width: 36px;
  padding-top: 1px;
}
.arc .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
/*
  Flat NIHSS-style row: qnum | domain (flex:1) | score (52px right) | desc (52px left)
*/
.arc 
.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.arc .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.arc .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
}
/* Last R% row: desc column becomes unit + severity label stacked */
.arc .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.arc .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.arc .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: nowrap;
}
/* ── Actions ───────────────────────────────────────────────────── */
.arc .nihss-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.arc .btn-view,
.arc .btn-copy,
.arc .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.arc .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.arc .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.arc .btn-view:active {
  transform: translateY(0);
}
.arc .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.arc .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.arc .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.arc .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.arc .arc-header {
    flex-direction: column;
  }
.arc .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.arc .score-number {
    font-size: 1.5rem;
  }
.arc .nihss-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
