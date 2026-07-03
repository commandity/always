<script setup lang="ts">
import { ref, computed, watch } from "vue";

const activeTab = ref<"h2o" | "ivc">("h2o");

// ══════════════ 自由水缺乏量（Free Water Deficit）══════════════

// Free Water Deficit (FWD):
// TBW  = LBM × 0.6 (male) or LBM × 0.5 (female)
// FWD  = TBW × (Na / 140 − 1)
// Safe correction: ≤ 0.5 mEq/L/hr Na drop
// Chronic hypernatremia: correct over 48–72 h
// Acute  hypernatremia: correct over 24 h

const lbmVal = ref("");
const naVal = ref("");
const gender = ref<"M" | "F">("M");
const h2o_copied = ref(false);
const h2o_showResults = ref(false);

const LBM = computed(() => {
  const v = parseFloat(lbmVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const Na = computed(() => {
  const v = parseFloat(naVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const h2o_isComplete = computed(() => LBM.value !== null && Na.value !== null);

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
  if (!h2o_isComplete.value) return null;
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

const h2o_barPct = computed(() => {
  if (Na.value === null) return 0;
  return Math.min(Math.max(((Na.value - 140) / 40) * 100, 0), 100);
});

const h2o_severity = computed(() => {
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

function h2o_generateOutput() {
  return (
    `# 自由水缺乏量計算\n\n` +
    `## 輸入數值\n\n` +
    `- **去脂體重（LBM）**：${LBM.value ?? "—"} kg\n` +
    `- **血鈉（Plasma Na）**：${Na.value ?? "—"} mEq/L\n` +
    `- **性別**：${gender.value === "M" ? "男性（TBW × 0.6）" : "女性（TBW × 0.5）"}\n` +
    `- **總體水量（TBW）**：${tbw.value ?? "—"} L\n\n` +
    `## 結果\n\n` +
    `- **自由水缺乏量 = ${deficit.value !== null && deficit.value > 0 ? deficit.value : 0} L**\n` +
    `- 評估：${h2o_severity.value.label}\n` +
    `- ${h2o_severity.value.advice}\n` +
    (corrRate48.value
      ? `- 建議補液速率（48h 慢性）：${corrRate48.value} mL/hr\n`
      : "") +
    (corrRate24.value
      ? `- 建議補液速率（24h 急性）：${corrRate24.value} mL/hr`
      : "")
  );
}

async function h2o_copyOutput() {
  await navigator.clipboard.writeText(h2o_generateOutput());
  h2o_copied.value = true;
  setTimeout(() => (h2o_copied.value = false), 2000);
}

function h2o_reset() {
  lbmVal.value = "";
  naVal.value = "";
  h2o_showResults.value = false;
}

// ══════════════ IVC/BSA 比值（IVC/BSA Ratio）══════════════

// BSA (Mosteller): sqrt(Height(cm) × Weight(kg) / 3600)
// IVC/BSA Ratio = IVC Diameter (mm) / BSA (m²)
// Normal: 8–11.5 mm/m²  |  < 8 = hypovolemia  |  > 11.5 = volume overload

const heightVal = ref("");
const weightVal = ref("");
const ivcVal = ref("");
const ivc_copied = ref(false);
const ivc_showResults = ref(false);

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

const ivc_isComplete = computed(
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
const ivc_barPct = computed(() => {
  if (ratio.value === null) return 0;
  return Math.min((ratio.value / 20) * 100, 100);
});

const ivc_severity = computed(() => {
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

function ivc_generateOutput() {
  return (
    `# IVC/BSA 比值計算\n\n` +
    `## 輸入數值\n\n` +
    `- **身高（Height）**：${H.value ?? "—"} cm\n` +
    `- **體重（Weight）**：${W.value ?? "—"} kg\n` +
    `- **IVC 直徑（IVC Diameter）**：${IV.value ?? "—"} mm\n` +
    `- **體表面積（BSA）**：${bsa.value ?? "—"} m²\n\n` +
    `## 結果\n\n` +
    `- **IVC/BSA = ${ratio.value ?? "—"} mm/m²**\n` +
    `- 評估：${ivc_severity.value.label}\n` +
    `- ${ivc_severity.value.advice}`
  );
}

async function ivc_copyOutput() {
  await navigator.clipboard.writeText(ivc_generateOutput());
  ivc_copied.value = true;
  setTimeout(() => (ivc_copied.value = false), 2000);
}

function ivc_reset() {
  heightVal.value = "";
  weightVal.value = "";
  ivcVal.value = "";
  ivc_showResults.value = false;
}
</script>

<template>
  <div class="volstatus">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'h2o' }"
        @click="activeTab = 'h2o'"
      >
        <span class="tab-label">自由水缺乏量</span>
        <span class="tab-sub">Free Water Deficit</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'ivc' }"
        @click="activeTab = 'ivc'"
      >
        <span class="tab-label">IVC/BSA 比值</span>
        <span class="tab-sub">IVC/BSA Ratio</span>
      </button>
    </div>

  <div v-show="activeTab === 'h2o'" class="h2o" :style="{ '--g': themeHex, '--g-rgb': themeRgb }">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="h2o-header">
      <div class="header-title">
        <h2 class="title">自由水缺乏量</h2>
        <p class="subtitle">
          Free Water Deficit · 高血鈉症補液計算 · FWD = TBW × (Na / 140 − 1)
        </p>
      </div>
      <div class="score-badge" :class="h2o_severity.color">
        <span class="score-number">
          {{ deficit !== null && deficit > 0 ? deficit : "—" }}
        </span>
        <span class="score-unit" v-if="deficit !== null && deficit > 0">L</span>
        <span class="score-label">{{ h2o_severity.label }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="h2o_severity.color"
          :style="{ width: h2o_barPct + '%' }"
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
    <div class="formula-box" v-if="h2o_isComplete && deficit !== null">
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
    <div class="nihss-result" :class="h2o_severity.color">
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
        <span class="result-level">{{ h2o_severity.label }}</span>
        <span class="result-advice">{{ h2o_severity.advice }}</span>
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
    <div v-if="h2o_showResults" class="results-detail">
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
          <span class="detail-desc-label">{{ h2o_severity.label }}</span>
        </div>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="nihss-actions">
      <button class="btn-view" @click="h2o_showResults = !h2o_showResults">
        {{ h2o_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!h2o_isComplete" @click="h2o_copyOutput">
        {{ h2o_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="h2o_reset">重置</button>
    </div>
  </div>

  <div v-show="activeTab === 'ivc'" class="ivc">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="ivc-header">
      <div class="header-title">
        <h2 class="title">IVC / BSA 比值</h2>
        <p class="subtitle">
          Inferior Vena Cava / Body Surface Area · 體積狀態評估 · IVC/BSA =
          IVC(mm) ÷ BSA(m²)
        </p>
      </div>
      <div class="score-badge" :class="ivc_severity.color">
        <span class="score-number">{{ ratio !== null ? ratio : "—" }}</span>
        <span class="score-unit" v-if="ratio !== null">mm/m²</span>
        <span class="score-label">{{ ivc_severity.label }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="ivc_severity.color"
          :style="{ width: ivc_barPct + '%' }"
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
    <div class="formula-box" v-if="ivc_isComplete && ratio !== null">
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
    <div class="nihss-result" :class="ivc_severity.color">
      <div class="result-left">
        <span class="result-number">{{ ratio !== null ? ratio : "—" }}</span>
        <span class="result-max" v-if="ratio !== null">mm/m²</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ ivc_severity.label }}</span>
        <span class="result-advice">{{ ivc_severity.advice }}</span>
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
    <div v-if="ivc_showResults" class="results-detail">
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
          <span class="detail-desc-label">{{ ivc_severity.label }}</span>
        </div>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="nihss-actions">
      <button class="btn-view" @click="ivc_showResults = !ivc_showResults">
        {{ ivc_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!ivc_isComplete" @click="ivc_copyOutput">
        {{ ivc_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="ivc_reset">重置</button>
    </div>
  </div>
  </div>
</template>

<style scoped>
.volstatus {
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

/* ══════════════ 自由水缺乏量（Free Water Deficit）══════════════ */

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
.h2o .h2o-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.h2o .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.h2o .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.h2o .score-badge {
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
.h2o .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}
.h2o .score-unit {
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 1px;
}
.h2o .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.02em;
  text-align: center;
}
.h2o .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.h2o .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.h2o .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.h2o .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.h2o .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
/* ── Severity bar ──────────────────────────────────────────────── */
.h2o .severity-bar-wrap {
  margin-bottom: 2rem;
}
.h2o .severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.h2o .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s ease,
    background 0.3s;
}
.h2o .severity-fill.pending {
  background: var(--vp-c-divider);
}
.h2o .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.h2o .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.h2o .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.h2o .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.h2o .severity-ticks-abs,
.h2o .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.h2o .severity-labels-abs {
  margin-top: 0px;
  height: 13px;
}
.h2o .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  font-weight: 700;
}
.h2o .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.h2o .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.h2o .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.h2o .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.h2o .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.h2o .tick-abs.green,
.h2o .label-abs.green {
  color: #22c55e;
}
.h2o .tick-abs.yellow,
.h2o .label-abs.yellow {
  color: #f59e0b;
}
.h2o .tick-abs.orange,
.h2o .label-abs.orange {
  color: #f97316;
}
.h2o .tick-abs.red,
.h2o .label-abs.red {
  color: #ef4444;
}
/* ── Groups ────────────────────────────────────────────────────── */
.h2o .nihss-group {
  margin-bottom: 1.5rem;
}
.h2o .group-header-bar {
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
.h2o .h2o-gender-bar {
  border-left: 3px solid var(--g);
}
.h2o .h2o-bar {
  border-left: 3px solid var(--g);
}
.h2o .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.h2o .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.h2o .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.h2o .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
/* Tally uses gender theme */
.h2o .h2o-tally {
  color: var(--g);
  background: rgba(var(--g-rgb), 0.12);
}
/* ── Gender toggle ─────────────────────────────────────────────── */
.h2o .gender-toggle {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}
.h2o .gender-toggle button {
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
.h2o .btn-male.active-m {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.07);
  color: #38bdf8;
}
.h2o .btn-male.active-m .gender-sub {
  color: rgba(56, 189, 248, 0.65);
}
/* Female button: rose pink when active */
.h2o .btn-female.active-f {
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.07);
  color: #f472b6;
}
.h2o .btn-female.active-f .gender-sub {
  color: rgba(244, 114, 182, 0.65);
}
.h2o .gender-toggle button:hover:not(.active-m):not(.active-f) {
  border-color: var(--vp-c-text-3);
  color: var(--vp-c-text-1);
}
.h2o .gender-icon {
  font-size: 1.4rem;
  line-height: 1;
}
.h2o .gender-label {
  font-size: 0.85rem;
  font-weight: 700;
}
.h2o .gender-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  font-weight: 400;
}
/* ── Group items ───────────────────────────────────────────────── */
.h2o .group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
/* ── Item card ─────────────────────────────────────────────────── */
.h2o .nihss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.h2o .nihss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
/* Scored items use gender theme border */
.h2o .nihss-item.h2o-scored {
  border-color: var(--g);
}
.h2o .nihss-item.h2o-derived-item {
  border-color: var(--vp-c-divider);
  opacity: 0.8;
}
.h2o .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.h2o .nihss-item.h2o-derived-item .item-header {
  border-bottom: none;
}
.h2o .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.h2o .item-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
/* Qnum badge uses gender theme */
.h2o .h2o-qnum {
  color: var(--g);
  background: rgba(var(--g-rgb), 0.12);
}
.h2o .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.h2o .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.h2o .item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
/* Item score uses gender theme */
.h2o .item-score {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--g);
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.h2o .item-score.zero {
  color: var(--vp-c-text-3);
}
/* ── Input row ─────────────────────────────────────────────────── */
.h2o .input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.h2o .h2o-input {
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
.h2o .h2o-input::-webkit-outer-spin-button,
.h2o .h2o-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
/* Focus ring uses gender theme */
.h2o .h2o-input:focus {
  border-color: var(--g);
}
.h2o .h2o-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.h2o .input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
/* ── Formula box ───────────────────────────────────────────────── */
.h2o .formula-box {
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
.h2o .formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.h2o .formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.6;
}
/* ── Reference table ───────────────────────────────────────────── */
.h2o .ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.h2o .rt-row {
  display: grid;
  grid-template-columns: 100px 1fr 140px;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.h2o .rt-row:last-child {
  border-bottom: none;
}
.h2o .rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.h2o .rt-active {
  background: var(--vp-c-brand-soft);
}
.h2o .rt-s {
  font-weight: 800;
  font-family: monospace;
}
.h2o .normal-t {
  color: #22c55e;
}
.h2o .mild-t {
  color: #f59e0b;
}
.h2o .moderate-t {
  color: #f97316;
}
.h2o .critical-t {
  color: #ef4444;
}
.h2o .rt-sm {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
/* ── Result card ───────────────────────────────────────────────── */
.h2o .nihss-result {
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
.h2o .nihss-result.pending {
  border-color: var(--vp-c-divider);
}
.h2o .nihss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.h2o .nihss-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.h2o .nihss-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.h2o .nihss-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.h2o .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.h2o .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.h2o .nihss-result.normal .result-number {
  color: #22c55e;
}
.h2o .nihss-result.mild .result-number {
  color: #f59e0b;
}
.h2o .nihss-result.moderate .result-number {
  color: #f97316;
}
.h2o .nihss-result.critical .result-number {
  color: #ef4444;
}
.h2o .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.h2o .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.h2o .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.h2o .result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.h2o .result-sub {
  font-size: 0.8rem;
  color: var(--vp-c-brand-1);
}
/* ── Warning box ───────────────────────────────────────────────── */
.h2o .warn-box {
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
.h2o .warn-icon {
  color: #f97316;
  flex-shrink: 0;
  font-size: 0.9rem;
}
/* ── Results detail ────────────────────────────────────────────── */
.h2o .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.h2o .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.h2o .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.h2o .detail-row:last-child {
  border-bottom: none;
}
.h2o .detail-total {
  background: var(--vp-c-bg-mute);
}
/* Detail qnum uses gender theme */
.h2o .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--g);
  flex-shrink: 0;
  width: 44px;
  padding-top: 1px;
}
.h2o .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.h2o .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.h2o .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.h2o .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
}
.h2o .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.h2o .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.h2o .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
/* ── Actions ───────────────────────────────────────────────────── */
.h2o .nihss-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.h2o .btn-view,
.h2o .btn-copy,
.h2o .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.h2o .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.h2o .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.h2o .btn-view:active {
  transform: translateY(0);
}
.h2o .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.h2o .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.h2o .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.h2o .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.h2o .h2o-header {
    flex-direction: column;
  }
.h2o .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.h2o .score-number {
    font-size: 1.5rem;
  }
.h2o .nihss-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.h2o .gender-toggle {
    flex-direction: column;
  }
.h2o .gender-toggle button {
    min-width: unset;
    flex-direction: row;
    gap: 0.5rem;
  }
.h2o .rt-row {
    grid-template-columns: 80px 1fr;
  }
.h2o .rt-row span:last-child {
    display: none;
  }
}
/* ══════════════ IVC/BSA 比值（IVC/BSA Ratio）══════════════ */

.ivc {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ────────────────────────────────────────────────────── */
.ivc .ivc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.ivc .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.ivc .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.ivc .score-badge {
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
.ivc .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}
.ivc .score-unit {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 1px;
}
.ivc .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.02em;
  text-align: center;
}
.ivc .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.ivc .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ivc .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ivc .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ivc .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
/* ── Severity bar ──────────────────────────────────────────────── */
.ivc .severity-bar-wrap {
  margin-bottom: 2rem;
}
.ivc .severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.ivc .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s ease,
    background 0.3s;
}
.ivc .severity-fill.pending {
  background: var(--vp-c-divider);
}
.ivc .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.ivc .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.ivc .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.ivc .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.ivc .severity-ticks-abs,
.ivc .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.ivc .severity-labels-abs {
  margin-top: 0px;
  height: 13px;
}
.ivc .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  font-weight: 700;
}
.ivc .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.ivc .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.ivc .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.ivc .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.ivc .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.ivc .tick-abs.yellow,
.ivc .label-abs.yellow {
  color: #f59e0b;
}
.ivc .tick-abs.green,
.ivc .label-abs.green {
  color: #22c55e;
}
.ivc .tick-abs.orange,
.ivc .label-abs.orange {
  color: #f97316;
}
.ivc .tick-abs.red,
.ivc .label-abs.red {
  color: #ef4444;
}
/* ── Groups ────────────────────────────────────────────────────── */
.ivc .nihss-group {
  margin-bottom: 1.75rem;
}
.ivc .group-header-bar {
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
.ivc .ivc-bar {
  border-left: 3px solid #06b6d4;
}
.ivc .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.ivc .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.ivc .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.ivc .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.ivc .ivc-tally {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.ivc .group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
/* ── Item card ─────────────────────────────────────────────────── */
.ivc .nihss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.ivc .nihss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.ivc .nihss-item.ivc-scored {
  border-color: #06b6d4;
}
.ivc .nihss-item.ivc-derived-item {
  border-color: var(--vp-c-divider);
  opacity: 0.8;
}
.ivc .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.ivc .nihss-item.ivc-derived-item .item-header {
  border-bottom: none;
}
.ivc .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.ivc .item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.ivc .ivc-qnum {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.ivc .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.ivc .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.ivc .item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.ivc .item-score {
  font-size: 0.9rem;
  font-weight: 800;
  color: #06b6d4;
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.ivc .item-score.zero {
  color: var(--vp-c-text-3);
}
/* ── Input row ─────────────────────────────────────────────────── */
.ivc .input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.ivc .ivc-input {
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
.ivc .ivc-input::-webkit-outer-spin-button,
.ivc .ivc-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.ivc .ivc-input:focus {
  border-color: #06b6d4;
}
.ivc .ivc-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.ivc .input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
/* ── Formula box ───────────────────────────────────────────────── */
.ivc .formula-box {
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
.ivc .formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.ivc .formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.6;
}
/* ── Reference table ───────────────────────────────────────────── */
.ivc .ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.ivc .rt-row {
  display: grid;
  grid-template-columns: 120px 1fr 110px;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.ivc .rt-row:last-child {
  border-bottom: none;
}
.ivc .rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.ivc .rt-active {
  background: var(--vp-c-brand-soft);
}
.ivc .rt-s {
  font-weight: 800;
  font-family: monospace;
}
.ivc .normal-t {
  color: #22c55e;
}
.ivc .mild-t {
  color: #f59e0b;
}
.ivc .moderate-t {
  color: #f97316;
}
.ivc .critical-t {
  color: #ef4444;
}
.ivc .rt-sm {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
/* ── Result card ───────────────────────────────────────────────── */
.ivc .nihss-result {
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
.ivc .nihss-result.pending {
  border-color: var(--vp-c-divider);
}
.ivc .nihss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ivc .nihss-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ivc .nihss-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ivc .nihss-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ivc .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.ivc .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.ivc .nihss-result.normal .result-number {
  color: #22c55e;
}
.ivc .nihss-result.mild .result-number {
  color: #f59e0b;
}
.ivc .nihss-result.moderate .result-number {
  color: #f97316;
}
.ivc .nihss-result.critical .result-number {
  color: #ef4444;
}
.ivc .result-max {
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
}
.ivc .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ivc .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.ivc .result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
/* ── Warning / clinical note ───────────────────────────────────── */
.ivc .warn-box {
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
.ivc .warn-icon {
  color: #f97316;
  flex-shrink: 0;
  font-size: 0.9rem;
}
/* ── Results detail ────────────────────────────────────────────── */
.ivc .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.ivc .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.ivc .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.ivc .detail-row:last-child {
  border-bottom: none;
}
.ivc .detail-total {
  background: var(--vp-c-bg-mute);
}
.ivc .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #06b6d4;
  flex-shrink: 0;
  width: 44px;
  padding-top: 1px;
}
.ivc .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.ivc .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.ivc .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.ivc .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
}
.ivc .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.ivc .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.ivc .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
/* ── Actions ───────────────────────────────────────────────────── */
.ivc .nihss-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.ivc .btn-view,
.ivc .btn-copy,
.ivc .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.ivc .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.ivc .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.ivc .btn-view:active {
  transform: translateY(0);
}
.ivc .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.ivc .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.ivc .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.ivc .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.ivc .ivc-header {
    flex-direction: column;
  }
.ivc .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.ivc .score-number {
    font-size: 1.5rem;
  }
.ivc .nihss-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.ivc .rt-row {
    grid-template-columns: 90px 1fr;
  }
.ivc .rt-row span:last-child {
    display: none;
  }
}
</style>
