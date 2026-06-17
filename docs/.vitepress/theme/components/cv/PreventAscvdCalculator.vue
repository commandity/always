<script setup lang="ts">
import { ref, computed } from "vue";

// ── PREVENT-ASCVD Equations (Base Model) ──────────────────────
// Khan SS, Matsushita K, Sang Y, et al. Circulation 2024;149:30–449.
// Updated 2026 ACC/AHA Dyslipidemia Guideline endorses PREVENT-ASCVD
// for 10-y risk estimation in adults aged 30–79 without ASCVD.
//
// Predictors: age, sex, TC, HDL-C, SBP, eGFR, smoking, diabetes,
//            antihypertensive use, statin use
// Non-HDL-C = TC - HDL-C

const units = ref<"us" | "si">("us");

const inputs = ref({
  age: 55,
  sex: "female" as "female" | "male",
  tc: 180,
  hdl: 50,
  sbp: 125,
  egfr: 90,
  bmi: 27,
  smoking: false,
  diabetes: false,
  antihtn: false,
  statin: false,
});

const model = ref<"ascvd" | "cvd" | "hf">("ascvd");

// ── Shared variable transforms ──────────────────────────
function xform(i: typeof inputs.value) {
  const nhdl = i.tc - i.hdl;
  return {
    nhdl_mmol: nhdl * 0.02586 - 3.5,
    hdl_mmol: (i.hdl * 0.02586 - 1.3) / 0.3,
    age_c: (i.age - 55) / 10,
    sbp_lo: Math.min(i.sbp, 110),
    sbp_hi: Math.max(i.sbp, 110),
    gfr_lo: Math.min(i.egfr, 60),
    gfr_hi: Math.max(i.egfr, 60),
    bmi_lo: Math.min(i.bmi, 30),
    bmi_hi: Math.max(i.bmi, 30),
    smk: i.smoking ? 1 : 0,
    dm: i.diabetes ? 1 : 0,
    aht: i.antihtn ? 1 : 0,
    stat: i.statin ? 1 : 0,
  };
}

function risk(lp: number) {
  return Math.round((Math.exp(lp) / (1 + Math.exp(lp))) * 10000) / 100;
}

// ── Linear predictors ──────────────────────────────────
function lpAscvd(m: "female" | "male") {
  const i = inputs.value;
  const x = xform(i);
  if (m === "female") {
    return (
      0.719883 * x.age_c +
      0.1176967 * x.nhdl_mmol +
      -0.151185 * x.hdl_mmol +
      -0.0835358 * ((x.sbp_lo - 110) / 20) +
      0.3592852 * ((x.sbp_hi - 130) / 20) +
      0.8348585 * x.dm +
      0.4831078 * x.smk +
      0.4864619 * ((x.gfr_lo - 60) / -15) +
      0.0397779 * ((x.gfr_hi - 90) / -15) +
      0.2265309 * x.aht +
      -0.0592374 * x.stat +
      -0.0395762 * ((x.sbp_hi - 130) / 20) * x.aht +
      0.0844423 * x.nhdl_mmol * x.stat +
      -0.0567839 * x.age_c * x.nhdl_mmol +
      0.0325692 * x.age_c * x.hdl_mmol +
      -0.1035985 * x.age_c * ((x.sbp_hi - 130) / 20) +
      -0.2417542 * x.age_c * x.dm +
      -0.0791142 * x.age_c * x.smk +
      -0.1671492 * x.age_c * ((x.gfr_lo - 60) / -15) +
      -3.819975
    );
  }
  return (
    0.7099847 * x.age_c +
    0.1658663 * x.nhdl_mmol +
    -0.1144285 * x.hdl_mmol +
    -0.2837212 * ((x.sbp_lo - 110) / 20) +
    0.3239977 * ((x.sbp_hi - 130) / 20) +
    0.7189597 * x.dm +
    0.3956973 * x.smk +
    0.3690075 * ((x.gfr_lo - 60) / -15) +
    0.0203619 * ((x.gfr_hi - 90) / -15) +
    0.2036522 * x.aht +
    -0.0865581 * x.stat +
    -0.0322916 * ((x.sbp_hi - 130) / 20) * x.aht +
    0.114563 * x.nhdl_mmol * x.stat +
    -0.0300005 * x.age_c * x.nhdl_mmol +
    0.0232747 * x.age_c * x.hdl_mmol +
    -0.0927024 * x.age_c * ((x.sbp_hi - 130) / 20) +
    -0.2018525 * x.age_c * x.dm +
    -0.0970527 * x.age_c * x.smk +
    -0.1217081 * x.age_c * ((x.gfr_lo - 60) / -15) +
    -3.500655
  );
}

function lpCvd(m: "female" | "male") {
  const i = inputs.value;
  const x = xform(i);
  if (m === "female") {
    return (
      0.7939329 * x.age_c +
      0.0305239 * x.nhdl_mmol +
      -0.1606857 * x.hdl_mmol +
      -0.2394003 * ((x.sbp_lo - 110) / 20) +
      0.3600781 * ((x.sbp_hi - 130) / 20) +
      0.8667604 * x.dm +
      0.5360739 * x.smk +
      0.6045917 * ((x.gfr_lo - 60) / -15) +
      0.0433769 * ((x.gfr_hi - 90) / -15) +
      0.3151672 * x.aht +
      -0.1477655 * x.stat +
      -0.0663612 * ((x.sbp_hi - 130) / 20) * x.aht +
      0.1197879 * x.nhdl_mmol * x.stat +
      -0.0819715 * x.age_c * x.nhdl_mmol +
      0.0306769 * x.age_c * x.hdl_mmol +
      -0.0946348 * x.age_c * ((x.sbp_hi - 130) / 20) +
      -0.27057 * x.age_c * x.dm +
      -0.078715 * x.age_c * x.smk +
      -0.1637806 * x.age_c * ((x.gfr_lo - 60) / -15) +
      -3.307728
    );
  }
  return (
    0.7688528 * x.age_c +
    0.0736174 * x.nhdl_mmol +
    -0.0954431 * x.hdl_mmol +
    -0.4347345 * ((x.sbp_lo - 110) / 20) +
    0.3362658 * ((x.sbp_hi - 130) / 20) +
    0.7692857 * x.dm +
    0.4386871 * x.smk +
    0.5378979 * ((x.gfr_lo - 60) / -15) +
    0.0164827 * ((x.gfr_hi - 90) / -15) +
    0.288879 * x.aht +
    -0.1337349 * x.stat +
    -0.0475924 * ((x.sbp_hi - 130) / 20) * x.aht +
    0.150273 * x.nhdl_mmol * x.stat +
    -0.0517874 * x.age_c * x.nhdl_mmol +
    0.0191169 * x.age_c * x.hdl_mmol +
    -0.1049477 * x.age_c * ((x.sbp_hi - 130) / 20) +
    -0.2251948 * x.age_c * x.dm +
    -0.0895067 * x.age_c * x.smk +
    -0.1543702 * x.age_c * ((x.gfr_lo - 60) / -15) +
    -3.031168
  );
}

function lpHf(m: "female" | "male") {
  const i = inputs.value;
  const x = xform(i);
  if (m === "female") {
    return (
      0.8998235 * x.age_c +
      -0.4559771 * ((x.sbp_lo - 110) / 20) +
      0.3576505 * ((x.sbp_hi - 130) / 20) +
      1.038346 * x.dm +
      0.583916 * x.smk +
      -0.0072294 * ((x.bmi_lo - 25) / 5) +
      0.2997706 * ((x.bmi_hi - 30) / 5) +
      0.7451638 * ((x.gfr_lo - 60) / -15) +
      0.0557087 * ((x.gfr_hi - 90) / -15) +
      0.3534442 * x.aht +
      -0.0981511 * ((x.sbp_hi - 130) / 20) * x.aht +
      -0.0946663 * x.age_c * ((x.sbp_hi - 130) / 20) +
      -0.3581041 * x.age_c * x.dm +
      -0.1159453 * x.age_c * x.smk +
      -0.003878 * x.age_c * ((x.bmi_hi - 30) / 5) +
      -0.1884289 * x.age_c * ((x.gfr_lo - 60) / -15) +
      -4.310409
    );
  }
  return (
    0.8972642 * x.age_c +
    -0.6811466 * ((x.sbp_lo - 110) / 20) +
    0.3634461 * ((x.sbp_hi - 130) / 20) +
    0.923776 * x.dm +
    0.5023736 * x.smk +
    -0.0485841 * ((x.bmi_lo - 25) / 5) +
    0.3726929 * ((x.bmi_hi - 30) / 5) +
    0.6926917 * ((x.gfr_lo - 60) / -15) +
    0.0251827 * ((x.gfr_hi - 90) / -15) +
    0.2980922 * x.aht +
    -0.0497731 * ((x.sbp_hi - 130) / 20) * x.aht +
    -0.1289201 * x.age_c * ((x.sbp_hi - 130) / 20) +
    -0.3040924 * x.age_c * x.dm +
    -0.1401688 * x.age_c * x.smk +
    0.0068126 * x.age_c * ((x.bmi_hi - 30) / 5) +
    -0.1797778 * x.age_c * ((x.gfr_lo - 60) / -15) +
    -3.946391
  );
}

const ascvdRisk = computed(() => risk(lpAscvd(inputs.value.sex)));
const cvdRisk = computed(() => risk(lpCvd(inputs.value.sex)));
const hfRisk = computed(() => risk(lpHf(inputs.value.sex)));

const activeRisk = computed(() => {
  if (model.value === "cvd") return cvdRisk.value;
  if (model.value === "hf") return hfRisk.value;
  return ascvdRisk.value;
});

const activeLabel = computed(() => {
  if (model.value === "cvd") return "10y CVD";
  if (model.value === "hf") return "10y HF";
  return "10y ASCVD";
});

// 2026 ACC/AHA Guideline risk categories for ASCVD
const category = computed(() => {
  const r = activeRisk.value;
  if (r < 3) return { label: "低風險", key: "low", en: "Low Risk" };
  if (r < 5)
    return { label: "邊界風險", key: "borderline", en: "Borderline Risk" };
  if (r < 10)
    return { label: "中度風險", key: "intermediate", en: "Intermediate Risk" };
  return { label: "高度風險", key: "high", en: "High Risk" };
});

const ascvdCat = computed(() => {
  const r = ascvdRisk.value;
  if (r < 3) return { label: "低風險", key: "low", en: "Low Risk" };
  if (r < 5)
    return { label: "邊界風險", key: "borderline", en: "Borderline Risk" };
  if (r < 10)
    return { label: "中度風險", key: "intermediate", en: "Intermediate Risk" };
  return { label: "高度風險", key: "high", en: "High Risk" };
});

const management = computed(() => {
  const c = ascvdCat.value.key;
  if (c === "low")
    return {
      advice: "健康行為諮詢",
      tag: "生活方式為主",
      detail:
        "若 LDL-C 160–189 mg/dL 或 30 年風險 ≥10%（30–59 歲），可考慮中等強度史達汀治療。",
    };
  if (c === "borderline")
    return {
      advice: "個別化評估，考慮藥物治療",
      tag: "考慮用藥",
      detail:
        "進行醫病共享決策，考慮風險增強因子。若啟動治療，目標 LDL-C <100 mg/dL、non-HDL-C <130 mg/dL。",
    };
  if (c === "intermediate")
    return {
      advice: "建議中高強度史達汀",
      tag: "建議用藥",
      detail:
        "至少中等強度史達汀，目標 LDL-C 降 ≥30–49%。高值區間可考慮高強度治療。目標 LDL-C <100 mg/dL。",
    };
  return {
    advice: "建議高強度史達汀治療",
    tag: "積極治療",
    detail:
      "高強度史達汀，目標 LDL-C 降 ≥50%。目標 LDL-C <70 mg/dL、non-HDL-C <100 mg/dL。可考慮合併 ezetimibe。",
  };
});

const cprSteps = computed(() => [
  {
    letter: "C",
    label: "Calculate",
    detail: `10-y ASCVD = ${ascvdRisk.value}% · CVD = ${cvdRisk.value}% · HF = ${hfRisk.value}%`,
  },
  {
    letter: "P",
    label: "Personalize",
    detail: "考慮風險增強因子：Lp(a)、hsCRP、生殖風險標誌、CAC",
  },
  { letter: "R", label: "Reclassify", detail: "必要時使用 CAC 積分重新分層" },
]);

const detailRows = computed(() => {
  const i = inputs.value;
  const nhdl = i.tc - i.hdl;
  return [
    { label: "年齡", value: `${i.age} 歲`, flag: false },
    { label: "性別", value: i.sex === "female" ? "女性" : "男性", flag: false },
    { label: "TC", value: `${i.tc} mg/dL`, flag: false },
    { label: "HDL-C", value: `${i.hdl} mg/dL`, flag: false },
    { label: "Non-HDL-C", value: `${nhdl} mg/dL`, flag: nhdl >= 160 },
    { label: "SBP", value: `${i.sbp} mmHg`, flag: i.sbp >= 130 },
    { label: "eGFR", value: `${i.egfr} mL/min/1.73m²`, flag: i.egfr < 60 },
    { label: "BMI", value: `${i.bmi} kg/m²`, flag: i.bmi >= 30 },
    { label: "吸菸", value: i.smoking ? "是" : "否", flag: i.smoking },
    { label: "糖尿病", value: i.diabetes ? "是" : "否", flag: i.diabetes },
    { label: "降壓藥", value: i.antihtn ? "是" : "否", flag: i.antihtn },
    { label: "史達汀", value: i.statin ? "是" : "否", flag: i.statin },
  ];
});

const severityColor = computed(() => {
  const c = ascvdCat.value.key;
  if (c === "low") return "normal";
  if (c === "borderline") return "mild";
  if (c === "intermediate") return "moderate";
  return "severe";
});

const showResults = ref(false);
const copied = ref(false);

function reset() {
  inputs.value = {
    age: 55,
    sex: "female",
    tc: 180,
    hdl: 50,
    sbp: 125,
    egfr: 90,
    bmi: 27,
    smoking: false,
    diabetes: false,
    antihtn: false,
    statin: false,
  };
  model.value = "ascvd";
}

function generateMarkdown() {
  const d = new Date();
  const date = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  const i = inputs.value;
  const mgmt = management.value;

  return `# PREVENT 10 年心血管疾病風險評估結果

## 評估日期：${date}

## 患者資料
- **年齡**：${i.age} 歲
- **性別**：${i.sex === "female" ? "女性" : "男性"}
- **總膽固醇（TC）**：${i.tc} mg/dL
- **HDL 膽固醇**：${i.hdl} mg/dL
- **收縮壓（SBP）**：${i.sbp} mmHg
- **eGFR**：${i.egfr} mL/min/1.73m²
- **BMI**：${i.bmi} kg/m²
- **吸菸**：${i.smoking ? "有" : "無"}
- **糖尿病**：${i.diabetes ? "有" : "無"}
- **服用降壓藥**：${i.antihtn ? "有" : "無"}
- **服用史達汀**：${i.statin ? "有" : "無"}

---
- **10 年 ASCVD 風險**：${ascvdRisk.value}%
- **10 年 Total CVD 風險**：${cvdRisk.value}%
- **10 年心衰竭（HF）風險**：${hfRisk.value}%
- **ASCVD 風險類別**：${ascvdCat.value.label}（${ascvdCat.value.en}）
- **治療建議**：${mgmt.advice}

> 依據 2026 ACC/AHA 血脂管理指引及 PREVENT 方程式（AHA 2024）`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <div class="prevent">
    <!-- Header -->
    <div class="prevent-header">
      <div class="header-title">
        <h2 class="title">PREVENT 心血管風險評估</h2>
        <p class="subtitle">
          Predicting Risk of cardiovascular disease EVENTs · ASCVD · CVD · HF 10
          年風險預測（AHA 2024 / ACC 2026）
        </p>
        <!-- Model tabs -->
        <div class="model-tabs">
          <button
            class="model-tab"
            :class="{ active: model === 'ascvd' }"
            @click="model = 'ascvd'"
          >
            ASCVD
          </button>
          <button
            class="model-tab"
            :class="{ active: model === 'cvd' }"
            @click="model = 'cvd'"
          >
            Total CVD
          </button>
          <button
            class="model-tab"
            :class="{ active: model === 'hf' }"
            @click="model = 'hf'"
          >
            HF
          </button>
        </div>
      </div>
      <div class="score-badge" :class="severityColor">
        <span class="score-number">{{ activeRisk }}%</span>
        <span class="score-label">{{ activeLabel }}</span>
      </div>
    </div>

    <!-- Severity bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severityColor"
          :style="{ width: Math.min((activeRisk / 30) * 100, 100) + '%' }"
        />
      </div>
      <div class="severity-ticks">
        <span>0%</span>
        <span class="tick-threshold">3%</span>
        <span>5%</span>
        <span>10%</span>
        <span>20%</span>
        <span>≥30%</span>
      </div>
    </div>

    <!-- Risk strip → 2026 ACC/AHA categories -->
    <div class="risk-strip">
      <div class="risk-pill" :class="{ 'risk-active': ascvdCat.key === 'low' }">
        <span class="risk-score">&lt;3%</span>
        <span class="risk-rate normal-risk">低風險</span>
        <span class="risk-tag">生活方式諮詢</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': ascvdCat.key === 'borderline' }"
      >
        <span class="risk-score">3–&lt;5%</span>
        <span class="risk-rate mild-risk">邊界風險</span>
        <span class="risk-tag">考慮用藥</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': ascvdCat.key === 'intermediate' }"
      >
        <span class="risk-score">5–&lt;10%</span>
        <span class="risk-rate moderate-risk">中度風險</span>
        <span class="risk-tag">建議用藥</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': ascvdCat.key === 'high' }"
      >
        <span class="risk-score">≥10%</span>
        <span class="risk-rate severe-risk">高度風險</span>
        <span class="risk-tag">積極治療</span>
      </div>
    </div>

    <!-- CPR Model -->
    <div class="intro-bar">
      <span class="intro-dot">CPR</span>
      <div class="cpr-list">
        <span v-for="(s, idx) in cprSteps" :key="idx" class="cpr-item">
          <strong>{{ s.letter }}</strong
          >：{{ s.detail }}
        </span>
      </div>
    </div>

    <!-- Input fields group -->
    <div class="prevent-group">
      <div class="group-header-bar">
        <span class="group-icon">📊</span>
        <span class="group-label-text">臨床變數輸入</span>
        <span class="group-sub-text">於範圍內填寫數值</span>
        <span class="group-score-tally" :class="severityColor">
          {{ activeRisk }}%
        </span>
      </div>

      <div class="field-list">
        <!-- Age -->
        <div class="field-card">
          <div class="field-label">
            <span class="field-name">年齡</span>
            <span class="field-unit">歲</span>
          </div>
          <div class="field-input-wrap">
            <input
              v-model.number="inputs.age"
              type="range"
              min="30"
              max="79"
              step="1"
              class="field-slider"
            />
            <input
              v-model.number="inputs.age"
              type="number"
              min="30"
              max="79"
              class="field-number"
            />
          </div>
          <div class="field-range">30–79 歲</div>
        </div>

        <!-- Sex -->
        <div class="field-card">
          <div class="field-label">
            <span class="field-name">性別</span>
            <span class="field-unit">出生性別</span>
          </div>
          <div class="field-btn-group">
            <button
              class="field-btn"
              :class="{ active: inputs.sex === 'female' }"
              @click="inputs.sex = 'female'"
            >
              女性
            </button>
            <button
              class="field-btn"
              :class="{ active: inputs.sex === 'male' }"
              @click="inputs.sex = 'male'"
            >
              男性
            </button>
          </div>
        </div>

        <!-- TC -->
        <div class="field-card">
          <div class="field-label">
            <span class="field-name">總膽固醇 TC</span>
            <span class="field-unit">mg/dL</span>
          </div>
          <div class="field-input-wrap">
            <input
              v-model.number="inputs.tc"
              type="range"
              min="130"
              max="320"
              step="1"
              class="field-slider"
            />
            <input
              v-model.number="inputs.tc"
              type="number"
              min="130"
              max="320"
              class="field-number"
            />
          </div>
          <div class="field-range">130–320 mg/dL</div>
        </div>

        <!-- HDL -->
        <div class="field-card">
          <div class="field-label">
            <span class="field-name">HDL 膽固醇</span>
            <span class="field-unit">mg/dL</span>
          </div>
          <div class="field-input-wrap">
            <input
              v-model.number="inputs.hdl"
              type="range"
              min="20"
              max="100"
              step="1"
              class="field-slider"
            />
            <input
              v-model.number="inputs.hdl"
              type="number"
              min="20"
              max="100"
              class="field-number"
            />
          </div>
          <div class="field-range">20–100 mg/dL</div>
        </div>

        <!-- SBP -->
        <div class="field-card">
          <div class="field-label">
            <span class="field-name">收縮壓 SBP</span>
            <span class="field-unit">mmHg</span>
          </div>
          <div class="field-input-wrap">
            <input
              v-model.number="inputs.sbp"
              type="range"
              min="90"
              max="200"
              step="1"
              class="field-slider"
            />
            <input
              v-model.number="inputs.sbp"
              type="number"
              min="90"
              max="200"
              class="field-number"
            />
          </div>
          <div class="field-range">90–200 mmHg</div>
        </div>

        <!-- eGFR -->
        <div class="field-card">
          <div class="field-label">
            <span class="field-name">eGFR</span>
            <span class="field-unit">mL/min/1.73m²</span>
          </div>
          <div class="field-input-wrap">
            <input
              v-model.number="inputs.egfr"
              type="range"
              min="15"
              max="150"
              step="1"
              class="field-slider"
            />
            <input
              v-model.number="inputs.egfr"
              type="number"
              min="15"
              max="150"
              class="field-number"
            />
          </div>
          <div class="field-range">15–150 mL/min/1.73m²</div>
        </div>

        <!-- BMI -->
        <div class="field-card">
          <div class="field-label">
            <span class="field-name">BMI</span>
            <span class="field-unit">kg/m²</span>
          </div>
          <div class="field-input-wrap">
            <input
              v-model.number="inputs.bmi"
              type="range"
              min="18.5"
              max="45"
              step="0.1"
              class="field-slider"
            />
            <input
              v-model.number="inputs.bmi"
              type="number"
              min="18.5"
              max="45"
              step="0.1"
              class="field-number"
            />
          </div>
          <div class="field-range">18.5–45 kg/m²</div>
        </div>

        <!-- Binary toggles -->
        <div class="field-card toggle-card">
          <div class="field-label">
            <span class="field-name">吸菸</span>
            <span class="field-unit">過去 30 天內吸菸</span>
          </div>
          <div class="field-btn-group">
            <button
              class="field-btn"
              :class="{ active: !inputs.smoking }"
              @click="inputs.smoking = false"
            >
              否
            </button>
            <button
              class="field-btn"
              :class="{ active: inputs.smoking }"
              @click="inputs.smoking = true"
            >
              是
            </button>
          </div>
        </div>

        <div class="field-card toggle-card">
          <div class="field-label">
            <span class="field-name">糖尿病</span>
            <span class="field-unit">確診第 1 或 2 型糖尿病</span>
          </div>
          <div class="field-btn-group">
            <button
              class="field-btn"
              :class="{ active: !inputs.diabetes }"
              @click="inputs.diabetes = false"
            >
              否
            </button>
            <button
              class="field-btn"
              :class="{ active: inputs.diabetes }"
              @click="inputs.diabetes = true"
            >
              是
            </button>
          </div>
        </div>

        <div class="field-card toggle-card">
          <div class="field-label">
            <span class="field-name">降壓藥</span>
            <span class="field-unit">正在服用抗高血壓藥物</span>
          </div>
          <div class="field-btn-group">
            <button
              class="field-btn"
              :class="{ active: !inputs.antihtn }"
              @click="inputs.antihtn = false"
            >
              否
            </button>
            <button
              class="field-btn"
              :class="{ active: inputs.antihtn }"
              @click="inputs.antihtn = true"
            >
              是
            </button>
          </div>
        </div>

        <div class="field-card toggle-card">
          <div class="field-label">
            <span class="field-name">史達汀</span>
            <span class="field-unit">正在服用史達汀類藥物</span>
          </div>
          <div class="field-btn-group">
            <button
              class="field-btn"
              :class="{ active: !inputs.statin }"
              @click="inputs.statin = false"
            >
              否
            </button>
            <button
              class="field-btn"
              :class="{ active: inputs.statin }"
              @click="inputs.statin = true"
            >
              是
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div class="prevent-result" :class="severityColor">
      <div class="result-left">
        <span class="result-number">{{ activeRisk }}</span>
        <span class="result-unit">%</span>
      </div>
      <div class="result-right">
        <div class="result-top">
          <span class="result-level">{{ ascvdCat.label }}</span>
          <span class="result-en">({{ ascvdCat.en }})</span>
        </div>
        <span class="result-advice">{{ management.advice }}</span>
        <span class="result-detail">{{ management.detail }}</span>
      </div>
    </div>

    <!-- Management bar -->
    <div
      class="mgmt-bar"
      :class="{
        'mgmt-low': ascvdCat.key === 'low',
        'mgmt-border': ascvdCat.key === 'borderline',
        'mgmt-mid': ascvdCat.key === 'intermediate',
        'mgmt-high': ascvdCat.key === 'high',
      }"
    >
      <span class="mgmt-icon">
        {{
          ascvdCat.key === "low"
            ? "○"
            : ascvdCat.key === "borderline"
              ? "△"
              : "●"
        }}
      </span>
      <div class="mgmt-text">
        <strong>2026 ACC/AHA 指引建議：</strong>
        <span>{{ management.tag }} — {{ management.detail }}</span>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">臨床變數明細</div>
      <div v-for="r in detailRows" :key="r.label" class="detail-row">
        <span class="detail-label">{{ r.label }}</span>
        <span class="detail-value" :class="{ 'value-flag': r.flag }">{{
          r.value
        }}</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-label brand-lbl">10 年 ASCVD 風險</span>
        <span class="detail-value positive">{{ ascvdRisk }}%</span>
      </div>
      <div class="detail-row">
        <span class="detail-label brand-lbl">10 年 Total CVD 風險</span>
        <span class="detail-value positive">{{ cvdRisk }}%</span>
      </div>
      <div class="detail-row">
        <span class="detail-label brand-lbl">10 年 HF 風險</span>
        <span class="detail-value positive">{{ hfRisk }}%</span>
      </div>
      <div class="detail-row">
        <span class="detail-label brand-lbl">ASCVD 風險類別</span>
        <span class="detail-value positive"
          >{{ ascvdCat.label }}（{{ ascvdCat.en }}）</span
        >
      </div>
      <div class="detail-row">
        <span class="detail-label brand-lbl">治療建議</span>
        <span class="detail-value">{{ management.advice }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="prevent-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
  </div>
</template>

<style scoped>
.prevent {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ──────────────────────────────────────────────────── */
.prevent-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.header-title {
  flex: 1;
  min-width: 0;
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
  margin: 0 0 0.5rem;
  overflow-wrap: break-word;
  word-break: break-word;
}
.model-tabs {
  display: flex;
  gap: 4px;
}
.model-tab {
  padding: 4px 14px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.model-tab.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.model-tab:hover:not(.active) {
  border-color: var(--vp-c-text-3);
}
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 110px;
  flex-shrink: 0;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-number {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}
.score-label {
  font-size: 0.68rem;
  font-weight: 700;
  margin-top: 2px;
  white-space: nowrap;
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

/* ── Severity bar ─────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 1rem;
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
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
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
.severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}
.tick-threshold {
  color: #f59e0b;
  font-weight: 700;
}

/* ── Risk strip ────────────────────────────────────────────────── */
.risk-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}
.risk-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.5rem 0.3rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-align: center;
  transition: all 0.2s;
}
.risk-pill.risk-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.risk-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.risk-rate {
  font-size: 0.8rem;
  font-weight: 600;
}
.risk-tag {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
.normal-risk {
  color: #22c55e;
}
.mild-risk {
  color: #f59e0b;
}
.moderate-risk {
  color: #f97316;
}
.severe-risk {
  color: #ef4444;
}

/* ── Intro (CPR) ─────────────────────────────────────────────── */
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
  font-weight: 900;
  font-size: 1rem;
}
.cpr-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* ── Group header ────────────────────────────────────────────── */
.prevent-group {
  margin-bottom: 1.25rem;
}
.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
  margin-bottom: 0.6rem;
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
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  min-width: 52px;
  text-align: center;
  border: 1px solid transparent;
}
.group-score-tally.normal {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
}
.group-score-tally.mild {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.25);
}
.group-score-tally.moderate {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
  border-color: rgba(249, 115, 22, 0.25);
}
.group-score-tally.severe {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}

/* ── Fields ────────────────────────────────────────────────────── */
.field-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.field-card {
  padding: 0.75rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}
.field-label {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}
.field-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.field-unit {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.field-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.field-slider {
  flex: 1;
  accent-color: var(--vp-c-brand-1);
  cursor: pointer;
}
.field-number {
  width: 72px;
  padding: 4px 8px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
}
.field-number:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}
.field-range {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}
.field-btn-group {
  display: flex;
  gap: 0.4rem;
}
.field-btn {
  flex: 1;
  padding: 6px 12px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.field-btn.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.field-btn:hover:not(.active) {
  border-color: var(--vp-c-text-3);
}
.toggle-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.toggle-card .field-label {
  margin-bottom: 0;
}
.toggle-card .field-btn-group {
  min-width: 120px;
}

/* ── Result ────────────────────────────────────────────────────── */
.prevent-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  transition: all 0.3s;
}
.prevent-result.normal {
  border-color: #22c55e;
}
.prevent-result.mild {
  border-color: #f59e0b;
}
.prevent-result.moderate {
  border-color: #f97316;
}
.prevent-result.severe {
  border-color: #ef4444;
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
.prevent-result.normal .result-number {
  color: #22c55e;
}
.prevent-result.mild .result-number {
  color: #f59e0b;
}
.prevent-result.moderate .result-number {
  color: #f97316;
}
.prevent-result.severe .result-number {
  color: #ef4444;
}
.result-unit {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.result-top {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.result-level {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-en {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
.result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  font-weight: 600;
}
.result-detail {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.55;
}

/* ── Management bar ─────────────────────────────────────────── */
.mgmt-bar {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
  line-height: 1.6;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.mgmt-low {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.04);
}
.mgmt-border {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.05);
}
.mgmt-mid {
  border-color: rgba(249, 115, 22, 0.4);
  background: rgba(249, 115, 22, 0.05);
}
.mgmt-high {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.05);
}
.mgmt-icon {
  font-size: 1.1rem;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1.6;
}
.mgmt-low .mgmt-icon {
  color: #22c55e;
}
.mgmt-border .mgmt-icon {
  color: #f59e0b;
}
.mgmt-mid .mgmt-icon {
  color: #f97316;
}
.mgmt-high .mgmt-icon {
  color: #ef4444;
}

/* ── Results detail ────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
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
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.detail-label {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  width: 120px;
  flex-shrink: 0;
}
.detail-value {
  font-size: 0.82rem;
  font-weight: 70 0;
  color: var(--vp-c-text-1);
  width: 135px;
  flex-shrink: 0;
  text-align: left;
}
.value-flag {
  color: #ef4444;
}
.positive {
  color: var(--vp-c-brand-1);
}
.brand-lbl {
  font-weight: 700;
  color: var(--vp-c-text-1);
}

/* ── Actions ─────────────────────────────────────────────────── */
.prevent-actions {
  display: flex;
  gap: 8px;
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
.btn-view:active {
  transform: translateY(0);
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

@media (max-width: 640px) {
  .prevent-header {
    flex-wrap: wrap;
  }
  .score-badge {
    align-self: flex-start;
  }
  .score-number {
    font-size: 1.5rem;
  }
  .risk-strip {
    grid-template-columns: repeat(2, 1fr);
  }
  .prevent-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
