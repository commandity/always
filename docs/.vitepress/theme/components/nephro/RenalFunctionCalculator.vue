<script setup lang="ts">
import { ref, computed, watch } from "vue";

const activeTab = ref<"mdrd" | "bdc" | "ddc" | "fec">("mdrd");

// ══════════════ MDRD 腎絲球過濾率（Estimated GFR）══════════════

// ── MDRD GFR — Unified Calculator ────────────────────────────────
// Tab A: Greene simplified (4-variable)
//   GFR = 186 × Cr^(-1.154) × Age^(-0.203) × [0.742 F] × [1.212 Black]
// Tab B: Levey original (7-variable)
//   GFR = 170 × Cr^(-0.999) × Age^(-0.176) × BUN^(-0.170) × Alb^(+0.318)
//          × [0.762 F] × [1.180 Black]

const method = ref<"greene" | "levey">("greene");
const crVal = ref("");
const ageVal = ref("");
const gender = ref<"M" | "F">("M");
const african = ref(false);
const albVal = ref("");
const bunVal = ref("");
const mdrd_copied = ref(false);
const mdrd_showResults = ref(false);

const Cr = computed(() => {
  const v = parseFloat(crVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const Age = computed(() => {
  const v = parseFloat(ageVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const Alb = computed(() => {
  const v = parseFloat(albVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const BUN = computed(() => {
  const v = parseFloat(bunVal.value);
  return isNaN(v) || v <= 0 ? null : v;
});

const mdrd_isComplete = computed(() => {
  if (Cr.value === null || Age.value === null) return false;
  if (method.value === "levey") return Alb.value !== null && BUN.value !== null;
  return true;
});

const greeneGfr = computed(() => {
  if (Cr.value === null || Age.value === null) return null;
  let g = 186 * Math.pow(Cr.value, -1.154) * Math.pow(Age.value, -0.203);
  if (gender.value === "F") g *= 0.742;
  if (african.value) g *= 1.212;
  return Math.round(g * 10) / 10;
});

const leveyGfr = computed(() => {
  if (
    Cr.value === null ||
    Age.value === null ||
    Alb.value === null ||
    BUN.value === null
  )
    return null;
  let g =
    170 *
    Math.pow(Cr.value, -0.999) *
    Math.pow(Age.value, -0.176) *
    Math.pow(BUN.value, -0.17) *
    Math.pow(Alb.value, 0.318);
  if (gender.value === "F") g *= 0.762;
  if (african.value) g *= 1.18;
  return Math.round(g * 10) / 10;
});

const gfr = computed(() =>
  method.value === "greene" ? greeneGfr.value : leveyGfr.value,
);

const bothAvailable = computed(
  () => greeneGfr.value !== null && leveyGfr.value !== null,
);
const diff = computed(() =>
  bothAvailable.value
    ? Math.round((leveyGfr.value! - greeneGfr.value!) * 10) / 10
    : null,
);

// bar fill: GFR 0–120 mapped to 0–100%
const mdrd_barPct = computed(() => {
  if (gfr.value === null) return 0;
  return Math.min((gfr.value / 120) * 100, 100);
});

function getStage(g: number | null) {
  if (g === null)
    return { label: "尚未計算", color: "pending", ckd: "—", action: "" };
  if (g >= 90)
    return {
      label: "正常或偏高",
      color: "normal",
      ckd: "G1",
      action: "每年監測，控制危險因子（血壓、血糖、蛋白尿）",
    };
  if (g >= 60)
    return {
      label: "輕度下降",
      color: "normal",
      ckd: "G2",
      action: "每年監測，評估進展速率",
    };
  if (g >= 45)
    return {
      label: "輕中度下降",
      color: "mild",
      ckd: "G3a",
      action: "每 6 個月監測，轉介腎臟科評估",
    };
  if (g >= 30)
    return {
      label: "中重度下降",
      color: "moderate",
      ckd: "G3b",
      action: "每 3–6 個月監測，準備腎替代療法諮詢",
    };
  if (g >= 15)
    return {
      label: "重度下降",
      color: "severe",
      ckd: "G4",
      action: "每 3 個月監測，積極準備腎替代療法",
    };
  return {
    label: "腎衰竭",
    color: "critical",
    ckd: "G5",
    action: "透析或腎移植評估，腎臟科密切追蹤",
  };
}

const stage = computed(() => getStage(gfr.value));

const formulaText = computed(() => {
  if (method.value === "greene") {
    let f = "186 × Cr⁻¹·¹⁵⁴ × Age⁻⁰·²⁰³";
    if (gender.value === "F") f += " × 0.742";
    if (african.value) f += " × 1.212";
    return f;
  } else {
    let f = "170 × Cr⁻⁰·⁹⁹⁹ × Age⁻⁰·¹⁷⁶ × BUN⁻⁰·¹⁷⁰ × Alb⁺⁰·³¹⁸";
    if (gender.value === "F") f += " × 0.762";
    if (african.value) f += " × 1.180";
    return f;
  }
});

function mdrd_generateOutput() {
  const label =
    method.value === "greene"
      ? "Greene 簡化公式（4變項）"
      : "Levey 原始公式（7變項）";
  let out = `# MDRD 腎絲球過濾率估算\n\n## 使用公式\n${label}\n\n## 輸入數值\n\n`;
  out += `- **血清肌酸酐（Cr）**：${Cr.value ?? "—"} mg/dL\n`;
  out += `- **年齡（Age）**：${Age.value ?? "—"} 歲\n`;
  out += `- **性別**：${gender.value === "M" ? "男性" : "女性"}\n`;
  out += `- **非洲裔**：${african.value ? "是（× 1.212）" : "否"}\n`;
  if (method.value === "levey") {
    out += `- **白蛋白（Alb）**：${Alb.value ?? "—"} g/dL\n`;
    out += `- **BUN**：${BUN.value ?? "—"} mg/dL\n`;
  }
  out += `\n## 結果\n\n- **eGFR = ${gfr.value ?? "—"} mL/min/1.73m²**\n`;
  out += `- CKD 分期：${stage.value.ckd}（${stage.value.label}）\n`;
  out += `- 建議：${stage.value.action}`;
  if (bothAvailable.value) {
    out += `\n\n## 兩公式比較\n- Greene = ${greeneGfr.value} | Levey = ${leveyGfr.value} | 差值 = ${diff.value}`;
  }
  return out;
}

async function mdrd_copyOutput() {
  await navigator.clipboard.writeText(mdrd_generateOutput());
  mdrd_copied.value = true;
  setTimeout(() => (mdrd_copied.value = false), 2000);
}

function mdrd_reset() {
  crVal.value = "";
  ageVal.value = "";
  albVal.value = "";
  bunVal.value = "";
  gender.value = "M";
  african.value = false;
  mdrd_showResults.value = false;
}

watch(method, () => {
  /* fields preserved intentionally */
});

// ══════════════ 碳酸氫鈉缺乏量（Bicarbonate Deficit）══════════════

// Bicarbonate Deficit (mEq) = 0.5 × Weight(kg) × (HCO3_desired - HCO3_observed)
// Give half over 3–4h, then reassess

const desiredVal = ref("");
const observedVal = ref("");
const weightVal = ref("");
const bdc_copied = ref(false);
const bdc_showResults = ref(false);

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

const bdc_isComplete = computed(
  () => D.value !== null && O.value !== null && W.value !== null,
);

const deficit = computed(() => {
  if (!bdc_isComplete.value) return null;
  const d = 0.5 * W.value! * (D.value! - O.value!);
  return Math.round(d * 10) / 10;
});

const halfDose = computed(() =>
  deficit.value !== null && deficit.value > 0
    ? Math.round((deficit.value / 2) * 10) / 10
    : null,
);

const bdc_severity = computed(() => {
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
const bdc_barPct = computed(() => {
  if (deficit.value === null || deficit.value <= 0) return 0;
  return Math.min((deficit.value / 200) * 100, 100);
});

function bdc_generateOutput() {
  return (
    `# 碳酸氫鈉缺乏量計算\n\n` +
    `## 輸入數值\n\n` +
    `- **目標 HCO₃⁻（Desired）**：${D.value ?? "—"} mmol/L\n` +
    `- **實測 HCO₃⁻（Observed）**：${O.value ?? "—"} mmol/L\n` +
    `- **體重（Weight）**：${W.value ?? "—"} kg\n\n` +
    `## 結果\n\n` +
    `- **Bicarbonate Deficit = ${deficit.value ?? "—"} mEq**\n` +
    `- 首次給予劑量（50%）：${halfDose.value ?? "—"} mEq / 3–4 小時\n` +
    `- 評估：${bdc_severity.value.label}\n` +
    `- ${bdc_severity.value.advice}`
  );
}

async function bdc_copyOutput() {
  await navigator.clipboard.writeText(bdc_generateOutput());
  bdc_copied.value = true;
  setTimeout(() => (bdc_copied.value = false), 2000);
}

function bdc_reset() {
  desiredVal.value = "";
  observedVal.value = "";
  weightVal.value = "";
  bdc_showResults.value = false;
}

// ══════════════ Delta/Delta 比值（Mixed Acid-Base）══════════════

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
const ddc_copied = ref(false);
const ddc_showResults = ref(false);

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

const ddc_isComplete = computed(
  () => Na.value !== null && Cl.value !== null && HCO3.value !== null,
);

const ag = computed(() => {
  if (!ddc_isComplete.value) return null;
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
const ddc_barPct = computed(() => {
  if (dd.value === null || dd.value < 0) return 0;
  return Math.min((dd.value / 3) * 100, 100);
});

function ddc_generateOutput() {
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

async function ddc_copyOutput() {
  await navigator.clipboard.writeText(ddc_generateOutput());
  ddc_copied.value = true;
  setTimeout(() => (ddc_copied.value = false), 2000);
}

function ddc_reset() {
  naVal.value = "";
  clVal.value = "";
  hco3Val.value = "";
  ddc_showResults.value = false;
}

// ══════════════ 分餾排泄率（Fractional Excretion）══════════════

// Fractional Excretion of X (FEX):
// FE(X) = (Urine X × Serum Cr) / (Serum X × Urine Cr) × 100
// FENa < 1%  = prerenal  |  FENa > 2% = intrinsic renal
// FEUrea < 35% = prerenal (useful when diuretics given)

const substLabel = ref("Na");
const uxVal = ref(""); // Urine X
const pxVal = ref(""); // Plasma/Serum X
const seCrVal = ref(""); // Serum Creatinine
const uCrVal = ref(""); // Urine Creatinine
const fec_copied = ref(false);
const fec_showResults = ref(false);

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

const fec_isComplete = computed(
  () =>
    UX.value !== null &&
    PX.value !== null &&
    SCr.value !== null &&
    UCr.value !== null,
);

const fe = computed(() => {
  if (!fec_isComplete.value) return null;
  return (
    Math.round(
      ((UX.value! * SCr.value!) / (PX.value! * UCr.value!)) * 100 * 100,
    ) / 100
  );
});

// bar fill based on FENa thresholds (cap at 10%)
const fec_barPct = computed(() => {
  if (fe.value === null || fe.value < 0) return 0;
  return Math.min((fe.value / 10) * 100, 100);
});

const fec_severity = computed(() => {
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

function fec_generateOutput() {
  return (
    `# 分餾排泄率 FE${substLabel.value}\n\n` +
    `## 輸入數值\n\n` +
    `- **尿液 ${substLabel.value}（U${substLabel.value}）**：${UX.value ?? "—"} mEq/L\n` +
    `- **血清 ${substLabel.value}（P${substLabel.value}）**：${PX.value ?? "—"} mEq/L\n` +
    `- **血清肌酸酐（Se-Cr）**：${SCr.value ?? "—"} mg/dL\n` +
    `- **尿液肌酸酐（U-Cr）**：${UCr.value ?? "—"} mg/dL\n\n` +
    `## 結果\n\n` +
    `- **FE${substLabel.value} = ${fe.value ?? "—"}%**\n` +
    `- 評估：${fec_severity.value.label}\n` +
    `- ${fec_severity.value.advice}`
  );
}

async function fec_copyOutput() {
  await navigator.clipboard.writeText(fec_generateOutput());
  fec_copied.value = true;
  setTimeout(() => (fec_copied.value = false), 2000);
}

function fec_reset() {
  uxVal.value = "";
  pxVal.value = "";
  seCrVal.value = "";
  uCrVal.value = "";
  fec_showResults.value = false;
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
  fec_reset();
}
</script>

<template>
  <div class="renalfn">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'mdrd' }"
        @click="activeTab = 'mdrd'"
      >
        <span class="tab-label">MDRD 腎絲球過濾率</span>
        <span class="tab-sub">Estimated GFR</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'bdc' }"
        @click="activeTab = 'bdc'"
      >
        <span class="tab-label">碳酸氫鈉缺乏量</span>
        <span class="tab-sub">Bicarbonate Deficit</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'ddc' }"
        @click="activeTab = 'ddc'"
      >
        <span class="tab-label">Delta/Delta 比值</span>
        <span class="tab-sub">Mixed Acid-Base</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'fec' }"
        @click="activeTab = 'fec'"
      >
        <span class="tab-label">分餾排泄率</span>
        <span class="tab-sub">Fractional Excretion</span>
      </button>
    </div>

  <div v-show="activeTab === 'mdrd'" class="mdrd">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="mdrd-header">
      <div class="header-title">
        <h2 class="title">MDRD 腎絲球過濾率</h2>
        <p class="subtitle">
          Modification of Diet in Renal Disease · eGFR 估算 · Greene 4-var /
          Levey 7-var
        </p>
      </div>
      <div class="score-badge" :class="stage.color">
        <span class="badge-label">{{
          method === "greene" ? "Greene" : "Levey"
        }}</span>
        <span class="score-number">{{ gfr !== null ? gfr : "—" }}</span>
        <span class="score-unit" v-if="gfr !== null">mL/min/1.73m²</span>
        <span class="score-label">{{ stage.ckd }} · {{ stage.label }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="stage.color"
          :style="{ width: mdrd_barPct + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs" style="left: 0%">0</span>
        <span class="tick-abs red" style="left: 12.5%">15</span>
        <span class="tick-abs orange" style="left: 25%">30</span>
        <span class="tick-abs yellow" style="left: 37.5%">45</span>
        <span class="tick-abs yellow" style="left: 50%">60</span>
        <span class="tick-abs green" style="left: 75%">90</span>
        <span class="tick-abs" style="left: 100%">120+</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs" style="left: 0%"></span>
        <span class="label-abs red" style="left: 12.5%">Stage V</span>
        <span class="label-abs orange" style="left: 25%">Stage IV</span>
        <span class="label-abs yellow" style="left: 37.5%">Stage IIIB</span>
        <span class="label-abs yellow" style="left: 50%">Stage IIIA</span>
        <span class="label-abs green" style="left: 75%">Stage II</span>
        <span class="label-abs" style="left: 100%">Stage I</span>
      </div>
    </div>

    <!-- ── Formula tab switch ─────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar method-bar">
        <span class="group-icon">🔢</span>
        <span class="group-label-text">公式選擇</span>
        <span class="group-sub-text">切換計算方法</span>
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active': method === 'greene' }"
          @click="method = 'greene'"
        >
          <span class="tab-title">Greene 簡化公式</span>
          <span class="tab-sub">4 個變項 · 無需 BUN / Albumin</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active': method === 'levey' }"
          @click="method = 'levey'"
        >
          <span class="tab-title">Levey 原始公式</span>
          <span class="tab-sub">7 個變項 · 需 BUN + Albumin</span>
        </button>
      </div>
      <div
        class="method-note"
        :class="method === 'greene' ? 'note-greene' : 'note-levey'"
      >
        <template v-if="method === 'greene'">
          <strong>Greene 簡化 MDRD（4 變項）：</strong>
          僅需肌酸酐、年齡、性別與種族，無需 BUN 或白蛋白。適合門診快速評估。在
          GFR &gt; 60 時傾向低估，此時建議改用 CKD-EPI。
        </template>
        <template v-else>
          <strong>Levey 原始 MDRD（7 變項）：</strong>
          加入白蛋白（Alb）和血尿素氮（BUN），在低 GFR 族群（&lt;
          60）準確度優於簡化版，適合腎臟科詳細評估。
        </template>
      </div>
    </div>

    <!-- ── Shared inputs ──────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar shared-bar">
        <span class="group-icon">🩺</span>
        <span class="group-label-text">基本資料</span>
        <span class="group-sub-text">兩版公式共用</span>
        <span class="group-score-tally shared-tally">
          {{ gfr !== null ? gfr + " mL/min/1.73m²" : "—" }}
        </span>
      </div>

      <div class="group-items">
        <!-- Creatinine -->
        <div
          class="nihss-item"
          :class="{ scored: Cr !== null, 'mdrd-scored': Cr !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum mdrd-qnum">Cr</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">血清肌酸酐 Serum Creatinine</span>
              <span class="item-sub"
                >由血液生化報告取得，正常值男 0.7–1.2 mg/dL、女 0.5–1.0
                mg/dL</span
              >
            </div>
            <span class="item-score" :class="{ zero: Cr === null }">
              {{ Cr !== null ? Cr + " mg/dL" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="crVal"
              type="number"
              min="0.1"
              max="30"
              step="0.1"
              placeholder="mg/dL"
              class="mdrd-input"
            />
            <span class="input-unit">mg/dL</span>
          </div>
        </div>

        <!-- Age -->
        <div
          class="nihss-item"
          :class="{ scored: Age !== null, 'mdrd-scored': Age !== null }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum mdrd-qnum">Age</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">年齡 Age</span>
              <span class="item-sub"
                >MDRD 公式適用於 18 歲以上成人，不適用於兒童</span
              >
            </div>
            <span class="item-score" :class="{ zero: Age === null }">
              {{ Age !== null ? Age + " 歲" : "—" }}
            </span>
          </div>
          <div class="input-row">
            <input
              v-model="ageVal"
              type="number"
              min="18"
              max="100"
              step="1"
              placeholder="歲"
              class="mdrd-input"
            />
            <span class="input-unit">歲</span>
          </div>
        </div>

        <!-- Gender -->
        <div class="nihss-item mdrd-toggle-item">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum mdrd-qnum">Sex</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">性別 Gender</span>
              <span class="item-sub"
                >女性係數：Greene × 0.742，Levey × 0.762</span
              >
            </div>
            <span class="item-score">{{
              gender === "M" ? "♂ 男性" : "♀ 女性"
            }}</span>
          </div>
          <div class="toggle-row">
            <button
              class="btn-male"
              :class="{ 'active-m': gender === 'M' }"
              @click="gender = 'M'"
            >
              ♂ 男性
            </button>
            <button
              class="btn-female"
              :class="{ 'active-f': gender === 'F' }"
              @click="gender = 'F'"
            >
              ♀ 女性
            </button>
          </div>
        </div>

        <!-- African -->
        <div class="nihss-item mdrd-toggle-item">
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum mdrd-qnum">Race</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">非洲裔 African Origin</span>
              <span class="item-sub"
                >非洲裔係數：Greene × 1.212，Levey × 1.180</span
              >
            </div>
            <span class="item-score">{{ african ? "是" : "否" }}</span>
          </div>
          <div class="toggle-row">
            <button
              class="btn-race-yes"
              :class="{ 'active-race-yes': african }"
              @click="african = true"
            >
              是
            </button>
            <button
              class="btn-race-no"
              :class="{ 'active-race-no': !african }"
              @click="african = false"
            >
              否
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Levey-only inputs ──────────────────────────────────── -->
    <transition name="slide-down">
      <div v-if="method === 'levey'" class="nihss-group">
        <div class="group-header-bar levey-bar">
          <span class="group-icon">🧫</span>
          <span class="group-label-text">Levey 公式額外輸入</span>
          <span class="group-sub-text">僅 Levey 7-var 需要</span>
        </div>

        <div class="group-items">
          <!-- Albumin -->
          <div
            class="nihss-item"
            :class="{ scored: Alb !== null, 'mdrd-scored': Alb !== null }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum levey-qnum">Alb</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">白蛋白 Serum Albumin</span>
                <span class="item-sub">血清白蛋白，正常值 3.5–5.0 g/dL</span>
              </div>
              <span class="item-score" :class="{ zero: Alb === null }">
                {{ Alb !== null ? Alb + " g/dL" : "—" }}
              </span>
            </div>
            <div class="input-row">
              <input
                v-model="albVal"
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                placeholder="g/dL"
                class="mdrd-input"
              />
              <span class="input-unit">g/dL</span>
            </div>
          </div>

          <!-- BUN -->
          <div
            class="nihss-item"
            :class="{ scored: BUN !== null, 'mdrd-scored': BUN !== null }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum levey-qnum">BUN</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">血尿素氮 Blood Urea Nitrogen</span>
                <span class="item-sub"
                  >由血液生化報告取得，正常值 7–20 mg/dL</span
                >
              </div>
              <span class="item-score" :class="{ zero: BUN === null }">
                {{ BUN !== null ? BUN + " mg/dL" : "—" }}
              </span>
            </div>
            <div class="input-row">
              <input
                v-model="bunVal"
                type="number"
                min="1"
                max="200"
                step="0.1"
                placeholder="mg/dL"
                class="mdrd-input"
              />
              <span class="input-unit">mg/dL</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ── Formula display ────────────────────────────────────── -->
    <div class="formula-box">
      <span class="formula-label">公式：</span>
      <span class="formula-text">GFR = {{ formulaText }}</span>
    </div>

    <!-- ── Reference table ───────────────────────────────────── -->
    <div class="ref-table">
      <div class="rt-row rt-header">
        <span>分期</span><span>eGFR</span><span>描述</span><span>追蹤頻率</span>
      </div>
      <div
        class="rt-row"
        v-for="s in [
          {
            ckd: 'G1',
            range: '≥ 90',
            label: '正常或偏高',
            color: 'normal',
            freq: '每年',
          },
          {
            ckd: 'G2',
            range: '60–89',
            label: '輕度下降',
            color: 'normal',
            freq: '每年',
          },
          {
            ckd: 'G3a',
            range: '45–59',
            label: '輕中度下降',
            color: 'mild',
            freq: '每 6 個月',
          },
          {
            ckd: 'G3b',
            range: '30–44',
            label: '中重度下降',
            color: 'moderate',
            freq: '每 3–6 個月',
          },
          {
            ckd: 'G4',
            range: '15–29',
            label: '重度下降',
            color: 'severe',
            freq: '每 3 個月',
          },
          {
            ckd: 'G5',
            range: '< 15',
            label: '腎衰竭',
            color: 'critical',
            freq: '腎替代療法',
          },
        ]"
        :key="s.ckd"
        :class="{ 'rt-active': stage.ckd === s.ckd && gfr !== null }"
      >
        <span class="rt-s" :class="s.color + '-t'">{{ s.ckd }}</span>
        <span class="rt-range">{{ s.range }}</span>
        <span>{{ s.label }}</span>
        <span class="rt-sm">{{ s.freq }}</span>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="nihss-result" :class="stage.color">
      <div class="result-left">
        <span class="result-number">{{ gfr !== null ? gfr : "—" }}</span>
        <span class="result-max" v-if="gfr !== null">mL/min/1.73m²</span>
      </div>
      <div class="result-right">
        <span class="result-ckd">CKD {{ stage.ckd }}</span>
        <span class="result-level">{{ stage.label }}</span>
        <span class="result-advice" v-if="stage.action">{{
          stage.action
        }}</span>
      </div>
    </div>

    <!-- ── Comparison card ────────────────────────────────────── -->
    <div class="compare-card" v-if="bothAvailable">
      <div class="compare-header">兩公式結果比較</div>
      <div class="compare-row">
        <div
          class="compare-item"
          :class="{ 'compare-active': method === 'greene' }"
        >
          <span class="ci-name">Greene（4-var）</span>
          <span class="ci-val">{{ greeneGfr }}</span>
          <span class="ci-unit">mL/min/1.73m²</span>
          <span class="ci-ckd">{{ getStage(greeneGfr).ckd }}</span>
        </div>
        <div class="compare-divider">
          <span
            class="diff-val"
            :class="diff! > 0 ? 'diff-pos' : diff! < 0 ? 'diff-neg' : ''"
          >
            {{ diff! > 0 ? "+" : "" }}{{ diff }}
          </span>
          <span class="diff-label">差值</span>
        </div>
        <div
          class="compare-item"
          :class="{ 'compare-active': method === 'levey' }"
        >
          <span class="ci-name">Levey（7-var）</span>
          <span class="ci-val">{{ leveyGfr }}</span>
          <span class="ci-unit">mL/min/1.73m²</span>
          <span class="ci-ckd">{{ getStage(leveyGfr).ckd }}</span>
        </div>
      </div>
    </div>

    <!-- ── Clinical note ──────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >MDRD 公式在 GFR &gt; 60 時傾向低估，此時建議改用 CKD-EPI 公式。MDRD
        不適用於孕婦、兒童、極端體型或急性腎損傷患者。</span
      >
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="mdrd_showResults" class="results-detail">
      <div class="results-header">評估明細</div>

      <div class="detail-row">
        <span class="detail-qnum">Cr</span>
        <span class="detail-domain">血清肌酸酐（Serum Creatinine）</span>
        <span class="detail-score">{{ Cr !== null ? Cr : "—" }}</span>
        <span class="detail-desc">mg/dL</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Age</span>
        <span class="detail-domain">年齡（Age）</span>
        <span class="detail-score">{{ Age !== null ? Age : "—" }}</span>
        <span class="detail-desc">歲</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Sex</span>
        <span class="detail-domain">性別係數</span>
        <span class="detail-score">{{
          gender === "M" ? "1.000" : method === "greene" ? "0.742" : "0.762"
        }}</span>
        <span class="detail-desc">{{ gender === "M" ? "男性" : "女性" }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-qnum">Race</span>
        <span class="detail-domain">種族係數</span>
        <span class="detail-score">{{
          african ? (method === "greene" ? "1.212" : "1.180") : "1.000"
        }}</span>
        <span class="detail-desc">{{ african ? "非洲裔" : "非非洲裔" }}</span>
      </div>

      <template v-if="method === 'levey'">
        <div class="detail-row">
          <span class="detail-qnum">Alb</span>
          <span class="detail-domain">白蛋白（Serum Albumin）</span>
          <span class="detail-score">{{ Alb !== null ? Alb : "—" }}</span>
          <span class="detail-desc">g/dL</span>
        </div>

        <div class="detail-row">
          <span class="detail-qnum">BUN</span>
          <span class="detail-domain">血尿素氮（Blood Urea Nitrogen）</span>
          <span class="detail-score">{{ BUN !== null ? BUN : "—" }}</span>
          <span class="detail-desc">mg/dL</span>
        </div>
      </template>

      <div class="detail-row">
        <span class="detail-qnum">方法</span>
        <span class="detail-domain">使用公式</span>
        <span class="detail-score" style="width: 80px; font-size: 0.7rem">{{
          method === "greene" ? "Greene" : "Levey"
        }}</span>
        <span class="detail-desc">{{
          method === "greene" ? "4-var" : "7-var"
        }}</span>
      </div>

      <div class="detail-row detail-total">
        <span class="detail-qnum">eGFR</span>
        <span class="detail-domain">腎絲球過濾率（最終結果）</span>
        <span class="detail-score detail-score-brand">{{
          gfr !== null ? gfr : "—"
        }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">mL/min</span>
          <span class="detail-desc-label">CKD {{ stage.ckd }}</span>
        </div>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="nihss-actions">
      <button class="btn-view" @click="mdrd_showResults = !mdrd_showResults">
        {{ mdrd_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!mdrd_isComplete" @click="mdrd_copyOutput">
        {{ mdrd_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="mdrd_reset">重置</button>
    </div>
  </div>

  <div v-show="activeTab === 'bdc'" class="bdc">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="bdc-header">
      <div class="header-title">
        <h2 class="title">碳酸氫鈉缺乏量</h2>
        <p class="subtitle">
          Bicarbonate Deficit · 代謝性酸中毒補充計算 · Deficit = 0.5 × W × (HCO₃
          desired − HCO₃ observed)
        </p>
      </div>
      <div class="score-badge" :class="bdc_severity.color">
        <span class="score-number">{{
          deficit !== null && deficit > 0 ? deficit : "—"
        }}</span>
        <span class="score-unit" v-if="deficit !== null && deficit > 0"
          >mEq</span
        >
        <span class="score-label">{{ bdc_severity.label }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="bdc_severity.color"
          :style="{ width: bdc_barPct + '%' }"
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
    <div class="formula-box" v-if="bdc_isComplete && deficit !== null">
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
    <div class="nihss-result" :class="bdc_severity.color">
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
        <span class="result-level">{{ bdc_severity.label }}</span>
        <span class="result-advice">{{ bdc_severity.advice }}</span>
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
    <div v-if="bdc_showResults" class="results-detail">
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
          <span class="detail-desc-label">{{ bdc_severity.label }}</span>
        </div>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="nihss-actions">
      <button class="btn-view" @click="bdc_showResults = !bdc_showResults">
        {{ bdc_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!bdc_isComplete" @click="bdc_copyOutput">
        {{ bdc_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="bdc_reset">重置</button>
    </div>
  </div>

  <div v-show="activeTab === 'ddc'" class="ddc">
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
          :style="{ width: ddc_barPct + '%' }"
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
    <div class="dd-breakdown" v-if="ddc_isComplete">
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
    <div class="nihss-result" :class="ddInterp.color" v-if="ddc_isComplete">
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
    <div v-if="ddc_showResults" class="results-detail">
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
      <button class="btn-view" @click="ddc_showResults = !ddc_showResults">
        {{ ddc_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!ddc_isComplete" @click="ddc_copyOutput">
        {{ ddc_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="ddc_reset">重置</button>
    </div>
  </div>

  <div v-show="activeTab === 'fec'" class="fec" :style="{ '--t': theme.hex, '--t-rgb': theme.rgb }">
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
        :class="fec_severity.color"
        :style="{ '--t': theme.hex, '--t-rgb': theme.rgb }"
      >
        <span class="badge-label">FE{{ substLabel }}</span>
        <span class="score-number">{{ fe !== null ? fe : "—" }}</span>
        <span class="score-unit" v-if="fe !== null">%</span>
        <span class="score-label">{{ fec_severity.label }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="fec_severity.color"
          :style="{ width: fec_barPct + '%' }"
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
    <div class="formula-box" v-if="fec_isComplete && fe !== null">
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
    <div class="nihss-result" :class="fec_severity.color">
      <div class="result-left">
        <span class="result-number">{{ fe !== null ? fe : "—" }}</span>
        <span class="result-max" v-if="fe !== null">%</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ fec_severity.label }}</span>
        <span class="result-advice">{{ fec_severity.advice }}</span>
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
    <div v-if="fec_showResults" class="results-detail">
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
          <span class="detail-desc-label">{{ fec_severity.label }}</span>
        </div>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="nihss-actions">
      <button class="btn-view" @click="fec_showResults = !fec_showResults">
        {{ fec_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!fec_isComplete" @click="fec_copyOutput">
        {{ fec_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="fec_reset">重置</button>
    </div>
  </div>
  </div>
</template>

<style scoped>
.renalfn {
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

/* ══════════════ MDRD 腎絲球過濾率（Estimated GFR）══════════════ */

.mdrd {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ────────────────────────────────────────────────────── */
.mdrd .mdrd-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.mdrd .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.mdrd .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.mdrd .score-badge {
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
.mdrd .badge-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  margin-bottom: 1px;
}
.mdrd .score-number {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
}
.mdrd .score-unit {
  font-size: 0.6rem;
  font-weight: 600;
  margin-top: 1px;
}
.mdrd .score-label {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 3px;
  text-align: center;
}
.mdrd .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.mdrd .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mdrd .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mdrd .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mdrd .score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mdrd .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
/* ── Severity bar ──────────────────────────────────────────────── */
.mdrd .severity-bar-wrap {
  margin-bottom: 2rem;
}
.mdrd .severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.mdrd .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s ease,
    background 0.3s;
}
.mdrd .severity-fill.pending {
  background: var(--vp-c-divider);
}
.mdrd .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.mdrd .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.mdrd .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.mdrd .severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.mdrd .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.mdrd .severity-ticks-abs,
.mdrd .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.mdrd .severity-labels-abs {
  margin-top: 0px;
  height: 13px;
}
.mdrd .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  font-weight: 700;
}
.mdrd .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.mdrd .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.mdrd .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.mdrd .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.mdrd .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.mdrd .tick-abs.red,
.mdrd .label-abs.red {
  color: #ef4444;
}
.mdrd .tick-abs.orange,
.mdrd .label-abs.orange {
  color: #f97316;
}
.mdrd .tick-abs.yellow,
.mdrd .label-abs.yellow {
  color: #f59e0b;
}
.mdrd .tick-abs.green,
.mdrd .label-abs.green {
  color: #22c55e;
}
/* ── Groups ────────────────────────────────────────────────────── */
.mdrd .nihss-group {
  margin-bottom: 1.5rem;
}
.mdrd .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #eab308;
  margin-bottom: 0.6rem;
}
.mdrd .method-bar {
  border-left: 3px solid #6366f1;
}
.mdrd .shared-bar {
  border-left: 3px solid #3b82f6;
}
.mdrd .levey-bar {
  border-left: 3px solid #14b8a6;
}
.mdrd .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.mdrd .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.mdrd .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.mdrd .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.mdrd .shared-tally {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
/* ── Tab toggle ────────────────────────────────────────────────── */
.mdrd .tab-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
.mdrd .tab-btn {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.65rem 1rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s;
}
.mdrd .tab-btn.tab-active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.mdrd .tab-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.mdrd .tab-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.mdrd .tab-btn.tab-active .tab-title {
  color: #6366f1;
}
.mdrd .tab-btn.tab-active .tab-sub {
  color: rgba(99, 102, 241, 0.65);
}
/* ── Method note ───────────────────────────────────────────────── */
.mdrd .method-note {
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  border: 1px solid var(--vp-c-divider);
}
.mdrd .note-greene {
  background: rgba(99, 102, 241, 0.04);
  border-color: rgba(99, 102, 241, 0.2);
}
.mdrd .note-levey {
  background: rgba(20, 184, 166, 0.04);
  border-color: rgba(20, 184, 166, 0.2);
}
/* ── Group items ───────────────────────────────────────────────── */
.mdrd .group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
/* ── Item card ─────────────────────────────────────────────────── */
.mdrd .nihss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.mdrd .nihss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.mdrd .nihss-item.mdrd-scored {
  border-color: #3b82f6;
}
.mdrd .mdrd-toggle-item {
}
.mdrd .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.mdrd .mdrd-toggle-item .item-header {
  border-bottom: none;
}
.mdrd .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.mdrd .item-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.mdrd .mdrd-qnum {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.mdrd .levey-qnum {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.12);
}
.mdrd .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.mdrd .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.mdrd .item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.mdrd .item-score {
  font-size: 0.85rem;
  font-weight: 800;
  color: #3b82f6;
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.mdrd .item-score.zero {
  color: var(--vp-c-text-3);
}
/* ── Toggle rows inside items ──────────────────────────────────── */
.mdrd .toggle-row {
  display: flex;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  flex-wrap: wrap;
}
.mdrd .toggle-row button {
  padding: 5px 16px;
  border-radius: 7px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-2);
  transition: all 0.15s;
}
.mdrd .btn-male.active-m {
  border-color: #38bdf8;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.07);
}
.mdrd .btn-female.active-f {
  border-color: #f472b6;
  color: #f472b6;
  background: rgba(244, 114, 182, 0.07);
}
.mdrd .btn-race-yes.active-race-yes {
  border-color: #f97316;
  color: #f97316;
  background: rgba(249, 115, 22, 0.07);
}
.mdrd .btn-race-no.active-race-no {
  border-color: #6366f1;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.07);
}
/* ── Input row ─────────────────────────────────────────────────── */
.mdrd .input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.mdrd .mdrd-input {
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
.mdrd .mdrd-input::-webkit-outer-spin-button,
.mdrd .mdrd-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.mdrd .mdrd-input:focus {
  border-color: #3b82f6;
}
.mdrd .mdrd-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.mdrd .input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
/* ── Slide animation for Levey section ─────────────────────────── */
.mdrd .slide-down-enter-active,
.mdrd .slide-down-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.mdrd .slide-down-enter-from,
.mdrd .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
}
.mdrd .slide-down-enter-to,
.mdrd .slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 400px;
}
/* ── Formula box ───────────────────────────────────────────────── */
.mdrd .formula-box {
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
.mdrd .formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.mdrd .formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.6;
}
/* ── Reference table ───────────────────────────────────────────── */
.mdrd .ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.mdrd .rt-row {
  display: grid;
  grid-template-columns: 50px 70px 1fr 90px;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.mdrd .rt-row:last-child {
  border-bottom: none;
}
.mdrd .rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.mdrd .rt-active {
  background: var(--vp-c-brand-soft);
}
.mdrd .rt-s {
  font-weight: 800;
  font-family: monospace;
}
.mdrd .rt-range {
  font-size: 0.72rem;
  font-family: monospace;
  color: var(--vp-c-text-2);
}
.mdrd .rt-sm {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.mdrd .normal-t {
  color: #22c55e;
}
.mdrd .mild-t {
  color: #f59e0b;
}
.mdrd .moderate-t {
  color: #f97316;
}
.mdrd .severe-t {
  color: #ef4444;
}
.mdrd .critical-t {
  color: #ef4444;
}
/* ── Result card ───────────────────────────────────────────────── */
.mdrd .nihss-result {
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
.mdrd .nihss-result.pending {
  border-color: var(--vp-c-divider);
}
.mdrd .nihss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mdrd .nihss-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mdrd .nihss-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mdrd .nihss-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mdrd .nihss-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mdrd .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.mdrd .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.mdrd .nihss-result.normal .result-number {
  color: #22c55e;
}
.mdrd .nihss-result.mild .result-number {
  color: #f59e0b;
}
.mdrd .nihss-result.moderate .result-number {
  color: #f97316;
}
.mdrd .nihss-result.severe .result-number {
  color: #ef4444;
}
.mdrd .nihss-result.critical .result-number {
  color: #ef4444;
}
.mdrd .result-max {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
.mdrd .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mdrd .result-ckd {
  font-size: 1rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.mdrd .result-level {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.mdrd .result-advice {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
/* ── Comparison card ───────────────────────────────────────────── */
.mdrd .compare-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: var(--vp-c-bg-soft);
}
.mdrd .compare-header {
  padding: 0.4rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.mdrd .compare-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0.9rem;
  gap: 0.75rem;
}
.mdrd .compare-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.65rem;
  border-radius: 9px;
  border: 1.5px solid var(--vp-c-divider);
  transition: all 0.2s;
}
.mdrd .compare-item.compare-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.mdrd .ci-name {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.mdrd .ci-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.mdrd .compare-item.compare-active .ci-val {
  color: var(--vp-c-brand-1);
}
.mdrd .ci-unit {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}
.mdrd .ci-ckd {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  margin-top: 2px;
}
.mdrd .compare-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.mdrd .diff-val {
  font-size: 1rem;
  font-weight: 800;
}
.mdrd .diff-pos {
  color: #22c55e;
}
.mdrd .diff-neg {
  color: #ef4444;
}
.mdrd .diff-label {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}
/* ── Warning / clinical note ───────────────────────────────────── */
.mdrd .warn-box {
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
.mdrd .warn-icon {
  color: #f97316;
  flex-shrink: 0;
  font-size: 0.9rem;
}
/* ── Results detail ────────────────────────────────────────────── */
.mdrd .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.mdrd .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.mdrd .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.mdrd .detail-row:last-child {
  border-bottom: none;
}
.mdrd .detail-total {
  background: var(--vp-c-bg-mute);
}
.mdrd .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #3b82f6;
  flex-shrink: 0;
  width: 44px;
  padding-top: 1px;
}
.mdrd .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.mdrd .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.mdrd .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.mdrd .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
}
.mdrd .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.mdrd .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.mdrd .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
/* ── Actions ───────────────────────────────────────────────────── */
.mdrd .nihss-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.mdrd .btn-view,
.mdrd .btn-copy,
.mdrd .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.mdrd .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.mdrd .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.mdrd .btn-view:active {
  transform: translateY(0);
}
.mdrd .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.mdrd .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.mdrd .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.mdrd .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.mdrd .mdrd-header {
    flex-direction: column;
  }
.mdrd .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.mdrd .score-number {
    font-size: 1.5rem;
  }
.mdrd .nihss-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.mdrd .tab-toggle {
    flex-direction: column;
  }
.mdrd .compare-row {
    grid-template-columns: 1fr;
  }
.mdrd .compare-divider {
    flex-direction: row;
    gap: 0.5rem;
  }
.mdrd .rt-row {
    grid-template-columns: 46px 60px 1fr;
  }
.mdrd .rt-row span:last-child {
    display: none;
  }
}
/* ══════════════ 碳酸氫鈉缺乏量（Bicarbonate Deficit）══════════════ */

.bdc {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ────────────────────────────────────────────────────── */
.bdc .bdc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.bdc .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.bdc .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.bdc .score-badge {
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
.bdc .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}
.bdc .score-unit {
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 1px;
}
.bdc .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.02em;
  text-align: center;
}
.bdc .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.bdc .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.bdc .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.bdc .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.bdc .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
/* ── Severity bar ──────────────────────────────────────────────── */
.bdc .severity-bar-wrap {
  margin-bottom: 2rem;
}
.bdc .severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.bdc .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s ease,
    background 0.3s;
}
.bdc .severity-fill.pending {
  background: var(--vp-c-divider);
}
.bdc .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.bdc .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.bdc .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.bdc .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.bdc .severity-ticks-abs,
.bdc .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.bdc .severity-labels-abs {
  margin-top: 0px;
  height: 13px;
}
.bdc .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  font-weight: 700;
}
.bdc .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.bdc .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.bdc .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.bdc .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.bdc .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.bdc .tick-abs.green,
.bdc .label-abs.green {
  color: #22c55e;
}
.bdc .tick-abs.yellow,
.bdc .label-abs.yellow {
  color: #f59e0b;
}
.bdc .tick-abs.orange,
.bdc .label-abs.orange {
  color: #f97316;
}
.bdc .tick-abs.red,
.bdc .label-abs.red {
  color: #ef4444;
}
/* ── Groups ────────────────────────────────────────────────────── */
.bdc .nihss-group {
  margin-bottom: 1.75rem;
}
.bdc .group-header-bar {
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
.bdc .bdc-bar {
  border-left: 3px solid #14b8a6;
}
.bdc .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.bdc .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.bdc .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.bdc .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.bdc .bdc-tally {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.12);
}
.bdc .group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
/* ── Item card ─────────────────────────────────────────────────── */
.bdc .nihss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.bdc .nihss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.bdc .nihss-item.bdc-scored {
  border-color: #14b8a6;
}
.bdc .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.bdc .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.bdc .item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  letter-spacing: 0.04em;
}
.bdc .bdc-qnum {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.12);
}
.bdc .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.bdc .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.bdc .item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.bdc .item-score {
  font-size: 0.9rem;
  font-weight: 800;
  color: #14b8a6;
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.bdc .item-score.zero {
  color: var(--vp-c-text-3);
}
/* ── Input row ─────────────────────────────────────────────────── */
.bdc .input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.bdc .bdc-input {
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
.bdc .bdc-input::-webkit-outer-spin-button,
.bdc .bdc-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.bdc .bdc-input:focus {
  border-color: #14b8a6;
}
.bdc .bdc-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.bdc .input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
/* ── Formula box ───────────────────────────────────────────────── */
.bdc .formula-box {
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
.bdc .formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.bdc .formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.6;
}
/* ── Reference table ───────────────────────────────────────────── */
.bdc .ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.bdc .rt-row {
  display: grid;
  grid-template-columns: 110px 1fr 90px;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.bdc .rt-row:last-child {
  border-bottom: none;
}
.bdc .rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.bdc .rt-active {
  background: var(--vp-c-brand-soft);
}
.bdc .rt-s {
  font-weight: 800;
  font-family: monospace;
}
.bdc .normal-t {
  color: #22c55e;
}
.bdc .mild-t {
  color: #f59e0b;
}
.bdc .moderate-t {
  color: #f97316;
}
.bdc .critical-t {
  color: #ef4444;
}
.bdc .rt-sm {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
/* ── Result card ───────────────────────────────────────────────── */
.bdc .nihss-result {
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
.bdc .nihss-result.pending {
  border-color: var(--vp-c-divider);
}
.bdc .nihss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.bdc .nihss-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.bdc .nihss-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.bdc .nihss-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.bdc .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.bdc .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.bdc .nihss-result.normal .result-number {
  color: #22c55e;
}
.bdc .nihss-result.mild .result-number {
  color: #f59e0b;
}
.bdc .nihss-result.moderate .result-number {
  color: #f97316;
}
.bdc .nihss-result.critical .result-number {
  color: #ef4444;
}
.bdc .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.bdc .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.bdc .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.bdc .result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.bdc .result-sub {
  font-size: 0.8rem;
  color: var(--vp-c-brand-1);
}
/* ── Warning box ───────────────────────────────────────────────── */
.bdc .warn-box {
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
.bdc .warn-icon {
  color: #f97316;
  flex-shrink: 0;
  font-size: 0.9rem;
}
/* ── Results detail ────────────────────────────────────────────── */
.bdc .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.bdc .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.bdc .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.bdc .detail-row:last-child {
  border-bottom: none;
}
.bdc .detail-total {
  background: var(--vp-c-bg-mute);
}
.bdc .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #14b8a6;
  flex-shrink: 0;
  width: 36px;
  padding-top: 1px;
}
.bdc .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
/* Flat NIHSS-style right columns: score (right-aligned) | desc (left-aligned) */
.bdc .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.bdc .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.bdc .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px; /* wide enough for "mmol/L" and "mEq / 3–4h" */
  text-align: left;
  white-space: normal;
}
/* Last ∑ row: unit on first line,
.bdc severity label on second line */
.bdc .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.bdc .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.bdc .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: nowrap;
}
/* ── Actions ───────────────────────────────────────────────────── */
.bdc .nihss-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.bdc .btn-view,
.bdc .btn-copy,
.bdc .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.bdc .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.bdc .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.bdc .btn-view:active {
  transform: translateY(0);
}
.bdc .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.bdc .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.bdc .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.bdc .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.bdc .bdc-header {
    flex-direction: column;
  }
.bdc .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.bdc .score-number {
    font-size: 1.5rem;
  }
.bdc .nihss-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.bdc .rt-row {
    grid-template-columns: 80px 1fr;
  }
.bdc .rt-row span:last-child {
    display: none;
  }
}
/* ══════════════ Delta/Delta 比值（Mixed Acid-Base）══════════════ */

.ddc {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ────────────────────────────────────────────────────── */
.ddc .ddc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.ddc .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.ddc .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
/* Two badges side by side */
.ddc .score-badges {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.ddc .score-badge {
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
.ddc .badge-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  margin-bottom: 1px;
}
.ddc .score-number {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
}
.ddc .score-unit {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 1px;
}
.ddc .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.ddc .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ddc .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ddc .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ddc .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
/* ── Severity bar ──────────────────────────────────────────────── */
.ddc .severity-bar-wrap {
  margin-bottom: 2rem;
}
.ddc .severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.ddc .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s ease,
    background 0.3s;
}
.ddc .severity-fill.pending {
  background: var(--vp-c-divider);
}
.ddc .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.ddc .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.ddc .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.ddc .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.ddc .severity-ticks-abs,
.ddc .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.ddc .severity-labels-abs {
  margin-top: 0px;
  height: 13px;
}
.ddc .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  font-weight: 700;
}
.ddc .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.ddc .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.ddc .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.ddc .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.ddc .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.ddc .tick-abs.green,
.ddc .label-abs.green {
  color: #22c55e;
}
.ddc .tick-abs.orange,
.ddc .label-abs.orange {
  color: #f97316;
}
.ddc .tick-abs.red,
.ddc .label-abs.red {
  color: #ef4444;
}
/* ── Groups ────────────────────────────────────────────────────── */
.ddc .nihss-group {
  margin-bottom: 1.75rem;
}
.ddc .group-header-bar {
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
.ddc .ddc-bar {
  border-left: 3px solid #8b5cf6;
}
.ddc .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.ddc .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.ddc .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.ddc .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.ddc .ddc-tally {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.ddc .group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
/* ── Item card ─────────────────────────────────────────────────── */
.ddc .nihss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.ddc .nihss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.ddc .nihss-item.ddc-scored {
  border-color: #8b5cf6;
}
.ddc .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.ddc .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.ddc .item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  letter-spacing: 0.04em;
}
.ddc .ddc-qnum {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.ddc .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.ddc .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.ddc .item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.ddc .item-score {
  font-size: 0.9rem;
  font-weight: 800;
  color: #8b5cf6;
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.ddc .item-score.zero {
  color: var(--vp-c-text-3);
}
/* ── Input row ─────────────────────────────────────────────────── */
.ddc .input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.ddc .ddc-input {
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
.ddc .ddc-input::-webkit-outer-spin-button,
.ddc .ddc-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.ddc .ddc-input:focus {
  border-color: #8b5cf6;
}
.ddc .ddc-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.ddc .input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
/* ── Calculation breakdown ─────────────────────────────────────── */
.ddc .dd-breakdown {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.ddc .ddb-row {
  display: grid;
  grid-template-columns: 1.4fr 1.2fr 80px;
  gap: 0.5rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.ddc .ddb-row:last-child {
  border-bottom: none;
}
.ddc .ddb-total {
  background: var(--vp-c-bg-mute);
  font-weight: 700;
}
.ddc .ddb-label {
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.ddc .ddb-formula {
  font-family: monospace;
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
}
.ddc .ddb-result {
  font-weight: 800;
  text-align: right;
}
.ddc .normal-t {
  color: #22c55e;
}
.ddc .mild-t {
  color: #f59e0b;
}
.ddc .moderate-t {
  color: #f97316;
}
.ddc .critical-t {
  color: #ef4444;
}
.ddc .brand-t {
  color: var(--vp-c-brand-1);
}
/* ── Formula box ───────────────────────────────────────────────── */
.ddc .formula-box {
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
.ddc .formula-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  flex-shrink: 0;
}
.ddc .formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
}
/* ── Reference table ───────────────────────────────────────────── */
.ddc .ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.ddc .rt-row {
  display: grid;
  grid-template-columns: 80px 1fr 90px;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.ddc .rt-row:last-child {
  border-bottom: none;
}
.ddc .rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.ddc .rt-active {
  background: var(--vp-c-brand-soft);
}
.ddc .rt-s {
  font-weight: 800;
  font-family: monospace;
}
.ddc .rt-sm {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
/* ── Result card ───────────────────────────────────────────────── */
.ddc .nihss-result {
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
.ddc .nihss-result.pending {
  border-color: var(--vp-c-divider);
}
.ddc .nihss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ddc .nihss-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ddc .nihss-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ddc .nihss-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ddc .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.ddc .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.ddc .nihss-result.normal .result-number {
  color: #22c55e;
}
.ddc .nihss-result.mild .result-number {
  color: #f59e0b;
}
.ddc .nihss-result.moderate .result-number {
  color: #f97316;
}
.ddc .nihss-result.critical .result-number {
  color: #ef4444;
}
.ddc .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.ddc .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.ddc .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.ddc .result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.ddc .result-sub {
  font-size: 0.78rem;
  color: var(--vp-c-brand-1);
  font-style: italic;
}
/* ── MUDPILES table ────────────────────────────────────────────── */
.ddc .mudpiles-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.ddc .mud-header {
  padding: 0.4rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.ddc .mud-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.ddc .mud-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}
.ddc .mud-item:nth-last-child(-n + 2) {
  border-bottom: none;
}
.ddc .mud-letter {
  font-size: 1rem;
  font-weight: 900;
  color: #8b5cf6;
  width: 18px;
  flex-shrink: 0;
}
/* ── Results detail ────────────────────────────────────────────── */
.ddc .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.ddc .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.ddc .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.ddc .detail-row:last-child {
  border-bottom: none;
}
.ddc .detail-total {
  background: var(--vp-c-bg-mute);
}
.ddc .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #8b5cf6;
  flex-shrink: 0;
  width: 44px; /* slightly wider for HCO₃/ΔHCO₃ labels */
  padding-top: 1px;
}
.ddc .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
/* score: right-aligned fixed width */
.ddc .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.ddc .detail-score-brand {
  color: var(--vp-c-brand-1);
}
/* desc: left-aligned,
.ddc same width as detail-desc-block */
.ddc .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
}
/* Last Δ/Δ row: unit on first line,
.ddc interpretation label on second line */
.ddc .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.ddc .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.ddc .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
/* ── Actions ───────────────────────────────────────────────────── */
.ddc .nihss-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.ddc .btn-view,
.ddc .btn-copy,
.ddc .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.ddc .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.ddc .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.ddc .btn-view:active {
  transform: translateY(0);
}
.ddc .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.ddc .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.ddc .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.ddc .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.ddc .ddc-header {
    flex-direction: column;
  }
.ddc .score-badges {
    flex-direction: row;
  }
.ddc .score-number {
    font-size: 1.4rem;
  }
.ddc .nihss-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.ddc .rt-row {
    grid-template-columns: 70px 1fr;
  }
.ddc .rt-row span:last-child {
    display: none;
  }
.ddc .mud-grid {
    grid-template-columns: 1fr;
  }
.ddc .mud-item:last-child {
    border-bottom: none;
  }
.ddc .ddb-row {
    grid-template-columns: 1fr 70px;
  }
.ddc .ddb-formula {
    display: none;
  }
}
/* ══════════════ 分餾排泄率（Fractional Excretion）══════════════ */

.fec {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
  --t: #0ea5e9;
  --t-rgb: 14, 165, 233;
}
/* ── Header ────────────────────────────────────────────────────── */
.fec .fec-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.fec .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.fec .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.fec .score-badge {
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
.fec .badge-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  margin-bottom: 1px;
}
.fec .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}
.fec .score-unit {
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 1px;
}
.fec .score-label {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.02em;
  text-align: center;
}
.fec .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.fec .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fec .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fec .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fec .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
/* ── Severity bar ──────────────────────────────────────────────── */
.fec .severity-bar-wrap {
  margin-bottom: 2rem;
}
.fec .severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.fec .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s ease,
    background 0.3s;
}
.fec .severity-fill.pending {
  background: var(--vp-c-divider);
}
.fec .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.fec .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.fec .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.fec .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.fec .severity-ticks-abs,
.fec .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.fec .severity-labels-abs {
  margin-top: 0px;
  height: 13px;
}
.fec .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  font-weight: 700;
}
.fec .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.fec .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.fec .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.fec .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.fec .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.fec .tick-abs.green,
.fec .label-abs.green {
  color: #22c55e;
}
.fec .tick-abs.yellow,
.fec .label-abs.yellow {
  color: #f59e0b;
}
.fec .tick-abs.red,
.fec .label-abs.red {
  color: #ef4444;
}
/* ── Groups ────────────────────────────────────────────────────── */
.fec .nihss-group {
  margin-bottom: 1.25rem;
}
.fec .group-header-bar {
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
.fec .fec-subst-bar {
  border-left: 3px solid var(--t);
}
.fec .fec-bar {
  border-left: 3px solid var(--t);
}
.fec .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.fec .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.fec .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.fec .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.fec .fec-tally {
  color: var(--t);
  background: rgba(var(--t-rgb), 0.12);
}
/* ── Substance toggle ──────────────────────────────────────────── */
.fec .subst-toggle {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  padding: 0 0.1rem;
  margin-bottom: 0.5rem;
}
.fec .subst-toggle button {
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
.fec .subst-toggle button.active {
  border-color: var(--t);
  color: var(--t);
  background: rgba(var(--t-rgb), 0.08);
}
.fec .subst-toggle button:hover:not(.active) {
  border-color: var(--vp-c-text-3);
  color: var(--vp-c-text-1);
}
.fec .group-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
/* ── Item card ─────────────────────────────────────────────────── */
.fec .nihss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.fec .nihss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.fec .nihss-item.fec-scored {
  border-color: var(--t);
}
.fec .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.fec .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.fec .item-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.fec .fec-qnum {
  color: var(--t);
  background: rgba(var(--t-rgb), 0.12);
}
.fec .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.fec .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.fec .item-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.fec .item-score {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--t);
  min-width: 28px;
  text-align: right;
  white-space: nowrap;
}
.fec .item-score.zero {
  color: var(--vp-c-text-3);
}
/* ── Input row ─────────────────────────────────────────────────── */
.fec .input-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.9rem;
}
.fec .fec-input {
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
.fec .fec-input::-webkit-outer-spin-button,
.fec .fec-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.fec .fec-input:focus {
  border-color: var(--t);
}
.fec .fec-input::placeholder {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.fec .input-unit {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
/* ── Formula box ───────────────────────────────────────────────── */
.fec .formula-box {
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
.fec .formula-label {
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.fec .formula-text {
  color: var(--vp-c-text-2);
  font-family: monospace;
  line-height: 1.6;
}
/* ── Reference table ───────────────────────────────────────────── */
.fec .ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.fec .rt-row {
  display: grid;
  grid-template-columns: 80px 1fr 130px;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.fec .rt-row:last-child {
  border-bottom: none;
}
.fec .rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.fec .rt-active {
  background: var(--vp-c-brand-soft);
}
.fec .rt-s {
  font-weight: 800;
  font-family: monospace;
}
.fec .normal-t {
  color: #22c55e;
}
.fec .mild-t {
  color: #f59e0b;
}
.fec .critical-t {
  color: #ef4444;
}
.fec .rt-sm {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
/* ── Result card ───────────────────────────────────────────────── */
.fec .nihss-result {
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
.fec .nihss-result.pending {
  border-color: var(--vp-c-divider);
}
.fec .nihss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fec .nihss-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fec .nihss-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fec .nihss-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fec .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.fec .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.fec .nihss-result.normal .result-number {
  color: #22c55e;
}
.fec .nihss-result.mild .result-number {
  color: #f59e0b;
}
.fec .nihss-result.moderate .result-number {
  color: #f97316;
}
.fec .nihss-result.critical .result-number {
  color: #ef4444;
}
.fec .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.fec .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.fec .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.fec .result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
/* ── Warning / clinical note ───────────────────────────────────── */
.fec .warn-box {
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
.fec .warn-icon {
  color: #f97316;
  flex-shrink: 0;
  font-size: 0.9rem;
}
/* ── Results detail ────────────────────────────────────────────── */
.fec .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.fec .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.fec .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.fec .detail-row:last-child {
  border-bottom: none;
}
.fec .detail-total {
  background: var(--vp-c-bg-mute);
}
.fec .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--t);
  flex-shrink: 0;
  width: 44px;
  padding-top: 1px;
}
.fec .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.fec .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.fec .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.fec .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
}
/* Last FE% row: unit line 1,
.fec severity label line 2 */
.fec .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.fec .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.fec .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
/* ── Actions ───────────────────────────────────────────────────── */
.fec .nihss-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.fec .btn-view,
.fec .btn-copy,
.fec .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.fec .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.fec .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.fec .btn-view:active {
  transform: translateY(0);
}
.fec .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.fec .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.fec .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.fec .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.fec .fec-header {
    flex-direction: column;
  }
.fec .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.fec .score-number {
    font-size: 1.5rem;
  }
.fec .nihss-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.fec .rt-row {
    grid-template-columns: 70px 1fr;
  }
.fec .rt-row span:last-child {
    display: none;
  }
}
</style>
